/*
Lo script si occupa di effettuare versamenti di denaro da parte dell'utente loggato
verso un destinatario registrato o meno. In caso di destinatario non registrato
verrà memorizzata la transazione nella tabella reghash come guest transaction e verrà
inviata una mail contenente un link di registrazione al destinatario del versamento. 
Richieste e Versamenti compiuti da utente registrato a utente registrato vanno sotto la tabella comune
USERTRANS. Le richieste tuttavia si differenziano da versamenti grazie all'attributo tipo: 
true indica versamenti completati e dunque effettivi pagamenti,
false indica versamenti non completati.
Come in molti script di backend, l'esecuzione di una determinata funzione 
viene avviata da una specifica operazione memorizzata nell'omonima variabile.
Tale operazione è definita a priori dal Javascript di Frontend e comunicata
al Backend tramite richiesta HTTP.
*/

var myvar = require('./sqlhelper');
var md5 = require('../../node_modules/js-md5');
var nodemailer = require('nodemailer');

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
    var email=dati["email"];
    var codice=dati["codice"];
    var importo=dati["importo"];
    var idnotifica=dati["idnotifica"];
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;
    var data = new Date();
    var dd = String(data.getDate()).padStart(2, '0');
    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();

    data = yyyy + '-' + mm + '-' + dd;
		if(operazione=="SELECTPAYTYPES")
			listaMetodiPagamento(emailCookie,passCookie,cb);
		else if(operazione=="VIRTUAL" || operazione=="REAL")
			paga(idnotifica,emailCookie,passCookie,importo,email,data,codice,operazione,cb);
		else
			rispondi("err",cb);
}

function paga(idnotifica,emailCookie,passCookie,importo,email,data,codice,operazione,cb){
	firstcheckimport(idnotifica,emailCookie,passCookie,importo,email,data,codice,operazione,cb);
}

function generaLinkDiReg(email,importo,emailCookie,codice,type,cb){
    if(type=="VIRTUAL"){
        var finalhash = hash(emailCookie, importo);
        inviaEmail(email,importo,finalhash, emailCookie, cb);
    }
    else if(type=="REAL"){
        var finalhash = hash(emailCookie, importo);
        inviaEmail(email,importo,finalhash, codice, cb);   
    }
}

function pagoUtenteNoReg(esito,cb,finalhash,importo, provenienza, emaildest){

    if(esito==true){
        myvar.eseguiquery("INSERT INTO reghash VALUES('"+finalhash+"',"+importo+",'"+provenienza+"','"+emaildest+"')", 
        function(result) {
            rispondi(result,cb);
        });
    }
    else{
        rispondi("err",cb)
    }
}

function hash(email, importo) {
    var today= new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
    var dateTime = date+' '+time;
    var rawhash=email+" "+dateTime+" "+JSON.stringify(importo);
    return md5(rawhash);
}

function inviaEmail(emaild, importo, hash, provenienza, cb) {

    var link="https://localhost:8080/Frontend/view/register.html?hash="+hash;

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'progwebemobile@gmail.com',
        pass: '12321343'
    }
    });

    var mailOptions = {
    from: 'progwebemobile@gmail.com',
    to: emaild,
    subject: 'Pagamento',
    text: 'Hai ricevuto un pagamento di '+importo+' euro, registrati con questo link: '+link
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
        pagoUtenteNoReg(false,cb,hash,importo, provenienza,emaild);
    } else {
        console.log('Email sent: ' + info.response);
        pagoUtenteNoReg(true,cb,hash,importo, provenienza,emaild);
    }
    });
}


function listaMetodiPagamento(emailCookie,passCookie,cb){
        myvar.eseguiquery("SELECT paytypes.codice,cards.tipocarta FROM account,paytypes,cards WHERE paytypes.email=account.email AND paytypes.codice=cards.codice AND paytypes.email='"+emailCookie+"' AND account.password='"+passCookie+"'",
        function(result) {
            rispondi(result,cb);
        });
}

/*
Controllo esistenza del destinatario nel database.
*/

