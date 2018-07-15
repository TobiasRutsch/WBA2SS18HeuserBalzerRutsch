const express = require("express");
const router = express.Router();
const async = require('async');
const ressourceName = "optimal";

var tankeapikey = "0c2331c6-cc90-9af8-293e-e87df42d2746";
var tankeapikey2 = "aa7779b3-f612-61d7-f276-136314b29f28";
var googlapikey = "AIzaSyBA9X-4wsVcV0r3ZAZyK4PVGUtR5kvxAJw";

//Middleware
router.use(function timelog(req, res, next) {
    console.log('-----------------------');
    console.log('Time: ', Date.now());
    console.log('Method: ', req.method);
    console.log('URL: ', ressourceName + req.url);
    next();
});

router.get('/:lat,:lng,:verbrauch,:btype', function (req, res) {
    var lat = req.params.lat;
    var lng = req.params.lng;
    var verbrauch = req.params.verbrauch;
    var btype = req.params.btype;
    var url = "https://creativecommons.tankerkoenig.de/json/list.php?lat=" + lat + "&lng=" + lng + "&rad=1.5&sort=dist&type=" + btype + "&apikey=" + tankeapikey;
    if (verbrauch < 0 || btype == "diesel" || "e5" || "e10" || lat, lng === "undefined") {
        res.set("Content-Type", 'application/json').status(400).end();
    } else {
        const request = require('request');
        request(url, { json: true }, (err, res2, body1) => {
            if (err) { res.set("Content-Type", 'application/json').status(400).end(); return console.log(err); }
            dlat = body1.stations[0].lat;
            dlng = body1.stations[0].lng;
            var data = new Object;
            data = JSON.parse(JSON.stringify(body1));

            function requestGoogle(n, callback) {
                var gurl = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + lat + "," + lng + "&destinations=" + body1.stations[n].lat + "," + body1.stations[n].lng + "&key=" + googlapikey;
                request(gurl, { json: true }, (err, res3, body2) => {
                    if (err) { res.set("Content-Type", 'application/json').status(400).end(); return console.log(err); }
                    var costres = new Array;
                    realdist = body2.rows[0].elements[0].distance.value / 1000;
                    costs = (body2.rows[0].elements[0].distance.value / 1000) / verbrauch * body1.stations[n].price;
                    data.stations[n]["realdist"] = realdist;
                    data.stations[n]["costs"] = costs;
                    callback(null);
                });

            }
            async.timesSeries(body1.stations.length, requestGoogle, function (err, results) {
                data.stations.sort(function (a, b) {
                    return parseFloat(a.costs) - parseFloat(b.costs);
                });
                res.set("Content-Type", 'application/json').status(200).json(data.stations).end();
            });
        });
    }
});

module.exports = router;
