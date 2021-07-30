/*
Lo script si occupa di verificare e autenticare un visitatore che effettua il login.
In caso di autenticazione riuscita, il campo session_id della tabella ACCOUNT viene
memorizzato sotto forma di hash MD5 univoco per ogni utente. L'univocità è garantita
dal fatto che l'hashing è basato su email, password e data corrente.
*/

var myvar = require('./sqlhelper');
var md5 = require('../../node_modules/js-md5');


var main = function(risposta,richiesta,cb) {
    var dati=richiesta.query;
    var email=dati["email"];
	var password=md5(dati["password"]);
	// Verifica dell'esistenza di un account avente email e password inserite dal visitatore.
    myvar.eseguiquery("SELECT * FROM account WHERE email='"+email+"' AND password='"+password+"'", function(result) {
        analizza(risposta,dati,result,cb);
    });

}

/*
Costruzione e aggiornamento del session_id.
*/
function analizza(risposta,dati,risultato,cb){
    if (risultato!="err"){
				if(risultato.length>0){
		      var users = { 
		          email : dati["email"], 
		          pwd: md5(dati["password"])
		          } ;
					var data = new Date();
					var dd = String(data.getDate()).padStart(2, '0');
					var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
					var yyyy = data.getFullYear();

					data = yyyy + '-' + mm + '-' + dd;
					var session_id=md5(users.email+" "+users.pwd+" "+data); // HASHING BASATO SU EMAIL, PWD CRIPTATA E DATA CORRENTE);
					myvar.eseguiquery("UPDATE account SET session_id='"+session_id+"' WHERE email='"+users.email+"' AND password='"+users.pwd+"'",
						function(result){
							cb(session_id);
						});
				}
				else
					cb("notauth");
    }
    else{
        cb("0");
    }

}

module.exports={
    main:main
};
