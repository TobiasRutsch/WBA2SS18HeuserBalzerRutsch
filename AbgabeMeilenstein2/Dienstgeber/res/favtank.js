//Module importieren
const express=require("express");
const router=express.Router();
const bodyParser=require('body-parser');
const Ajv = require('ajv');
const uuidParse = require('uuid-parse');
const async = require('async');

//Ressourcenname festlege
const ressourceName = "favtank";
//Zählervariable für Listen & ID
var favtankID = 0;

//JSON Validation Schema fuer FavEquipment
var postSchema = {
    "title" : "favtank",
    "description" : "Validating post favroutes",
    "type" : "object",
    "properties" : {
        "stations" : {
            "type" : "array",
            "minItems" : 1,
            "items" : {
                "title" : "stations",
                "description" : "favtank post schema",
                "type" : "object",
                "properties" : {
                    "id" : {"type" : "string"},
                },
                "required" : ["id"],
                "additionalProperties": false
            }
        }
    }
};

//Middleware
router.use(function timelog (req, res, next){
    console.log('-----------------------');
	   console.log('Time: ', Date.now());
    console.log('Method: ',req.method);
    console.log('URL: ',ressourceName + req.url);
	next();
});

//Gibt die Favtankliste für die Nutzerid mit Daten aus aus
router.get('/:id',function(req,res){
    //Der Parameter des gesuchten Equipment
    var reqID = parseInt(req.params.id);
    //Wenn die ID ungültig ist...
    if(isNaN(reqID) || reqID < 0){
        //Gib statuscode 400 zurück
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        //Liste der Favtanklisten nach ID durchsuchen
        var reqFavTankID = data.favtank.findIndex(function(x){ return x.id === reqID; });
        if(reqFavTankID > -1){
            //Bei Erfolgreiche gefundenem Index wird die favetank-liste ausgegeben
            var reqFavTank = data.favtank[reqFavTankID];

            //Anfrage für alle Tankstellen an die API für aktuelle Daten
            function pricereq(callback){
              //Sammelt die angefragten Tankstellen in der Request URL
              const request = require('request');
              var tankeapikey = "0c2331c6-cc90-9af8-293e-e87df42d2746";
              var url="https://creativecommons.tankerkoenig.de/json/prices.php?ids=";
              for(var i=0;i<reqFavTank.stations.length&&i<10;i++){
                if(i>0){
                  url=url+",";
                }
                url=url+reqFavTank.stations[i].id;
              }
              //console.log(url);
              url=url+"&apikey=" + tankeapikey;
              //Request an die TankerkönigAPI
              request(url, { json: true }, (err, res2, body2) => {
                if (err) { return console.log(err); }
                reqFavTank=body2;

                callback(null);
              });
            }
            //Mittels async.series auf das ende von pricereq warten
            async.series([pricereq, function(err,results){
                //Ergebnis an den Dienstnutzer senden
                res.set("Content-Type", 'application/json').status(200).json(reqFavTank).end();
            }]);

        }else{
            //Kein Index gefunden => gesuchteTank-liste nicht vorhanden => not found
            res.set("Content-Type", 'application/json').status(404).end();
        }
    }
});

//Einer favtank-liste eine neue Tankstelle oder mehrere hinzufuegen
router.put('/:id',bodyParser.json(),function(req,res){
    //Parameter fuer die FavTank-Liste, die veraendert werden soll
    var reqID = parseInt(req.params.id);
    var contentType = req.get('Content-Type');
    if(contentType != "application/json"){
        //Daten vom Dienstnutzer vaideren
         res.set("Accepts", "application/json").status(406).end();
    }else{
        // Neue Liste zusammenstellen
        var addFavTank = req.body;
        var ajv = Ajv({allErrors: true});
        //Pruefen ob die Parameter stimmen und ob die json valide ist
        if(isNaN(reqID) || reqID < 0 || !ajv.validate(postSchema, addFavTank)){
            res.set("Content-Type", 'application/json').status(400).end();
        }else{
            //Index der zu aendernden Favtank-Liste wird gesucht
            var foundID = data.favtank.findIndex(function(x){ return x.id === reqID });
            if(foundID > -1){
                //Index der FavTank-Liste gefunden, jetzt wird sie geaendert
                for(var i = 0;addFavTank.stations.length > i;i++){
                    data.favtank[foundID].stations.push(addFavTank.stations[i]);
                }
                //console.log(data.favequips[foundID]);
                res.set("Content-Type", 'application/json').status(200).json(data.favtank[foundID]).end();
            }else{
                //keine FavEquip-Liste mit der passenden ID gefunden => not found
                res.set("Content-Type", 'application/json').status(204).end();
            }
        }
    }
});
//Neue favequip-liste anlegen
router.post('/',bodyParser.json(),function(req,res){
  //Content-Type des Headers pruefen
   var contentType = req.get('Content-Type');
   if(contentType != "application/json"){
        res.set("Accepts", "application/json").status(406).end();
   }else{
        var newFavTank = req.body;
        //Alle Errors der Validation sammeln, standard ist return nach erstem
        var ajv = Ajv({allErrors: true});
        if (ajv.validate(postSchema, newFavTank)) {
            console.log(ajv.validate(postSchema, newFavTank));
            //json Daten stimmen dem schema ueberein
            //Vergabe der ID an neue FavEquips-Liste und pushen auf das Array
            newFavTank.id = favtankID++;
            data.favtank.push(newFavTank);
            //console.log(newFavEquip);
            //Antwort an den Dienstnutzer
            res.set("Content-Type", 'application/json').set("Location", "/favequipment/" + (favtankID - 1)).status(201).json(newFavTank).end();
        } else {
            //Wenn daten nicht valide
            res.set("Content-Type", 'application/json').status(400).end();
        }
   }
});
//Loeschen einer Liste
router.delete('/:id',function(req,res){
  var reqID = parseInt(req.params.id);

    //Pruefen ob der Parameter stimmt
    if(isNaN(reqID) || reqID < 0){
        res.set("Content-Type", 'application/json').status(400).end();
    }else{
        var foundID = data.favtank.findIndex(function(x){ return x.id === reqID });
        if(foundID > -1){
            //Index des FavEquips gefunden, wird jetzt geloescht
            var removedFavTank = data.favtank.splice(foundID, 1);
            //console.log(removedFavEquip);
            //Antwort an den Dienstnutzer
            res.set("Content-Type", 'application/json').status(200).json(removedFavTank).end();
        }else{
            res.set("Content-Type", 'application/json').status(204).end();
        }
    }
});
//Modul exportieren
module.exports=router;
