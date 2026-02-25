## Quick project overview

- This is a Create React App (CRA) single-page app for account/transaction management. Primary source is under `src/` and static output is `build/`.
- Key runtime pieces: React Router v6 (`src/Router.js`) with lazy-loaded routes, a global `LanguageProvider` (`src/language/LanguageContext`), and a `Rootlayout` wrapper for authenticated app UI.

## How to run / build / test

- Install: `npm install`
- Dev server: `npm start` (CRA default)
- Production build: `npm run build` (outputs `build/`)
- Tests: `npm test` (uses react-scripts / React Testing Library)

## Important files & integration points

- API endpoints & keys: `src/components/common/CommonApiURL.js` — contains `BASE_URL`, `SAVE_PAYMENT_ORDER_API`, `VERIFY_PAYMENT_API`, `REACT_APP_RAZORPAY_KEY_ID`, and Google Translate key. Note: live `BASE_URL` is set to `https://successapi.azurewebsites.net/api/` and some local URLs are commented out in the same file.
- Routing and authorization: `src/Router.js` shows role-gated routes using a `ProtectedRoute` component and `allowedRoles` like `SU`, `AU`, `NU`, `MU`.
- Shared UI and layout: `src/components/common/Rootlayout` and `src/components/common/ProtectedRoute` hold app-shell and auth patterns.
- Internationalization: `src/language/i18n.js` and `src/language/LanguageContext.js` handle i18n and the site-wide `LanguageProvider` used in `src/App.js`.
- Forms & validation: `react-hook-form`, `formik`, and `yup` are present; see `validations/ValidationSchema.js` for canonical schemas.
- Payments: example implementation in `src/components/screen/PricingPage.jsx` — it posts to `SAVE_PAYMENT_ORDER_API`, then opens Razorpay checkout and posts to `VERIFY_PAYMENT_API` to confirm payments.

## Project-specific patterns & gotchas for code edits

- Lazy route imports are used per-route (see `Router.js`); follow that pattern for new large screens to keep bundle size small.
- CSS files are colocated with components (e.g., `PricingPage.css`). Prefer this local-style convention unless the change is global.
- Role-based access is enforced by `ProtectedRoute` using an `allowedRoles` prop — new guarded routes should reuse that component rather than duplicating logic.
- API constants live in `CommonApiURL.js`. The repo currently hardcodes some keys and the live `BASE_URL` there; to run against a local API, edit that file (a local URL is already present but commented). There is no `.env`-based convention consistently used in the codebase, so check `CommonApiURL.js` before changing runtime values.

## Common axios/fetch inconsistencies to watch for

- Codebase mixes `axios` and fetch-style call patterns. Example: `PricingPage.jsx` calls `axios.post(VERIFY_PAYMENT_API, { method:'POST', headers:..., body: JSON.stringify(...) })` and then attempts `verificationResponse.json()` — this indicates a misuse of axios (axios returns `response.data`). When editing API calls, prefer consistent `axios.post(url, data)` and use `response.data`.
- Similarly, order creation expects `orderResponse.data` with `{ amount, orderId }` — follow that shape when mocking or calling the endpoint.

## Conventions for new work

- Use existing component folders under `src/components/screen` or `src/components/common`.
- Add unit tests with React Testing Library when changing component behavior; the project already includes `@testing-library/*` deps.
- Keep UI changes modular: add CSS in `components/.../css/<Component>.css` and import it in the component.

## Quick examples (copyable)

- Create a lazy route (follow `Router.js`):

  const NewScreen = lazy(() => import("./components/screen/NewScreen"));

- Post to payment order API (follow PricingPage pattern):

  const { amount, orderId } = (await axios.post(SAVE_PAYMENT_ORDER_API, payload)).data;

  // open Razorpay with `order_id: orderId`

- Correct axios verification pattern (fix example from PricingPage):

  const verificationResponse = await axios.post(VERIFY_PAYMENT_API, {
    RazorpayOrderId: response.razorpay_order_id,
    RazorpayPaymentId: response.razorpay_payment_id,
    RazorpaySignature: response.razorpay_signature,
    Plan: plan.id
  });
  const verificationData = verificationResponse.data;

## Where to look next

- For routing & auth: `src/Router.js`, `src/components/common/ProtectedRoute.js`
- For API shapes and live endpoints: `src/components/common/CommonApiURL.js`
- For translations and i18n init: `src/language/i18n.js` and `src/language/LanguageContext.js`

If you'd like, I can (1) scan for other axios/fetch mistakes and propose fixes, or (2) open a PR updating the payment verification snippet to use `axios` correctly. Which should I do next?
