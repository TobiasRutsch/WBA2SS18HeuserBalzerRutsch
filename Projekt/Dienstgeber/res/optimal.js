const express = require("express");
const router = express.Router();

const ressourceName = "optimal";


var tankeapikey = "0c2331c6-cc90-9af8-293e-e87df42d2746";
var googlapikey = "AIzaSyBA9X-4wsVcV0r3ZAZyK4PVGUtR5kvxAJw";

//Middleware
router.get('/:lat,:lng', function (req, res) {
    var lat = req.params.lat;
    var lng = req.params.lng;
    var url = "https://creativecommons.tankerkoenig.de/json/list.php?lat=" + lat + "&lng=" + lng + "&rad=1.5&sort=dist&type=all&apikey=" + tankeapikey;


    const request = require('request');

    request(url, { json: true }, (err, res2, body) => {
        if (err) { return console.log(err); }
        dlat = body.stations[0].lat;
        dlng = body.stations[0].lng;
        var gurl = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + lat + "," + lng + "&destinations=" + dlat + "," + dlng + "&key=" + googlapikey;
        request(gurl, { json: true }, (err, res3, body) => {
            if (err) { return console.log(err); }
            var result = JSON.stringify(body);
            res.send("Die Tankstelle ist " + body.rows[0].elements[0].distance.text + "km entfernt.");

        });
    });
});

module.exports = router;