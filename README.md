# Nobatifa Website — User Application

User-facing frontend for the Nobatifa vehicle service appointment booking platform.
Persian (RTL), responsive (Desktop / Tablet / Mobile), built with Angular + Tailwind CSS.

> Admin dashboard lives in a separate repository and is not part of this project.

## Stack

- Angular 22 (standalone components, signals, typed reactive forms, lazy-loaded routes, SSR)
- TypeScript (strict-ish, no `any` in app code)
- Tailwind CSS v4 (design tokens via `@theme`)
- Vitest for unit tests (`npx ng test`)

## Architecture

```text
UI (features / shared)
  → ports (interfaces + InjectionTokens, no implementation)
  → mock (in-memory gateways with latency + Persian error messages)
```

- Components never import mock data. Raw mock datasets live ONLY in
  `src/app/data-access/mock-data/`.
- Swapping the mock backend with a real API only requires replacing the
  providers returned by `provideMockDataAccess()`. UI stays untouched.

## Folder structure

```text
src/app/
  core/         shell (header/footer/layout), session, auth guard
  shared/ui/    button, input, modal, badge, icon, otp, plate, date-strip,
                slot-card, loading/empty/error states
  features/     home (booking), auth (forms), appointments, cars, invoice, about
  data-access/  models, ports/, mock/, mock-data/
```

## Commands

```bash
npm start        # dev server (http://localhost:4200)
npx ng test      # unit tests (Vitest)
npx ng build     # production build
```

## Design system

- Font: Vazirmatn (local files in `public/fonts/vazirmatn/`, weights 100–900).
- Colors are named tokens in `src/styles/tokens.css` (`primary-*`, `accent-*`,
  `success-*`, `danger-*`, `warning-*`, `info-*`, `gray-*`). Use them by name
  (e.g. `bg-primary-base`); to change a color, edit only that file.
- Icons: `app-icon` component (outline style, Lucide path data). When
  `lucide-angular` supports Angular 22 it can replace the component.

## Mock backend

- Latency: 150ms per call (`MOCK_LATENCY_MS`).
- Fixed OTP code: `1234`.
- Demo service-center code: `1001`.
- Demo user: علیرضا رمضانی / `09128573449`.

## Authentication limitation

Authentication is frontend-mock only (no passwords stored, no tokens verified).
It demonstrates the flow and guards routes, but it is NOT a security boundary.
A real backend must implement it before production use with real data.

## Environment

No secrets are required. `.env*` files (except `.env.example`) are git-ignored.
