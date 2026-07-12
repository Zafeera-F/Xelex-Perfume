// Server entry point
// -----------------------------------------------------------------------------
// This is the file `npm start`/`npm run dev` actually runs. It's kept
// separate from app.js on purpose: app.js is the "what" (middleware, routes),
// this file is the "how it boots" (env vars, port, the listen() call).

import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`XeleX Perfumes API running on http://localhost:${PORT}`);
});
