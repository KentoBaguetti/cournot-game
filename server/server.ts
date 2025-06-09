import express from "express";

const app = express();
const PORT: number = 3001;

app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
})

app.get("/", (req, res) => {
    res.json({"message" : "Hello"});
    console.log("Root hit");
}) 
