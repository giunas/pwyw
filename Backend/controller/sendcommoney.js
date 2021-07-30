/*
Lo script si occupa di effettuare versamenti di denaro da parte dell'utente loggato
verso un esercizio commerciale. Dopo un iniziale controllo dell'importo,
viene memorizzata la transazione in USERTRANS e aggiornato il saldo.
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
    var codice=dati["codice"];
    var importo=dati["importo"];
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;
    var nomecomm=dati['nomecomm'];
    var piva=dati['piva'];
    var data = new Date();
    var dd = String(data.getDate()).padStart(2, '0');
    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();

    data = yyyy + '-' + mm + '-' + dd;

		if(operazione=="SELECTPAYTYPES")
			listaMetodiPagamento(emailCookie,passCookie,cb);

        else if(operazione=="SELECTCOMM")
                listaNomiCommerciali(cb);

		else if(operazione=="VIRTUAL" || operazione=="REAL")
			paga(emailCookie,passCookie,importo,piva,data,codice,operazione,cb);
		else
			rispondi("err",cb);

}

function listaMetodiPagamento(emailCookie,passCookie,cb){
        myvar.eseguiquery("SELECT paytypes.codice,cards.tipocarta FROM account,paytypes,cards WHERE paytypes.email=account.email AND paytypes.codice=cards.codice AND paytypes.email='"+emailCookie+"' AND account.password='"+passCookie+"'",
        function(result) {
            rispondi(result,cb);
        });
}

function listaNomiCommerciali(cb){
        myvar.eseguiquery("SELECT nome,piva FROM esercizicomm",
        function(result) {
            rispondi(result,cb);
        });
}

function paga(emailCookie,passCookie,importo,piva,data,codice,operazione,cb){
	firstcheckimport(emailCookie,passCookie,importo,piva,data,codice,operazione,cb);
}

/*
La funzione controlla che l'importo inserito sia maggiore del saldo del metodo di pagamento scelto.
Con VIRTUAL si indica il portafoglio virtuale, con REAL una carta o un conto associati all'account.
*/

function firstcheckimport(emailCookie,passCookie,importo,piva,data,codice,type,cb){
     if(type=="VIRTUAL") {
        myvar.eseguiquery("SELECT importo FROM account WHERE email='"+emailCookie+"' AND password='"+passCookie+"' AND importo>="+importo,
        function(result) {	
						if(result!="err"){
							if(result.length>0)
            		pagamento(emailCookie,passCookie,importo,piva,data,"0",type,cb);
							else
								rispondi("nomoneys",cb);
						 }
						else
							rispondi("err",cb);
        });
    }

    else if(type=="REAL"){
        myvar.eseguiquery("SELECT saldo FROM cards WHERE codice='"+codice+"' AND saldo>="+importo,
        function(result) {
						if(result!="err"){
							if(result.length>0)
            		pagamento(emailCookie,passCookie,importo,piva,data,codice,type,cb);
							else
								rispondi("nomoneys",cb);
						}
						else
							rispondi("err",cb);
        });        
    }
		else
			rispondi("err",cb);
}

function pagamento(emailCookie,passCookie,importo,piva,data,codice,type,cb){
    if(type=="VIRTUAL"){
        myvar.transazione(["UPDATE account SET importo=importo-"+importo+" WHERE email='"+emailCookie+"' AND password='"+passCookie+"'",
                            "INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+emailCookie+"','"+data+"','"+piva+"',"+importo+",true)"],
        function(result) {
            rispondi(result,cb);
        });        
    }
    else if(type=="REAL"){
        myvar.transazione(["UPDATE cards SET saldo=saldo-"+importo+" WHERE codice='"+codice+"'",
                           "INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+emailCookie+"','"+data+"','"+piva+"',"+importo+",true)"],
        function(result) {
            rispondi(result,cb);
        });        
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
