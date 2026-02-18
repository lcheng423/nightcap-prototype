# Nightcap Prototype

Prototype of a mobile-first reflection experience built with Next.js App Router.

## Tech Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- ESLint 9 (`eslint-config-next`)

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run lint` - run ESLint

## Project Structure

- `src/app/(tabs)` - tab shell and tab pages (`/`, `/today`, `/threads`)
- `src/app/reflection` - evening reflection flow
- `src/app/insight` - insight reveal screen
- `src/app/card/[id]` - card detail animation route
- `src/app/components` - shared UI pieces (`TopBar`, `NavBar`)
