/*
Lo script si occupa dell'aggiunta di pagamenti periodici per conto dell'utente loggato. 
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
    var piva = dati["piva"];
    var dataavvio = dati["dataavvio"];
    var periodicita = dati["periodicita"];
    var numeropagamenti = dati["numeropagamenti"];
    var importo = dati["importo"];
    var paytype = dati["paytype"];
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;
    var parsedpaytype="'"+paytype+"'";
    if(paytype=="null")
        parsedpaytype=null;

    /*
    Verifica dell'account corrente.
    */
    myvar.eseguiquery("SELECT * FROM account WHERE email='"+emailCookie+"' AND password='"+passCookie+"'",
    function(result){
        if(result=="err"){
            rispondi("err", cb);
        }

        else {
            if(result.length>0){
                /*
                Inserimento dell'abbonamento da parte dell'utente loggato verso l'esercizio commerciale
                con determinata P.IVA. L'abbonamento è specificato con periodicità, data avvio, numero di pagamenti,
                importo e metodo di pagamento scelto.
                */
                myvar.eseguiquery("INSERT INTO abbonamento(emailsend, piva, dataavvio, periodicita, numeropagamenti, importo, paytype) VALUES('"+emailCookie+"','"+piva+"','"+dataavvio+"',"+periodicita+","+numeropagamenti+","+importo+","+parsedpaytype+")",
                function(result){
                    rispondi(result, cb);
                });
            }

            else{
                rispondi("NOTAUTH", cb);
            }
        }
    });

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
