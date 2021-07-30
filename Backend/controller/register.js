/*
Lo script si occupa di registrare un visitatore come utente. La registrazione del visitatore
può avvenire in due modi: tramite link di registrazione, in caso di invio o richiesta di denaro
da parte di un utente registrato, oppure tramite classica prassi.

In caso di registrazione tramite link, il funzionamento è il seguente:

1. Il visitatore clicca su un link di registrazione con apposito hash.
2. Il visitatore è rimandato alla pagina di registrazione ed effettua la registrazione con 
   l'email a cui è arrivato il link di registrazione.
3. Il sistema chiede al DBMS di riunire tutte le occorrenze di eventuali guest transactions
   a carico dell'utente neoregistrato. Questo è necessario perchè un visitatore può possedere
   più link di registrazione a fronte di più versamenti o richieste emessi da utenti.
   Per ragioni di sicurezza, qualora il visitatore si dovesse registrare con email differente
   da quella presso cui ha ricevuto il link di registrazione, il nuovo account non memorizzerà 
   l'importo tracciato dal link di registrazione.

NOTA: un link di registrazione è strettamente associato ad una guest transaction e dunque memorizza
      mittente, destinatario ed importo.
*/

var myvar = require('./sqlhelper');
var md5 = require('../../node_modules/js-md5');

var main = function(risposta,richiesta, cb) {
    var dati=richiesta.query;
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
    var password=md5(dati["password"]);
    var hash=dati["hash"];
    var dataOggi = new Date();
    var dd = String(dataOggi.getDate()).padStart(2, '0');
    var mm = String(dataOggi.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = dataOggi.getFullYear();

    dataOggi = yyyy + '-' + mm + '-' + dd;
    console.log(hash);

    if(hash!=null && hash!="undefined")
        raggruppahash(hash,dataOggi,cf,nome,cognome,gender,ddn,comune,residenza,indirizzo,telefono,email,password,cb);
    else    
        registrazionenormale(cf,nome,cognome,gender,ddn,comune,residenza,indirizzo,telefono,email,password,cb);

    function registrazionenormale(cf,nome,cognome,gender,ddn,comune,residenza,indirizzo,telefono,email,password,cb){
        myvar.eseguiquery("INSERT INTO account(cf, nome, cognome, gender, ddn, ln, residenza, indirizzo, telefono, email, password, importo,session_id) values('"+cf+"', '"+nome+"', '"+cognome+"','"+gender+"','"+ddn+"', '"+comune+"', '"+residenza+"', '"+indirizzo+"', '"+telefono+"', '"+email+"', '"+password+"',0,null)",
        function(result){
            analizza(result,cb);
        });

    }
}

// Raggrupamento delle guest transactions. Le guest transactions sono memorizzate nella tabella reghash.

function raggruppahash(hash,dataOggi,cf,nome,cognome,gender,ddn,comune,residenza,indirizzo,telefono,email,password,cb){
    myvar.eseguiquery("SELECT * FROM reghash WHERE emaildest IN"+
    "(SELECT emaildest FROM reghash WHERE hash='"+hash+"')",
    function(result){
        registerbyemaildest(result,dataOggi,cf,nome,cognome,gender,ddn,comune,residenza,indirizzo,telefono,email,password, cb);
    });

}

// Registrazione effettiva e conversione di guest transactions in user transactions.

function registerbyemaildest(result,dataOggi,cf,nome,cognome,gender,ddn,comune,residenza,indirizzo,telefono,email,password, cb){
        var querylist=[];
        var sommaImportiPositivi=0;
        for(var row=0;row<result.length;row++){
            if(result[row].importo>0)
                sommaImportiPositivi+=result[row].importo;
        }
        querylist.push("INSERT INTO account(cf, nome, cognome, gender, ddn, ln, residenza, indirizzo, telefono, email, password, importo,session_id) values('"+cf+"', '"+nome+"', '"+cognome+"','"+gender+"','"+ddn+"', '"+comune+"', '"+residenza+"', '"+indirizzo+"', '"+telefono+"', '"+email+"', '"+password+"', "+sommaImportiPositivi+",null)");
        for(var row=0;row<result.length;row++){
            if(result[row].importo>0){
                if(result[row].provenienza.includes("@")==true){
                // QUERY CHE RIGUARDANO LE TRANSAZIONI DEI MITTENTI PER CONTO DI IMPORTI POSITIVI DEL REGISTRATARIO
                    querylist.push("UPDATE account SET importo=importo-"+result[row].importo+" WHERE email='"+result[row].provenienza+"'");
                    querylist.push("INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+result[row].provenienza+"','"+dataOggi+"','"+email+"',"+result[row].importo+",true)");

                }
        
                else{
                    var importoResult = result[row].importo;
                    var provenienzaResult = result[row].provenienza;
                    myvar.eseguiquery("SELECT email FROM paytypes WHERE codice='"+result[row].provenienza+"'",
                    function(risultato) {
                        if(risultato!="err" && risultato.length>0){
                            var emailm=risultato[0].email;
                            // QUERY CHE RIGUARDANO LE TRANSAZIONI DEI MITTENTI PER CONTO DI IMPORTI POSITIVI DEL REGISTRATARIO
                            querylist.push("UPDATE cards SET saldo=saldo-"+importoResult+" WHERE codice='"+provenienzaResult+"'");
                            querylist.push("INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+emailm+"','"+dataOggi+"','"+email+"',"+importoResult+",true)");
                        }
                        else{
                            querylist.push("err",cb);
                        }              
                    });
                }
            }
            else{
                // QUERY CHE RIGUARDANO LE NOTIFICHE PER CONTO DI IMPORTI NEGATIVI DEL REGISTRATARIO
                querylist.push("INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+email+"','"+dataOggi+"','"+result[row].provenienza+"',"+(-1*result[row].importo)+",false)");
            }
        querylist.push("DELETE FROM reghash WHERE emaildest='"+result[row].emaildest+"'");
        }
        myvar.transazione(querylist,
            function(risultato){
                analizza(risultato,cb);
            });        
}

/*
La function si occupa di rispondere al client.
*/

function analizza(risultato,cb){
    console.log(risultato);
    if(risultato!="err"){
        cb("1");
    }
    else{
        cb("0");
    }
}

module.exports={
    main:main
};
