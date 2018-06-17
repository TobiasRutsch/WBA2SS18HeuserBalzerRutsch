const express = require("express");
const router = express.Router();

const ressourceName = "price";


var tankeapikey = "0c2331c6-cc90-9af8-293e-e87df42d2746";
var googlapikey = "AIzaSyBA9X-4wsVcV0r3ZAZyK4PVGUtR5kvxAJw";

//Middleware
router.get('/:id,:lat,:lng', function (req, res) {
    var id = req.params.id;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var url = "https://creativecommons.tankerkoenig.de/json/detail.php?id=" + id + "&apikey=" + tankeapikey;
    var urlp = "https://creativecommons.tankerkoenig.de/json/prices.php?id=" + id + "&apikey=" + tankeapikey;


    const request = require('request');

    request(url, { json: true }, (err, res2, body1) => {
        if (err) { return console.log(err); }
        dlat = body1.station.lat;
        dlng = body1.station.lng;
        var station = JSON.stringify(body1.station);
        var gurl = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + lat + "," + lng + "&destinations=" + dlat + "," + dlng + "&key=" + googlapikey;
        request(gurl, { json: true }, (err, res3, body2) => {
            if (err) { return console.log(err); }
            var googlemaps = JSON.stringify(body2);
            request(urlp, { json: true }, (err, res4, body3) => {
                if (err) { return console.log(err); }
                var prices = JSON.stringify(body3.prices);
                res.send(station + "{Entfernung: " + body2.rows[0].elements[0].distance.text + prices + "};");
    
            });

        });
    });
});

module.exports = router;