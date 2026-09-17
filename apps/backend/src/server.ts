import "dotenv/config";
import app from "./app.js";
import { createInitialUser } from "./lib/auth/initial-user.js";

const port = Number.parseInt(process.env.PORT ?? "8080", 10);
const host = process.env.HOST ?? "0.0.0.0";

async function startServer() {
  await createInitialUser();

  app.listen(port, host, () => {
    console.log(`Server is listening on http://${host}:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Backend startup failed", error);
  process.exit(1);
});
