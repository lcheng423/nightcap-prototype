# Nightcap Prototype

Mobile-first reflection prototype now migrated to SvelteKit.

## Tech Stack

- SvelteKit 2 + Svelte 5
- Vite 5

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run preview` - run production preview server
- `npm run check` - run `svelte-check`

## Project Structure

- `/src/routes/(tabs)` - tab shell and tab pages (`/`, `/today`, `/threads`)
- `/src/routes/reflection` - reflection flow
- `/src/routes/insight` - insight reveal screen
- `/src/routes/card/[id]` - card detail route
- `/src/routes/score/[slug]` - score detail route
- `/src/lib/components` - shared Svelte UI components
- `/src/lib/data` - shared route data
