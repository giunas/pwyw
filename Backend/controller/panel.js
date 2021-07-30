/*
Lo script si occupa di prelevare i dati dell'utente loggato.
Questi dati si sostanziano in saldo virtuale dell'utente, nome ed eventuali notifiche
di richieste di pagamento.
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
    var dati = richiesta.query;
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;
    var operazione = dati["operazione"];
    if(operazione=="AUTH")
        myvar.eseguiquery("SELECT * FROM account WHERE email='"+emailCookie+"' AND password='"+passCookie+"'", function(result) {
            rispondi(result,cb);
        });
    else if(operazione=="SELECTNOTIFIES")
        myvar.eseguiquery("SELECT usertrans.id,usertrans.emailrecv,usertrans.importo FROM usertrans,account WHERE usertrans.emailsend=account.email AND usertrans.emailsend='"+emailCookie+"' AND account.password='"+passCookie+"' AND usertrans.tipo=false", function(result) {
            rispondi(result,cb);
        });
    else
        rispondi("err",cb);
  }

/*
La function si occupa di rispondere al client.
*/

  function rispondi(result,cb){
    if(result!="err"){
        cb(result);
    }
    else{
        cb("0");
    }
  }

  module.exports={
      main:main
  };
