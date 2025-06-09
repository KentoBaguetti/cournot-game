"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const app = (0, express_1.default)();
const PORT = 3001;
const server = (0, node_http_1.createServer)(app); // get the underlying server for socketIO -- to get low level access
server.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
});
app.get("/", (req, res) => {
    res.json({ "message": "Hello" });
    console.log("Root hit");
});
