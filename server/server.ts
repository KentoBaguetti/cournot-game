import express from "express";
import type { Express } from "express";
import { createServer } from "node:http";

const app: Express = express();
const PORT: number = 3001;

const server = createServer(app); // get the underlying server for socketIO -- to get low level access

server.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
})

app.get("/", (req, res) => {
    res.json({"message" : "Hello"});
    console.log("Root hit");
}) 
