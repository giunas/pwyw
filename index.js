/*
Javascript che viene eseguito per avviare il server.
Il server gira sulla porta 8080 all'indirizzo https://localhost:8080
*/

var express = require('./node_modules/express/index');
var fs = require('fs')
var https = require('https')

var app = express();
var cors= require('cors');
var cookieParser = require('./node_modules/cookie-parser');
var path = require('path');
var schedulerabbonamenti = require('./Backend/controller/payperiodical');



app.use(cors());

app.use(cookieParser());
app.use('/lib',express.static(__dirname + '/lib'));
//app.use('/Frontend',express.static(__dirname + '/Frontend'));

/*
Routing corrispondente alle richieste del client.
*/
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/index.html', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/Frontend/*', function(req, res){
  var pagesRequireCookies=["./Frontend/view/addpayments.html",
  "./Frontend/view/addperiodicalpayments.html",
  "./Frontend/view/changepwd.html",
  "./Frontend/view/deletepayments.html",
  "./Frontend/view/linkcard.html",
  "./Frontend/view/linkiban.html",
  "./Frontend/view/panel.html",
  "./Frontend/view/periodicalpayments.html",
  "./Frontend/view/profile.html",
  "./Frontend/view/requestmoney.html",
  "./Frontend/view/sendcommoney.html",
  "./Frontend/view/sendmoney.html",
  "./Frontend/view/transactions.html",
];
  var frontend='.'+req.url.split("?")[0];
	res.sendFile(__dirname + '/'+frontend);
});
app.get('/Backend/*', function(req, res){
	console.log("HEADER: "+req.get("Origin"));
  var backendjs = require('.'+req.url.split("?")[0]+".js");
  var result = backendjs.main(res,req,function(result){ res.send(result)});
});


https.createServer({
  key: fs.readFileSync('./sslcert/server.key'),
  cert: fs.readFileSync('./sslcert/server.cert')
}, app)
.listen(8080, function () {
  console.log('Example app listening on port 8080 Go to https://localhost:8080/')
})

/*
Viene richiamata lo script per lo scheduling degli abbonamenti.
*/
schedulerabbonamenti.main();



