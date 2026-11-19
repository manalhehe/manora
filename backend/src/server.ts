import dotenv from "dotenv";
import { createApp } from "./app";
import { getConfig } from "./config/env";

dotenv.config();

const { port } = getConfig();
const app = createApp();

app.listen(port, () => {
  console.log(`MANORA server running on port ${port}`);
});