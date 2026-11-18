import json
import logging
import os
import re
import uuid
from decimal import Decimal

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

import models
import schemas
from commerce import CatalogError, build_checkout_items
from database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


def stripe_test_keys_configured():
    return (
        bool(stripe.api_key)
        and stripe.api_key.startswith("sk_test_")
        and bool(os.getenv("STRIPE_WEBHOOK_SECRET"))
    )


@router.post("/sessions", status_code=201)
def create_checkout_session(payload: schemas.CheckoutSessionCreate, db: Session = Depends(get_db)):
    if not stripe_test_keys_configured():
        raise HTTPException(
            status_code=503,
            detail="Stripe test checkout is not configured. Set a test secret key and webhook secret in backend-api/.env.",
        )
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", payload.email):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")

    cart_items = [item.model_dump() for item in payload.items]
    try:
        items, total_minor = build_checkout_items(cart_items, payload.currency)
    except CatalogError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    needs_shipping = any(item["type"] == "physical" for item in items)
    allowed_countries = []
    if needs_shipping:
        allowed_countries = [
            country.strip().upper()
            for country in os.getenv("STRIPE_SHIPPING_COUNTRIES", "US,GB,OM").split(",")
            if country.strip()
        ]
        if not allowed_countries or any(len(country) != 2 or not country.isalpha() for country in allowed_countries):
            raise HTTPException(status_code=503, detail="Configure valid STRIPE_SHIPPING_COUNTRIES before enabling physical-product checkout.")

    order_id = str(uuid.uuid4())
    order = models.Order(
        id=order_id,
        customer_email=payload.email.lower(),
        currency=payload.currency,
        total_minor=total_minor,
        status="pending",
        items=items,
    )
    db.add(order)
    db.commit()

    session_payload = {
        "mode": "payment",
        "customer_email": payload.email.lower(),
        "client_reference_id": order_id,
        "metadata": {"order_id": order_id},
        "line_items": [
            {
                "price_data": {
                    "currency": payload.currency.lower(),
                    "unit_amount": item["unit_amount"],
                    "product_data": {
                        "name": item["title"],
                        "description": item["description"],
                    },
                },
                "quantity": item["quantity"],
            }
            for item in items
        ],
        "success_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
        "cancel_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/cart?checkout=cancelled",
    }

    if needs_shipping:
        session_payload["shipping_address_collection"] = {"allowed_countries": allowed_countries}
        session_payload["shipping_options"] = [{
            "shipping_rate_data": {
                "type": "fixed_amount",
                "fixed_amount": {"amount": 0, "currency": payload.currency.lower()},
                "display_name": "Free shipping",
            },
        }]

    try:
        checkout_session = stripe.checkout.Session.create(**session_payload)
    except stripe.StripeError as error:
        order.status = "checkout_failed"
        db.commit()
        logger.warning("Stripe checkout session creation failed: %s", error.user_message or error.__class__.__name__)
        raise HTTPException(status_code=502, detail="Stripe could not start checkout. Check the Stripe test account and selected currency.") from error

    order.stripe_session_id = checkout_session.id
    db.commit()
    return {"url": checkout_session.url}


@router.get("/sessions/{session_id}")
def get_checkout_status(session_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.stripe_session_id == session_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found.")
    return {
        "status": order.status,
        "currency": order.currency,
        "total": format(Decimal(order.total_minor) / Decimal("100"), ".2f"),
    }


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(default="", alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook verification is not configured.")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, webhook_secret)
    except (ValueError, stripe.SignatureVerificationError) as error:
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature or payload.") from error

    event_type = event["type"]
    if event_type not in {
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "checkout.session.expired",
    }:
        return {"received": True}

    session_data = event["data"]["object"].to_dict_recursive()
    order_id = session_data.get("metadata", {}).get("order_id")
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None:
        return {"received": True}

    if event_type in {"checkout.session.completed", "checkout.session.async_payment_succeeded"}:
        order.status = "paid" if session_data.get("payment_status") == "paid" or event_type.endswith("succeeded") else "processing"
        shipping_details = session_data.get("shipping_details")
        if shipping_details:
            order.shipping_address = json.loads(json.dumps(shipping_details))
    elif event_type == "checkout.session.async_payment_failed":
        order.status = "payment_failed"
    else:
        order.status = "expired"

    db.commit()
    return {"received": True}
