# CALIO Codex Instructions

This file is for coding-agent behavior. Use `README.md` for project overview, setup, full stack, environment variables, and broad feature documentation.

## Working Principles

- Read nearby code before editing; prefer existing patterns over new architecture.
- Keep changes scoped to the user's request.
- Do not modernize or reorganize broad areas while fixing narrow issues.
- TypeScript is strict; do not weaken types to silence errors.
- Prefer simple, readable code with descriptive names.
- Follow SOLID for new code, especially Single Responsibility Principle.
- Use dependency injection when it improves testability or keeps infrastructure details out of domain logic.
- Follow DRY by reusing existing schemas, helpers, repositories, hooks, and UI primitives, but avoid premature abstractions.
- Do not add `useMemo` or `useCallback` by default; React Compiler is enabled. Use them only when there is a specific correctness or performance reason that React Compiler does not cover.
- Add comments only for non-obvious intent or constraints.

## Planning And Approval

- For non-trivial code changes, provide a concise implementation plan in chat before editing files.
- Wait for the user to approve the plan or request changes before modifying files.
- If the user requests changes to the plan, revise it in chat and wait for approval again.
- Do not create planning files by default; use chat for review and iteration.
- If the user explicitly asks for an editable plan file, create it in a separate planning document before making code changes.
- For trivial changes, read-only analysis, or commands that do not modify files, a plan is not required.

## Structure Decisions

- Follow Next.js App Router conventions for routes, layouts, metadata, route handlers, and Server/Client Component boundaries.
- The repo uses a mix of Next.js convention-based structure and feature-oriented folders; match the nearest existing pattern.
- Keep route files in `app/`.
- Put shared UI in `components/`, reusable client behavior in `lib/hooks`, Zustand state in `lib/stores`, and server-only persistence in `lib/repositories`.
- Keep cross-cutting constants, helpers, schemas, and actions in `lib/` or the nearest existing matching folder.

## Data Flow

- Product reads should flow through `getProductsByQuery`, `/api/products`, and `productsRepository.findAll`.
- Product create/update/delete from the admin UI should flow through Server Actions in `lib/actions/product-mutations.action.ts`.
- Product/user persistence should go through repository interfaces and implementations in `lib/repositories`.
- Use Zod schemas in `app/api/**/schemas.ts` for request validation and `formatZodError` for consistent validation responses.
- Protect server-only DB/repository code with `import 'server-only'` when it may be imported accidentally from client code.
- Use `@/` imports for project modules.

## Auth And Security

- Never expose JWTs or auth cookies to frontend JavaScript.
- Login should return user data only; auth tokens belong in the `calio_auth_token` `httpOnly` cookie.
- `/admin` and product Server Actions must validate auth on the server.
- Never commit secrets, API keys, JWT secrets, database URLs, Cloudinary credentials, or `.env` files.
- Keep server-only secrets out of client components and out of `NEXT_PUBLIC_*` variables.
- Validate and sanitize user input with existing Zod schemas or validation helpers.
- Use Drizzle query builders or parameterized queries; never build SQL with string concatenation.
- Do not expose stack traces or raw DB errors in API responses.
- Do not run production-changing database commands unless the user explicitly confirms the production target.

## AI Data Safety

- Never output, log, echo, or embed PII, secrets, tokens, password hashes, production URLs, private customer/order data, or database contents.
- If sensitive data appears in tool output, do not repeat the value; summarize that sensitive data was encountered and redact it.
- Do not send workspace data, `.env` values, DB data, screenshots, or customer/admin data to external services unless the user explicitly approves the exact service and purpose.
- Use placeholders in examples, such as `<email>`, `<product_id>`, `<database_url>`, and `<jwt_secret>`.
- Treat WhatsApp contact data, customer names, phone numbers, addresses, order details, and admin credentials as sensitive.

## Testing

- Vitest is the unit test runner.
- Use `npm run test`, `npm run test:watch`, and `npm run test:coverage`.
- There is no minimum coverage threshold yet; do not add one unless requested.
- Every new feature, behavior change, bug fix, or refactor should include corresponding unit tests in the same change.
- When refactoring existing behavior, use TDD: write tests for current expected behavior first, refactor second, then verify tests still pass.
- Use AAA test structure: Arrange, Act, Assert.
- Test names should describe behavior, for example `it('returns false when product quantity is exhausted')`.
- New unit test files should use the `.test.ts` or `.test.tsx` suffix, not `.spec.ts` or `.spec.tsx`.
- Prefer unit tests for pure helpers, hooks, stores, validation schemas, and repository/domain logic with injected dependencies.
- Mock external dependencies such as Cloudinary, network clients, cookies, and database calls.
- Never use production services or production databases in tests.
- Keep fixtures small and free of real customer/admin data.

## Product Rules

- Valid product categories are defined in `lib/constants/product-categories.ts`; do not duplicate or silently rename category slugs.
- Product images stored in the database are Cloudinary filenames only, not full URLs; resolve with `getImageUrl`.
- Products require at least one image.
- `discount` must be `0` outside category `rebajas`.
- In `rebajas`, `discount` must be an integer from 1 to 99.
- `priceWithDiscount` is derived in repository mapping, not stored in the database.
- Public product lists exclude out-of-stock items by default; authenticated product list requests include them.
- Cart quantity must not exceed the product's available `quantity`.

## Catalog And Cart Conventions

- Public catalog URL params are Spanish: `categorias`, `pagina`, `entienda`, `modoprint`, `query`.
- Internal product API query params are English: `category`, `page`, `instore`, `limit`, `query`.
- `useCatalogFilters` owns catalog URL state; do not duplicate URL parsing.
- `modoprint=true` hides admin/search UI for print-oriented catalog views.
- `entienda=true` filters products available in the physical store.
- Cart state persists under the `calio-cart` localStorage key.
- WhatsApp order flow cannot auto-attach PDFs; do not imply that it can.

## UI Rules

- Preserve Spanish labels and the current retail tone in user-facing UI.
- New customer-facing UI text should be Spanish unless the surrounding UI is already English.
- Prefer existing components and patterns before introducing new UI libraries.
- Prefer existing shadcn/ui controls in `components/ui` before building custom controls with Tailwind classes.
- Use `cn` from `lib/utils.ts` for class merging.
- Use lucide-react icons where icons are already part of a control.
- Keep forms consistent with `react-hook-form` patterns used by `ProductDialog` and `useProductDialogForm`.
- Product admin feedback should use Sonner toasts and field-level errors where possible.

## Verification

- For code changes, run the narrowest useful checks first, then broader checks when risk warrants it.
- Prefer `npm run test` for logic changes, `npm run lint` for TypeScript/React edits, and `npm run build` for routing, server/client boundary, or Next.js behavior changes.
- If a requested change cannot include tests yet, state why and identify the missing coverage.
