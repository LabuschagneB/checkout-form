# React + TypeScript + Vite

## Local setup

Copy `.env.example` → `.env`, `server/.env.example` → `server/.env`, fill in keys, then `npm install`, `npm install --prefix server`, and `npm run dev:full` (or separate dev commands).

## How to run

You need **Node.js** (includes `npm`) installed.

From the **repository root** (where the root `package.json` lives):

| Command | What it does |
|--------|----------------|
| `npm run dev:full` | Starts the Vite frontend and the Express API together (recommended for local dev). |
| `npm run dev` | Frontend only — [http://localhost:5173](http://localhost:5173) (Vite may pick another port if 5173 is busy). |
| `npm run dev:server` | API only — listens on **port 5000** and serves `/api/*`. |

**Two terminals instead of `dev:full`:** run `npm run dev` in one terminal and `npm run dev:server` in another.

The SPA talks to the API through Vite’s dev proxy (`/api` → `http://localhost:5000`), so you usually do not need to change CORS for local development. After editing `.env` or `server/.env`, restart the dev servers so changes load.

**Other scripts:** `npm run build` runs the TypeScript check and production Vite build; `npm run preview` serves the built `dist/` folder; `npm run lint` runs ESLint.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
