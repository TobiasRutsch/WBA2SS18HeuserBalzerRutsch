var express = require('express'),
    request = require('request'),
    http = require('http'),
    faye = require('faye');
var app = express();

var dHost = 'http://localhost';
var dPort = 3773;
var dURL = dHost + ':'+dPort;

var dURL = 'https://tankenistsuper.herokuapp.com'

const settings = {
	port: 8080
};

//GET requests
app.get('/optimal', function(req, res){
    var url= dURL + '/optimal'+'/50.947702,6.913183,10,diesel';


    request.get(url, function(err, response, body){
      console.log(body);
      body=JSON.parse(body);
      res.json(body);
    });
});

app.get('/price', function(req, res){
    var url= dURL + '/price'+'/51d4b50e-a095-1aa0-e100-80009459e03a,50.947702,6.913183';
    request.get(url, function(err, response, body){
      var body=JSON.parse(body);
      console.log(body);

      res.json(body);
    });
});

app.get('/distance', function(req, res){
    var url= dURL + '/distance'+'/51d4b50e-a095-1aa0-e100-80009459e03a,50.947702,6.913183';
    request.get(url, function(err, response, body){
      var body=JSON.parse(body);
      console.log(body);

      res.json(body);
    });
});

app.get('/favtank', function(req, res){
    var nutzerID=0;
    var url= dURL + '/favtank/'+ nutzerID;

    request.get(url, function(err, response, body){
      var body=JSON.parse(body);

      res.json(body);
    });
});

app.put('/favtank', function(req, res){
    var nutzerID=0;
    var url= dURL + '/favtank/'+ nutzerID;

    var data = {
	     "stations":[
         {
           "id":"60c0eefa-d2a8-4f5c-82cc-b5244ecae955"
         }
       ]
     }

    var options = {
      uri: url,
      method: 'PUT',
      headers: {
        'contentType':'application/json'
      },
      "json": data
    }
    clientFaye.publish('/favtank/'+nutzerID,{operation:'PUT',body:data})
    .then(function() {
      console.log('Message gesendet.');
    },function(error){
      console.log('Fehler beim senden:'+error.message);
    });

    request(options, function(err, response, body){

      res.json(body);
    });
});

app.post('/favtank', function(req, res){
    var url= dURL + '/favtank';

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
     console.log('Nachricht versenden');
     clientFaye.publish('/favtank',{operation:'POST',body:data})
     .then(function() {
       console.log('Message gesendet.');
     },function(error){
       console.log('Fehler beim senden:'+error.message);
     });

    var options = {
      uri: url,
      method: 'POST',
      headers: {
        'contentType':'application/json'
      },
      'json': data
    }

    request(options, function(err, response, body){

      res.json(body);
    });
});

app.delete('/favtank', function(req, res){
    var nutzerID=0;
    var url= dURL + '/favtank/'+ nutzerID;

    request.delete(url, function(err, response, body){
      res.json(body);
    });
});
//FAYE

var server = http.createServer();
var fayeserver= new faye.NodeAdapter({mount: '/faye',timeout: 45});
fayeserver.attach(server);

var clientFaye = new faye.Client('http://localhost:'+ settings.port + '/faye');
clientFaye.subscribe('/*').withChannel(function(channel, message){
    //ListenNummer aus Channel extrahieren
    var channelArr = channel.match(/\d+/g);
    var channelNum = parseInt(channelArr[0]);
    console.log("Die Favoritenliste mit der id " + channelNum + " wurde geändert.");
    console.log("Befehl: "+message.operation);
    console.log("Aktueller Datensatz: "+message.body);
});


app.listen(settings.port, function () {
   console.log("REST-Server laeuft auf Port " + settings.port);
});
