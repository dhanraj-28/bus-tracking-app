const busStopService =
require("../services/busStopService");

const getNearbyBusStops =
async (req, res) => {

try {

const {
latitude,
longitude,
} =
req.query;

if(
!latitude ||
!longitude
){

return res.status(400).json({
message:
"Latitude and Longitude required",
});

}

const stops =
await busStopService
.fetchNearbyBusStops(
latitude,
longitude
);

return res.status(200).json(
stops
);

}
catch(error){

console.log(
"CONTROLLER ERROR",
error
);

return res.status(500).json([]);

}

};

module.exports = {
getNearbyBusStops,
};