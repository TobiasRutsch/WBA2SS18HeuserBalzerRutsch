const https = require('https');



var tankeapikey = "0c2331c6-cc90-9af8-293e-e87df42d2746";
var googlapikey = "AIzaSyBA9X-4wsVcV0r3ZAZyK4PVGUtR5kvxAJw";
//Options 
var lat = "50.9446925";
var lng = "6.945499";
var rad = "1.5";

var dlat,dlng;


var url = "https://creativecommons.tankerkoenig.de/json/list.php?lat=" + lat + "&lng=" + lng + "&rad=1.5&sort=dist&type=all&apikey=" + tankeapikey;

const request = require('request');
 
request(url, { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body);
  dlat = body.stations[0].lat;
  dlng = body.stations[0].lng;
  var gurl = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins="+lat+","+lng+"&destinations="+dlat+","+dlng+"&key=" + googlapikey;
  request(gurl,{ json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    var result = JSON.stringify(body);
    console.log(result);
  });
});
