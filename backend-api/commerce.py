import json
from decimal import Decimal, InvalidOperation
from pathlib import Path


SUPPORTED_CURRENCIES = {"USD", "EUR", "GBP", "OMR"}
MINOR_UNIT = Decimal("100")
CATALOG_PATH = Path(__file__).resolve().parents[1] / "db.json"


class CatalogError(ValueError):
    pass


def build_checkout_items(items, currency):
    if currency not in SUPPORTED_CURRENCIES:
        raise CatalogError("Choose a supported checkout currency.")
    if not isinstance(items, list) or not items or len(items) > 30:
        raise CatalogError("Your cart must contain between 1 and 30 items.")

    try:
        with CATALOG_PATH.open(encoding="utf-8") as catalog_file:
            catalog = json.load(catalog_file)
    except (OSError, json.JSONDecodeError) as error:
        raise RuntimeError("The store catalog could not be loaded.") from error

    prepared = []
    total_minor = 0
    for cart_item in items:
        catalog_type = cart_item.get("catalogType")
        if catalog_type not in {"service", "product"}:
            raise CatalogError("The cart contains an invalid item type.")
        collection = catalog.get("services" if catalog_type == "service" else "products", [])
        item = next((entry for entry in collection if str(entry.get("id")) == str(cart_item.get("id"))), None)
        if item is None:
            raise CatalogError("A cart item is no longer available.")

        quantity = cart_item.get("quantity")
        if isinstance(quantity, bool) or not isinstance(quantity, int) or not 1 <= quantity <= 10:
            raise CatalogError("Each item quantity must be between 1 and 10.")

        try:
            price = Decimal(str(item.get("prices", {}).get(currency, "")))
        except InvalidOperation as error:
            raise CatalogError(f"{item.get('title', 'An item')} has no valid {currency} price.") from error
        if not price.is_finite() or price <= 0 or price * MINOR_UNIT != (price * MINOR_UNIT).to_integral_value():
            raise CatalogError(f"{item.get('title', 'An item')} has no valid {currency} price.")

        unit_amount = int(price * MINOR_UNIT)
        total_minor += unit_amount * quantity
        prepared.append({
            "catalog_type": catalog_type,
            "id": str(item["id"]),
            "title": str(item.get("title", "Store item"))[:120],
            "description": str(item.get("description", ""))[:500],
            "type": item.get("type", "service"),
            "quantity": quantity,
            "unit_amount": unit_amount,
        })

    if total_minor <= 0:
        raise CatalogError("The order total must be greater than zero.")
    return prepared, total_minor
