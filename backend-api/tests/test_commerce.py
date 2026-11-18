import unittest

from commerce import CatalogError, build_checkout_items


class CheckoutCatalogTests(unittest.TestCase):
    def test_uses_the_server_catalog_price_and_currency_minor_units(self):
        items, total_minor = build_checkout_items(
            [{"catalogType": "product", "id": "studio-mug", "quantity": 2}],
            "EUR",
        )

        self.assertEqual(items[0]["unit_amount"], 1650)
        self.assertEqual(total_minor, 3300)

    def test_service_can_be_purchased_using_its_configured_currency_price(self):
        items, total_minor = build_checkout_items(
            [{"catalogType": "service", "id": "1", "quantity": 1}],
            "USD",
        )

        self.assertEqual(items[0]["title"], "Web Development")
        self.assertEqual(total_minor, 99900)

    def test_rejects_unknown_items_and_currencies(self):
        with self.assertRaises(CatalogError):
            build_checkout_items([{"catalogType": "product", "id": "missing", "quantity": 1}], "USD")

        with self.assertRaises(CatalogError):
            build_checkout_items([{"catalogType": "product", "id": "studio-mug", "quantity": 1}], "CAD")

    def test_rejects_quantities_outside_the_checkout_limit(self):
        with self.assertRaises(CatalogError):
            build_checkout_items([{"catalogType": "product", "id": "studio-mug", "quantity": 11}], "USD")


if __name__ == "__main__":
    unittest.main()
