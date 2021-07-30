/*
Lo script si occupa di deautenticare un utente loggato.
In caso di deautenticazione riuscita, il campo session_id della tabella ACCOUNT,
relativo all'utente loggato, viene posto a NULL.
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

    risposta.clearCookie('userData', { path: '/' });
		myvar.eseguiquery("UPDATE account SET session_id=null WHERE session_id='"+sessione[0].session_id+"'",
			function(result){
				if(result!="err")
					rispondi("logoutok",cb);
				else
					rispondi("err",cb);
		});

}

/*
La function si occupa di rispondere al client.
*/

function rispondi(risposta,cb){
    cb(risposta);
}

module.exports={
    main:main
};
