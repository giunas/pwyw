/*
Lo script si occupa di effettuare richieste di denaro da parte dell'utente loggato
verso un destinatario registrato o meno. In caso di destinatario non registrato
verrà memorizzata la transazione nella tabella reghash come guest transaction e verrà
inviata una mail contenente un link di registrazione al destinatario della richiesta. 
Richieste e Versamenti compiuti da utente registrato a utente registrato vanno sotto la tabella comune
USERTRANS. Le richieste tuttavia si differenziano da versamenti grazie all'attributo tipo: 
false indica versamenti non completati e dunque effettive richieste,
true indica versamenti completati.
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
    var email=dati["email"];
    var importo=dati["importo"];
    var emailCookie=sessione[0].email;
    var passCookie=sessione[0].password;
    var data = new Date();
    var dd = String(data.getDate()).padStart(2, '0');
    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();

    data = yyyy + '-' + mm + '-' + dd;
    var dataOggi=data;

    checkemail(emailCookie,importo,email,dataOggi,cb);
}

/*
Controllo esistenza del destinatario nel database.
*/

function checkemail(emailCookie,importo,email,dataOggi,cb){
	myvar.eseguiquery("SELECT * FROM account WHERE email='"+email+"'",
        function(result) {
						if(result!="err"){
							if(result.length==0)
								generaLinkDiReg(email,importo,emailCookie,cb);
							else
								inseriscinotifica(emailCookie,email,dataOggi,importo,cb);
						}
				
						else
							rispondi("err",cb);
        });		
}


function generaLinkDiReg(email,importo,emailCookie,cb){
    var finalhash = hash(emailCookie, importo);
    inviaEmail(email,importo,finalhash, emailCookie, cb);
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
    text: 'Hai una richiesta di pagamento di '+importo+' euro, registrati con questo link: '+link
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
        rispondi("err",cb);
    } else {
        console.log('Email sent: ' + info.response);
        inseriscireghash(hash,importo,provenienza,emaild,cb);
    }
    });
}

/*
Inserimento di una user transaction.
*/

function inseriscinotifica(emailm, emaild, dataOggi,importo,cb) {
    myvar.eseguiquery("INSERT INTO usertrans(emailsend,data, emailrecv, importo,tipo) VALUES('"+emaild+"','"+dataOggi+"','"+emailm+"',"+importo+",false)",
    function(result){
        rispondi(result, cb);
    });
}

/*
Inserimento di una guest transaction.
*/

function inseriscireghash(hash,importo,provenienza,emaild,cb){
    myvar.eseguiquery("INSERT INTO reghash VALUES('"+hash+"',"+(-1*importo)+",'"+provenienza+"','"+emaild+"')",
    function(result){
        rispondi(result, cb);
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
