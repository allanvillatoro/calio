# CALIO Joyería

E-commerce application built with Next.js for the CALIO Joyería catalog. It includes a landing page, catalog, product detail pages, cookie-based JWT authentication, and an admin panel for creating, editing, and deleting products.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- TanStack Query
- Drizzle ORM
- PostgreSQL / Neon
- JWT with `jose`
- Axios
- Sonner
- Zustand
- `@react-pdf/renderer`

## Features

- Public landing page
- Catalog with filters, pagination, and print view
- Product detail pages
- Shopping cart persisted in `localStorage`
- Cart page with quantity controls, subtotal, WhatsApp order message, and downloadable PDF order summary
- JWT-based login
- Server-side protection for the `/admin` route
- Admin panel for product CRUD
- Product mutations with Server Actions
- Product reads with React Query

## Project Structure

```text
app/
  admin/                  # Protected admin panel route
  api/
    products/             # Product REST endpoints
    users/                # Login and logout
  catalogo/               # Catalog page
  carrito/                # Shopping cart page
  login/                  # Login page
  productos/[id]/         # Product detail page

components/
  admin/                  # Create/edit/delete dialogs
  auth/                   # LoginForm
  cart/                   # Cart content, cart rows, and PDF order document
  catalog/                # Grid, filters, cards, pagination
  product/                # Product detail components
  ui/                     # Base UI components

lib/
  actions/                # Client actions and server actions
  api/                    # Axios clients
  hooks/                  # Reusable hooks
  repositories/           # Data access with Drizzle
  stores/                 # Zustand stores for auth and cart state
  auth.ts                 # Server-side JWT and cookie helpers

db/
  schema.ts               # products and users tables
  config.ts               # test/production DB selection
```

## Environment Variables

Main environment variables currently used by the project:

```bash
DB_TARGET=testing
TEST_DATABASE_URL=
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_STREET_ADDRESS=
NEXT_PUBLIC_POSTAL_CODE=
```

Cloudinary notes:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is public and used to resolve image URLs
- `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are server-only and used by Server Actions to upload product images
- `NEXT_PUBLIC_SITE_URL` is used for canonical URLs and product links in generated cart PDFs
- `NEXT_PUBLIC_CONTACT_PHONE` is used by client-side WhatsApp links, including the cart order message

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the local database:

```bash
npm run localdb:up
```

3. Apply migrations or push the schema:

```bash
npm run db:push
```

4. Start the app:

```bash
npm run dev
```

5. Open:

```text
http://localhost:3000
```

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run format:check
npm run localdb:up
npm run localdb:down
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```

## Authentication

- Login lives at `POST /api/users/login`
- The backend generates a JWT and stores it in an `httpOnly` cookie
- The login response no longer exposes the token to the frontend
- Client requests rely on the browser sending the cookie automatically
- Client auth state is checked through `GET /api/users/session`
- Product Server Actions validate authentication on the server
- The `/admin` route is protected server-side using the JWT cookie

## Products and Data

- Products are stored in PostgreSQL
- Product images are uploaded to Cloudinary from Server Actions
- Only the final Cloudinary file name (for example `image-name.webp`) is stored in the database
- Product images are resolved from Cloudinary using that stored file name
- The catalog uses React Query for reads
- Create, update, and delete product flows use Server Actions

## Shopping Cart

- Cart state is managed with Zustand in `lib/stores/cart.store.ts`
- Cart contents persist in browser `localStorage` under the `calio-cart` key
- Products can be added from catalog cards and product detail pages
- Cart quantity changes are capped by each product's available `quantity`
- `/carrito` lists each cart product with image, title, description, quantity controls, price, and subtotal
- The cart can generate and download a PDF order summary using `@react-pdf/renderer`
- Product names in the generated PDF link to `NEXT_PUBLIC_SITE_URL/productos/{id}`
- The WhatsApp button opens a prefilled order message; the user must manually attach the downloaded PDF

## Current Status

- Product admin CRUD is implemented
- Login and logout are implemented
- Session check endpoint is implemented
- `/admin` is protected
- Navbar includes basic authentication-aware behavior
- Catalog is connected to the backend with filters and pagination
- Cart flow is implemented with persisted state, inventory-aware quantity controls, PDF download, and WhatsApp order message

## Notes

- Authentication is handled through `httpOnly` cookies, so the JWT is not readable from frontend JavaScript.
