/*
Lo script si occupa di prelevare i dati dell'anagrafica dell'utente e di un eventuale aggiornamento
degli stessi.
Come in molti script di backend, l'esecuzione di una determinata funzione 
viene avviata da una specifica operazione memorizzata nell'omonima variabile.
Tale operazione è definita a priori dal Javascript di Frontend e comunicata
al Backend tramite richiesta HTTP.
*/

var myvar = require('./sqlhelper');
var md5 = require('../../node_modules/js-md5');

/*
Recupero dei dati dell'account mediante sessione corrente.
*/

var main = function(risposta,richiesta,cb){
		var session_id=richiesta.query["session_id"];
		myvar.eseguiquery("SELECT * FROM account WHERE session_id='"+session_id+"'",
			function(result){
				if(result.length>0)
					sessionRetrieved(risposta,richiesta,result,cb);
				else
					rispondi("err",cb);
			});
}

/*
La function viene eseguita dopo aver prelevato i dati dell'account.
*/

var sessionRetrieved = function(risposta,richiesta,sessione,cb) {
    var dati=richiesta.query;
    var operazione=dati["operazione"];
    var cf=dati["cf"];
    var nome=dati["nome"];
    var cognome=dati["cognome"];
    var gender=dati["gender"];
    var ddn=dati["ddn"];
    var comune=dati["comune"];
    var residenza=dati["residenza"];
    var indirizzo=dati["indirizzo"];
    var telefono=dati["telefono"];
    var email=dati["email"];
    var password=dati["password"];
    var emailCookie=sessione[0].email;
    var pwdCookie=sessione[0].password;
    var oldPwd = dati["oldPwd"];
    var newPwd = dati["newPwd"];

    /*
    Selezione dell'anagrafica per l'utente loggato.
    */

    if(operazione=="SELECT"){
        myvar.eseguiquery("SELECT * FROM account WHERE email='"+emailCookie+"' AND password='"+pwdCookie+"'",
        function(result) {
            rispondi(result[0],cb);
        });
    }

    /*
    Aggiornamento dell'anagrafica per l'utente loggato.
    */

    else if(operazione=="UPDATE"){
        myvar.eseguiquery("UPDATE account SET cf='"+cf+"',nome='"+nome+"', cognome='"+cognome+"',gender='"+gender+"', ddn='"+ddn+"', ln='"+comune+"',residenza='"+residenza+"', indirizzo='"+indirizzo+"', telefono='"+telefono+"', email='"+email+"' WHERE email='"+emailCookie+"' AND password='"+pwdCookie+"'", 
        function(result) {
            rispondi(result,cb);
        });
    }

    /*
    Da qui in poi segue la funzionalità di cambio password che si compone di un primo controllo
    della vecchia password e in caso positivo dell'aggiornamento della stessa.
    */

    else if(operazione=="CHECKOLDPWD"){
        myvar.eseguiquery("SELECT * FROM account WHERE email='"+emailCookie+"' AND password='"+md5(oldPwd)+"'", 
        function(result) {
            rispondi(result[0],cb);
        });  
 
      
    }
    else if(operazione=="UPDATENEWPWD"){
        myvar.eseguiquery("UPDATE account SET password='"+md5(newPwd)+"' WHERE email='"+emailCookie+"'", 
        function(result) {
            rispondi(result,cb);
        }); 
        var users = { 
            email : "null", 
            pwd: "null"
            } ;
        risposta.cookie("userData",users);
    }
}

/*
La function si occupa di rispondere al client.
*/

function rispondi(risultato,cb){

    
    if(risultato!="err"){
        cb(risultato);
    }
    else{
        cb("0");
    }
}
module.exports={
    main:main
};
