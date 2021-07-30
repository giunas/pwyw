/*
Lo script si occupa di listare transazioni per conto dell'utente loggato.
Sono inoltre presenti le funzioni per l'invio tramite mail o telegram dell'estratto 
conto mensile dell'utente.
Come in molti script di backend, l'esecuzione di una determinata funzione 
viene avviata da una specifica operazione memorizzata nell'omonima variabile.
Tale operazione è definita a priori dal Javascript di Frontend e comunicata
al Backend tramite richiesta HTTP.
*/

var myvar = require('./sqlhelper');
var nodemailer = require('nodemailer');
var mess = require('./sendMessage');

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
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;
    var pdf = dati["pdf"];
    var frame = dati["frame"];
    var idtg = dati["idtg"];
    var data = new Date();

    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();


    if(operazione=="SELECT"){
        myvar.eseguiquery("SELECT DISTINCT usertrans.id, usertrans.data, usertrans.emailsend, emailrecv, usertrans.importo FROM account, usertrans WHERE (usertrans.emailsend='"+emailCookie+"' OR usertrans.emailrecv='"+emailCookie+"') AND tipo=true AND account.password='"+passCookie+"'",
        function(result) {
            risultato={emailLoggato: emailCookie, risultatoQuery: result};
            rispondi(risultato, cb);
        });
    }

    else if(operazione=="DOWNLOAD"){
        myvar.eseguiquery("SELECT usertrans.data, usertrans.emailsend, usertrans.emailrecv, usertrans.importo FROM account, usertrans WHERE MONTH(data)='"+mm+"' AND YEAR(data)='"+yyyy+"' AND (usertrans.emailsend='"+emailCookie+"' OR usertrans.emailrecv='"+emailCookie+"') AND tipo=true AND account.password='"+passCookie+"'",
        function(result) {
            risultato={emailLoggato: emailCookie, risultatoQuery: result};
            rispondi(risultato,cb);
        });   
    }

    else if(operazione=="INVIATELEGRAM"){
        mess.sendFileTg(pdf, idtg,sessione[0].session_id,frame);
        rispondi("OK",cb);
    }

    else if(operazione=="INVIAEMAIL"){
        mess.sendEmailPdf(pdf,sessione[0].session_id,frame,emailCookie);
        rispondi("OK",cb);
    }

    else{
        rispondi("err",cb);
    }
}

/*
La function si occupa di rispondere al client.
*/

function rispondi(risultato,cb){
    if(risultato.risultatoQuery!="err"){
        cb(risultato);
    }
    else{
        cb("0");
    }
}

module.exports={
    main:main
};