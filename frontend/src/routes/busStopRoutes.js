const express =
require("express");

const router =
express.Router();

const {
getNearbyBusStops,
} =
require(
"../controllers/busStopController"
);

router.get(
"/nearby",
getNearbyBusStops
);

module.exports =
router;