const express = require('express');
var app = express();

//Modul mit den Arrays der Ressourcen
global.data = require('./res/data');

//Settings festlegen
const settings = {
	port: process.env.PORT || 3773
};

/*
//modul fuer favtank
const favtank = require('./res/favtank');
app.use("/favtank", favtank);

const price = require('./res/price');
app.use("/price", favtank);

const distance = require('./res/distance');
app.use("/distance", favtank);
*/
const optimal = require('./res/optimal');
app.use("/optimal", optimal);

//Server starten
app.listen(settings.port, function () {

   console.log("REST-Server laeuft auf Port " + settings.port);

});