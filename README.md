# CALIO Joyería

E-commerce application built with Next.js for the CALIO Joyería catalog. It includes a landing page, catalog, product detail pages, JWT authentication, and an admin panel for creating, editing, and deleting products.

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

## Features

- Public landing page
- Catalog with filters, pagination, and print view
- Product detail pages
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
  login/                  # Login page
  productos/[id]/         # Product detail page

components/
  admin/                  # Create/edit/delete dialogs
  auth/                   # LoginForm
  catalog/                # Grid, filters, cards, pagination
  product/                # Product detail components
  ui/                     # Base UI components

lib/
  actions/                # Client actions and server actions
  api/                    # Axios clients
  hooks/                  # Reusable hooks
  repositories/           # Data access with Drizzle
  auth.ts                 # Server-side JWT helpers
  auth-client.ts          # Client-side token helpers

db/
  schema.ts               # products and users tables
  config.ts               # local/production DB selection
```

## Environment Variables

Main environment variables currently used by the project:

```bash
DB_TARGET=local
LOCAL_DATABASE_URL=
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CONTACT_PHONE=
NEXT_PUBLIC_STREET_ADDRESS=
NEXT_PUBLIC_POSTAL_CODE=
```

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
- The backend generates a JWT and also stores it in an `httpOnly` cookie
- On the client, the token is stored in `localStorage` for authenticated `Bearer` requests
- Product Server Actions validate authentication on the server
- The `/admin` route is protected server-side using the JWT cookie

## Products and Data

- Products are stored in PostgreSQL
- Product images are resolved from Cloudinary using the file name
- The catalog uses React Query for reads
- Create, update, and delete product flows use Server Actions

## Current Status

- Product admin CRUD is implemented
- Login and logout are implemented
- `/admin` is protected
- Navbar includes basic authentication-aware behavior
- Catalog is connected to the backend with filters and pagination

## Notes

- Client-side authentication state is a lightweight heuristic based on the locally stored JWT; real authorization still happens on the server.
- If the client token expires, `auth-client.ts` clears it automatically.
