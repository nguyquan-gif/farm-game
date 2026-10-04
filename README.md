# Green Valley Farm — Local Game

## Run locally

1. Install Node.js 20 or newer.
2. Open a terminal in this folder.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local address shown by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The game saves progress in the browser using `localStorage`. Use the Reset button in the game menu to restart.

## Files

- `src/App.jsx`: game systems, screens, missions, interactions
- `src/styles.css`: mobile-first UI
- `index.html`: Vite entry document
