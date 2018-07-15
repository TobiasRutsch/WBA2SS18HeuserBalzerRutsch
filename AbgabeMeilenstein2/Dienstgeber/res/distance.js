const express = require("express");
const router = express.Router();
const request = require('request');
const ressourceName = "distance";


var tankeapikey = "0c2331c6-cc90-9af8-293e-e87df42d2746";
var googlapikey = "AIzaSyBA9X-4wsVcV0r3ZAZyK4PVGUtR5kvxAJw";


router.use(function timelog(req, res, next) {
    console.log('-----------------------');
    console.log('Time: ', Date.now());
    console.log('Method: ', req.method);
    console.log('URL: ', ressourceName + req.url);
    next();
});

router.get('/:id,:lat,:lng', function (req, res) {
    var id = req.params.id;
    var lat = req.params.lat;
    var lng = req.params.lng;
    var url = "https://creativecommons.tankerkoenig.de/json/detail.php?id=" + id + "&apikey=" + tankeapikey;

    request(url, { json: true }, (err, res2, body) => {
        if (err) { res.set("Content-Type", 'application/json').status(404).end(); return console.log(err); }
        dlat = body.station.lat;
        dlng = body.station.lng;
        var gurl = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=" + lat + "," + lng + "&destinations=" + dlat + "," + dlng + "&key=" + googlapikey;
        request(gurl, { json: true }, (err, res3, body2) => {
            if (err) { res.set("Content-Type", 'application/json').status(404).end(); return console.log(err); }
            body.station["Entfernung"] = body2.rows[0].elements[0].distance.value;
            var data = JSON.stringify(body.station);
            res.set("Content-Type", 'application/json').status(200).json(JSON.parse(data)).end();
        });
    });
});


module.exports = router;