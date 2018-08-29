//Module importieren
var express = require('express'),
    request = require('request'),
    http = require('http'),
    faye = require('faye');
var app = express();

//Link für localhost
var dHost = 'http://localhost';
var dPort = 3773;
var dURL = dHost + ':'+dPort;

//Link für Heroku
var dURL = 'https://tankenistsuper.herokuapp.com'

//Settings
const settings = {
	port: 8080
};

//GET-Requests
//GET /optimal
app.get('/optimal', function(req, res){
    //URL vervollständgen
    var url= dURL + '/optimal'+'/50.947702,6.913183,10,diesel';
    //Request an den Server
    request.get(url, function(err, response, body){
      //console.log(body);

      //Response parsen und an de Client schicken
      body=JSON.parse(body);
      res.json(body);
    });
});

//GET /price
app.get('/price', function(req, res){
    //URL vervollständgen
    var url= dURL + '/price'+'/51d4b50e-a095-1aa0-e100-80009459e03a,50.947702,6.913183';
    //Request an den Server
    request.get(url, function(err, response, body){
      //console.log(body);

      //Response parsen und an de Client schicken
      var body=JSON.parse(body);
      res.json(body);
    });
});

//GET /distance
app.get('/distance', function(req, res){
    //URL vervollständgen
    var url= dURL + '/distance'+'/51d4b50e-a095-1aa0-e100-80009459e03a,50.947702,6.913183';
    //Request an den Server
    request.get(url, function(err, response, body){
      //console.log(body);

      //Response parsen und an de Client schicken
      var body=JSON.parse(body);
      res.json(body);
    });
});

//GET /favtank/*
app.get('/favtank', function(req, res){
    // channel festlegen
    var nutzerID=0;
    //URL vervollständgen
    var url= dURL + '/favtank/'+ nutzerID;
    //Request an den Server
    request.get(url, function(err, response, body){

      //Response parsen und an de Client schicken
      var body=JSON.parse(body);
      res.json(body);
    });
});

//PUT /favtank/*
app.put('/favtank', function(req, res){    // channel festlegen
    // channel festlegen
    var nutzerID=0;
    //URL vervollständge
    var url= dURL + '/favtank/'+ nutzerID;

    //Aenderungsdaten festlegen
    var data = {
	     "stations":[
         {
           "id":"60c0eefa-d2a8-4f5c-82cc-b5244ecae955"
         }
       ]
     }

     //Optoins für Request an den Server festlegen
    var options = {
      uri: url,
      method: 'PUT',
      headers: {
        'contentType':'application/json'
      },
      "json": data
    }
    //Publish, dass es eine Änderung gab
    clientFaye.publish('/favtank/'+nutzerID,{operation:'PUT',body:data})
    .then(function() {
      console.log('Message gesendet.');
    },function(error){
      console.log('Fehler beim senden:'+error.message);
    });
    //Request an den Server
    request(options, function(err, response, body){
    //Ergebnis an den Client zurücksenden
    res.json(body);
    });
});

//PUT /favtank/*
app.post('/favtank', function(req, res){
    //URL vervollständge
    var url= dURL + '/favtank';

    //Inhaltsdaten festlegen
    var data = {
	     "stations":[
         {
           "id":"60c0eefa-d2a8-4f5c-82cc-b5244ecae955"
         },
         {
           "id":"474e5046-deaf-4f9b-9a32-9797b778f047"

         }
       ]
     }
     //Publish, dass eine Liste erstellt wurde
     console.log('Nachricht versenden');
     clientFaye.publish('/favtank',{operation:'POST',body:data})
     .then(function() {
       console.log('Message gesendet.');
     },function(error){
       console.log('Fehler beim senden:'+error.message);
     });

    //Optoins für Request an den Server festlegen
    var options = {
      uri: url,
      method: 'POST',
      headers: {
        'contentType':'application/json'
      },
      'json': data
    }
    //Request an den Server
    request(options, function(err, response, body){
    //Ergebnis an den Client zurücksenden
    res.json(body);
    });
});

app.delete('/favtank', function(req, res){
    // channel festlegen
    var nutzerID=0;
    //URL vervollständge
    var url= dURL + '/favtank/'+ nutzerID;
    // channel festlegen
    var nutzerID=0;
    //Request an den Server
    request.delete(url, function(err, response, body){
    //Ergebnis an den Client zurücksenden
    res.json(body);
    });
});
//FAYE

//Server aufsetzten
var server = http.createServer(app);
var fayeserver= new faye.NodeAdapter({mount: '/faye',timeout: 45});
fayeserver.attach(server);



//Cliet aufsezten
var clientFaye = new faye.Client('http://localhost:'+ settings.port + '/faye');

//Subscribe für den Channel
clientFaye.subscribe('favtank/*').withChannel(function(channel, message){
    //ListenNummer aus Channel extrahieren
    var channelArr = channel.match(/\d+/g);
    var channelNum = parseInt(channelArr[0]);
    console.log("Die Favoritenliste mit der id " + channelNum + " wurde geändert.");
    console.log("Befehl: "+message.operation);
    console.log("Aktueller Datensatz: "+message.body);
});

//Auf verbindungen hören
server.listen(settings.port, function () {
   console.log("REST-Server laeuft auf Port " + settings.port);
});
