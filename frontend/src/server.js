const express =
require("express");

const cors =
require("cors");

const app =
express();

app.use(cors());

app.use(
express.json()
);

const busRoutes =
require(
"./routes/busStopRoutes"
);

app.use(
"/api/busstops",
busRoutes
);

app.listen(
5000,
() => {
console.log(
"Server Running on Port 5000"
);
}
);