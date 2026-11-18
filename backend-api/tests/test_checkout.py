import asyncio
import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["STRIPE_SECRET_KEY"] = ""

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.requests import Request

import models
import schemas
from routers import checkout


class CheckoutRouteTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        models.Base.metadata.create_all(bind=self.engine)
        self.session = sessionmaker(bind=self.engine)()

    def tearDown(self):
        self.session.close()
        self.engine.dispose()

    def test_stripe_session_uses_server_catalog_prices_and_shipping_rules(self):
        payload = schemas.CheckoutSessionCreate(
            email="shopper@example.com",
            currency="USD",
            items=[{"catalogType": "product", "id": "studio-mug", "quantity": 2, "unit_amount": 1}],
        )
        stripe_result = SimpleNamespace(id="cs_test_mug", url="https://checkout.stripe.test/session")
        with patch.object(checkout.stripe, "api_key", "sk_test_example"), \
                patch.dict(os.environ, {"STRIPE_WEBHOOK_SECRET": "whsec_example", "STRIPE_SHIPPING_COUNTRIES": "OM,GB"}), \
                patch.object(checkout.stripe.checkout.Session, "create", return_value=stripe_result) as create_session:
            response = checkout.create_checkout_session(payload, self.session)

        self.assertEqual(response["url"], stripe_result.url)
        session_payload = create_session.call_args.kwargs
        self.assertEqual(session_payload["line_items"][0]["price_data"]["unit_amount"], 1800)
        self.assertEqual(session_payload["line_items"][0]["quantity"], 2)
        self.assertEqual(session_payload["shipping_address_collection"]["allowed_countries"], ["OM", "GB"])
        self.assertEqual(session_payload["shipping_options"][0]["shipping_rate_data"]["fixed_amount"]["amount"], 0)
        order = self.session.query(models.Order).filter_by(stripe_session_id="cs_test_mug").one()
        self.assertEqual(order.total_minor, 3600)
        self.assertEqual(order.status, "pending")

    def test_stripe_order_is_marked_paid_only_after_a_webhook(self):
        payload = schemas.CheckoutSessionCreate(
            email="shopper@example.com",
            currency="USD",
            items=[{"catalogType": "product", "id": "studio-mug", "quantity": 1}],
        )
        stripe_result = SimpleNamespace(id="cs_test_paid", url="https://checkout.stripe.test/session")
        with patch.object(checkout.stripe, "api_key", "sk_test_example"), \
                patch.dict(os.environ, {"STRIPE_WEBHOOK_SECRET": "whsec_example"}), \
                patch.object(checkout.stripe.checkout.Session, "create", return_value=stripe_result):
            checkout.create_checkout_session(payload, self.session)

        session_object = SimpleNamespace(to_dict_recursive=lambda: {
            "metadata": {"order_id": self.session.query(models.Order).filter_by(stripe_session_id="cs_test_paid").one().id},
            "payment_status": "paid",
            "shipping_details": {"address": {"country": "OM"}},
        })
        event = {"type": "checkout.session.completed", "data": {"object": session_object}}
        request = Request(
            {"type": "http", "method": "POST", "path": "/api/checkout/webhook", "headers": [],
             "query_string": b"", "server": ("test", 80), "client": ("test", 1), "scheme": "http"},
            self._receive_empty_body,
        )
        with patch.dict(os.environ, {"STRIPE_WEBHOOK_SECRET": "whsec_example"}), \
                patch.object(checkout.stripe.Webhook, "construct_event", return_value=event):
            response = asyncio.run(checkout.stripe_webhook(request, "verified", self.session))

        order = self.session.query(models.Order).filter_by(stripe_session_id="cs_test_paid").one()
        self.assertTrue(response["received"])
        self.assertEqual(order.status, "paid")
        self.assertEqual(order.shipping_address["address"]["country"], "OM")

    @staticmethod
    async def _receive_empty_body():
        return {"type": "http.request", "body": b"{}", "more_body": False}


if __name__ == "__main__":
    unittest.main()
