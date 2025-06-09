import express from "express";
import type { Express } from "express";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const app: Express = express();
const PORT: number = 3001;

const server = createServer(app); // get the underlying server for socketIO -- to get low level access
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, "../public")))

server.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
})

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "index.html"));
}) 
