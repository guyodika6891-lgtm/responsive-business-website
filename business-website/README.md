# Northstar Digital

A responsive React + JavaScript business website with a local JSON Server API.

## Requirements

- Node.js 20.19+ (or 22.12+)
- npm

## Start the project

Open PowerShell in this folder and run:

```powershell
npm.cmd install
npm.cmd start
```

`npm.cmd start` starts the React app with Vite and the sample REST API with
JSON Server. Vite prints the website URL (normally `http://localhost:5173`).
The startup script selects the first available API port starting at `5000`
and automatically configures the frontend to use it. The API routes are
`/services`, `/products`, `/blogs`, `/testimonials`, `/messages`, `/orders`,
and `/users`. The shop's product and order seed data is in this folder's
`db.json`, because this is the working directory used by `npm.cmd start`.

To request a particular available API port, set `$env:API_PORT` before running
`npm.cmd start`. `npm.cmd run frontend` starts only the frontend and is not
enough for account registration or API-backed content.

If PowerShell says that scripts are disabled, use `npm.cmd` rather than
`npm`. This avoids changing the machine's PowerShell execution policy.

Set `VITE_API_URL` in a local `.env` file when you need to point the frontend
at a separate API.

## Included features

- Responsive home, about, services, service detail, blog, article detail, and
  contact pages
- API-backed services, articles, testimonials, and contact inquiries
- Service search and category filters
- Light/dark theme toggle
- Customer demo registration, sign-in, inquiry history, and saved services
- Admin demo dashboard with service/blog CRUD, inbox read status/replies, user
  activation controls, and content/message/user counts
- Shop pages for services, physical goods, and digital products, with a saved
  cart and USD/EUR/GBP/OMR prices
- Demo checkout that records an unpaid example order and captures shipping
  details for physical products

## Local-demo authentication and email

The admin demo account is `admin@northstar.local` (the legacy
`admin@example.com` address is also accepted); any non-empty password works.
Admin sign-in is local and does not require the optional FastAPI backend. New
customer accounts and inquiries are stored by JSON Server in `db.json`. The
demo login only keeps a role and user profile in browser storage; it does
**not** verify passwords or issue signed JWTs. JSON Server does not enforce
authorization, and its user records and admin write endpoints are not
protected. Do not deploy this demo API or use it for real accounts or private
customer data.

Likewise, an admin's saved reply is added to the inquiry history; this demo
does not send email. Before production, replace the mock auth and JSON Server
with a backend that verifies password hashes, signs and validates tokens,
enforces authorization for every protected API request, persists data
securely, and sends email from the server.

The demo checkout does not charge a payment method or fulfill an order. Stripe
test checkout is provided by the optional FastAPI backend; configure it using
the instructions in the [project README](../README.md).
