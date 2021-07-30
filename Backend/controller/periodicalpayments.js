/*
Lo script si occupa di prelevare i dati dei metodi degli abbonamenti associati all'utente
e di eventuali eliminazioni degli stessi. 
Come in molti script di backend, l'esecuzione di una determinata funzione 
viene avviata da una specifica operazione memorizzata nell'omonima variabile.
Tale operazione è definita a priori dal Javascript di Frontend e comunicata
al Backend tramite richiesta HTTP.
*/

var myvar = require('./sqlhelper');

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
    var id=dati["id"];
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;

    /*
    Selezione degli abbonamenti per l'utente loggato.
    */

    if(operazione=="SELECT"){
        myvar.eseguiquery("SELECT esercizicomm.nome, abbonamento.piva, abbonamento.dataavvio, abbonamento.periodicita, abbonamento.numeropagamenti, abbonamento.importo, abbonamento.id FROM account,abbonamento,esercizicomm WHERE abbonamento.piva = esercizicomm.piva AND abbonamento.emailsend=account.email AND abbonamento.emailsend='"+emailCookie+"' AND account.password='"+passCookie+"'",
        function(result) {
            rispondi(result,cb);
        });
    }

    /*
    Eliminazione degi abbonamenti per l'utente loggato.
    */

    else if(operazione=="DELETE"){
        myvar.eseguiquery("SELECT * FROM account WHERE email='"+emailCookie+"' AND password='"+passCookie+"'",
        function(result){
            if(result.length>0){
                myvar.eseguiquery("DELETE FROM abbonamento WHERE abbonamento.id="+id+" AND abbonamento.emailsend='"+emailCookie+"'",
                function(result) {
                    rispondi(result,cb);
                });
            }
            else
                rispondi("err",cb);
        });       
    }
    else{
        rispondi("err",cb);
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
