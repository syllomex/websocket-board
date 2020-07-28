const express = require("express");
const app = express();
const cors = require("cors");

const http = require("http").Server(app);
require("./socket")(http);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 80;
http.listen(PORT, console.log("running server"));