function secondcheckemail(idnotifica,emailCookie,passCookie,importo,email,data,codice,type,cb){
	myvar.eseguiquery("SELECT * FROM account WHERE email='"+email+"'",
        function(result) {
						if(result!="err"){
							if(result.length==0)
								generaLinkDiReg(email,importo,emailCookie,codice,type,cb);
							else
								checkIfReplyToNotify(idnotifica,emailCookie,passCookie,importo,email,data,codice,type,cb);
						}
				
						else
							rispondi("err",cb);
        });		
}

/*
La funzione controlla che l'importo inserito sia maggiore del saldo del metodo di pagamento scelto.
Con VIRTUAL si indica il portafoglio virtuale, con REAL una carta o un conto associati all'account.
*/

function firstcheckimport(idnotifica,emailCookie,passCookie,importo,email,data,codice,type,cb){
     if(type=="VIRTUAL") {
        myvar.eseguiquery("SELECT importo FROM account WHERE email='"+emailCookie+"' AND password='"+passCookie+"' AND importo>=(SELECT coalesce(sum(importo),0) FROM reghash WHERE provenienza='"+
        emailCookie+"' AND importo>0)+"+importo,
        function(result) {	
						if(result!="err"){
							if(result.length>0)
            		secondcheckemail(idnotifica,emailCookie,passCookie,importo,email,data,"0",type,cb);
							else
								rispondi("nomoneys",cb);
						 }
						else
							rispondi("err",cb);
        });
    }

    else if(type=="REAL"){
        myvar.eseguiquery("SELECT saldo FROM cards WHERE codice='"+codice+"' AND saldo>=(SELECT coalesce(sum(importo),0) FROM reghash WHERE provenienza='"+
        codice+"' AND importo>0)+"+importo,
        function(result) {
						if(result!="err"){
							if(result.length>0)
            		secondcheckemail(idnotifica,emailCookie,passCookie,importo,email,data,codice,type,cb);
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

/*
La funzione seguente controlla che un versamento soddisfi o meno una particolare richiesta di pagamento.
In caso affermativo, non viene creata una transazione ex novo ma viene solamente modificato il parametro
tipo della transazione rappresentante la richiesta già esistente. 
*/

function checkIfReplyToNotify(idnotifica,emailCookie,passCookie,importo,email,data,codice,type,cb){
    if(idnotifica!="undefined" && idnotifica!=null){
        myvar.eseguiquery("SELECT usertrans.importo FROM usertrans, account WHERE usertrans.emailsend=account.email AND usertrans.tipo=false AND id="+idnotifica+" AND usertrans.importo="+importo+" AND emailsend='"+emailCookie+"' AND password='"+passCookie+"'",
        function(result){
            if(result.length>0)
                pagamento(idnotifica,emailCookie,passCookie,importo,email,data,codice,type,cb);
            else
                rispondi("nocorrectimport",cb);
        });
    }
    else
        pagamento(-1,emailCookie,passCookie,importo,email,data,codice,type,cb);
}

function pagamento(idnotifica,emailCookie,passCookie,importo,email,data,codice,type,cb){
    if(type=="VIRTUAL"){
        myvar.transazione(["UPDATE account SET importo=importo-"+importo+" WHERE email='"+emailCookie+"' AND password='"+passCookie+"'",
                            "UPDATE account SET importo=importo+"+importo+" WHERE email='"+email+"'",
                            "DELETE FROM usertrans WHERE id="+idnotifica+" AND tipo=false",
                            "INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+emailCookie+"','"+data+"','"+email+"',"+importo+",true)"],
        function(result) {
            rispondi(result,cb);
        });        
    }
    else if(type=="REAL"){
        myvar.transazione(["UPDATE cards SET saldo=saldo-"+importo+" WHERE codice='"+codice+"'",
                            "UPDATE account SET importo=importo+"+importo+" WHERE email='"+email+"'",
                            "DELETE FROM usertrans WHERE id="+idnotifica+" AND tipo=false",
                            "INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+emailCookie+"','"+data+"','"+email+"',"+importo+",true)"],
        function(result) {
            rispondi(result,cb);
        });        
    }	
		else
			rispondi("err",cb);
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
