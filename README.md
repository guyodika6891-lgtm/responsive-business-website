# Northstar Digital

Responsive business website. The frontend app lives in `business-website`; the
root npm scripts run it with the JSON Server API.

## Requirements

- Node.js 20+
- npm

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

`npm run dev` (or `npm.cmd start`) runs both the Vite frontend and JSON Server
API. Vite prints the website URL (normally `http://localhost:5173`); if that
port is busy, use the alternate URL it prints. The API runs at
`http://localhost:5000`. Use `npm.cmd run frontend` only when you intentionally
want to run the frontend without the API.

The API base URL can be changed with `VITE_API_URL` in a local `.env` file.
Sample API data lives in `db.json`.

## Run the FastAPI backend

The optional FastAPI backend is in `backend-api` and requires Python 3.10+ plus
a PostgreSQL database configured by `backend-api\.env`.

From the project root, install its dependencies into the active Python
environment, then start Uvicorn from the backend directory:

```powershell
python -m pip install -r backend-api\requirements.txt
Set-Location backend-api
python -m uvicorn main:app --reload
```

The backend entry point is `backend-api\main.py`, so from that directory the
Uvicorn target is `main:app` (not `app.main:app`).

If you do not already have a virtual environment activated, create and activate
one from the project root before installing:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Make sure the PostgreSQL database named in `backend-api\.env` already exists
before starting the backend.

## Store checkout

The shop includes physical goods, digital products, and services. Catalog prices
are entered separately in USD, EUR, GBP, and OMR from the admin Products and
Services pages. The local demo checkout stores an example order but does not
charge a card or fulfill a purchase.

Stripe test checkout is handled by the optional FastAPI backend. Configure the
PostgreSQL connection and Stripe **test-mode** secrets in
`backend-api\.env` (start from `backend-api\.env.example`), install
`backend-api\requirements.txt`, and run the backend as described above. Set
`STRIPE_SHIPPING_COUNTRIES` to the countries your store can ship to. Physical
Stripe checkout collects the address on Stripe Checkout; digital items and
services do not ask for a shipping address. Use Stripe CLI to forward
`/api/checkout/webhook` to the local backend and set its signing secret in
`STRIPE_WEBHOOK_SECRET`. Orders are not marked paid based on the browser return:
the backend verifies Stripe's webhook first.

Do not use the JSON Server demo or demo accounts for real customers or production
orders. The sample admin/auth flows and local JSON Server are not production
security. Configure Stripe, shipping, tax, delivery, and production-grade access
controls before accepting live payments.
