/*
Lo script si occupa dell'aggiunta di metodi di pagamento per conto dell'utente loggato. 
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
    var ibanorcard=dati["ibanorcard"];
    var codice=dati["codice"];
    var tipo=dati["tipocarta"];
    var scadenza=dati["scadenza"];
    var cvv=dati["CVV"];
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;

    /*Metodo di pagamento selezionato dall'utente*/
    if(ibanorcard=="IBAN"){
        iban(codice,emailCookie,passCookie,cb);
    }
    else if(ibanorcard=="CARD"){
        card(codice,tipo,scadenza,cvv,emailCookie,passCookie,cb); 
    }
    else{
        rispondi("err");
    }
}

    
/*
La function presenta un primo controllo mediante SELECT ad una tabella universale di 
tutti i conti IBAN. In caso di verifica positiva la function provvede ad inserire 
il metodo di pagamento.
*/

function iban(codice, emailCookie,passCookie,cb){
    myvar.eseguiquery("SELECT * FROM cards WHERE codice='"+codice+"'",
    function(result) {
        if(result.length>0){
            myvar.eseguiquery("SELECT * FROM account WHERE email='"+emailCookie+"' AND password='"+passCookie+"'",
            function(result){
                if(result.length>0){
                    myvar.eseguiquery("INSERT INTO paytypes VALUES('"+emailCookie+"','"+codice+"')",
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
        
    });
}

/*
La function presenta un primo controllo mediante SELECT ad una tabella universale di 
tutte le carte. In caso di verifica positiva la function provvede ad inserire 
il metodo di pagamento.
*/

function card(codice,tipo,scadenza,cvv,emailCookie,passCookie,cb){
    myvar.eseguiquery("SELECT * FROM cards WHERE codice='"+codice+"' AND tipocarta='"+tipo+"' AND scadenza='"+scadenza+"' AND codicesicurezza="+cvv,
    function(result) {
        if(result.length>0){
            myvar.eseguiquery("SELECT * FROM account WHERE email='"+emailCookie+"' AND password='"+passCookie+"'",
            function(result){
                if(result.length>0){
                    myvar.eseguiquery("INSERT INTO paytypes VALUES('"+emailCookie+"','"+codice+"')",
                    function(result) {
                        rispondi(result,cb);
                    });
                }
                else{
                    rispondi("err",cb);
                }
            });       
        }
        
        else{
            rispondi("err",cb); 
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
