/*
Lo script viene eseguito all'avvio del server e si occupa di analizzare gli abbonamenti di tutti gli utenti.
Per un dato utente e per un dato abbonamento, la funzione compierà tante transazioni quanti sono i pagamenti previsti.
Ad ogni scadenza (calcolata dalla data d'avvio e dalla periodicità) la funzione memorizzerà una transazione ed aggiornerà
i saldi del metodo di pagamento scelto in fase di sottoscrizione.
La funzione viene effettivamente avviata ad ogni mezzanotte del giorno corrente. Ciò è reso possibile dal modulo node-cron.
*/

var myvar = require('./sqlhelper');
var cron = require('node-cron');

var main = function() {
    cron.schedule('0 0 * * *', () => {
        controllaAbbonamenti();
    });
}

function controllaAbbonamenti() {
    var data = new Date();
    var dd = String(data.getDate()).padStart(2, '0');
    var mm = String(data.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = data.getFullYear();

    data = yyyy + '-' + mm + '-' + dd;
    myvar.eseguiquery("SELECT id,emailsend,importo,piva,paytype FROM abbonamento WHERE DATE_ADD(dataavvio, INTERVAL periodicita DAY)='"+data+"'",
    function(result){
        querylist=[];
        for (var row=0;row<result.length;row++){
            controllaimporto(result,row,data);
        }
    });

}

function controllaimporto(result,row,data){
    var email=result[row].emailsend;
    var paytype=result[row].paytype;
    var importo = result[row].importo;
    if(paytype==null){
        myvar.eseguiquery("SELECT importo FROM account WHERE email='"+email+"' AND importo>=(SELECT coalesce(sum(importo),0) FROM reghash WHERE provenienza='"+
        email+"' AND importo>0)+"+importo,
            function(risultato){
                if(risultato.length>0){
                    console.log("Pagamento possibile");
                    pagaPerUtente(result,row,data);
                }
                else
                    console.log("Pagamento posticipato");
            });
    }
    else{
        myvar.eseguiquery("SELECT saldo FROM cards WHERE codice='"+paytype+"' AND saldo>=(SELECT coalesce(sum(importo),0) FROM reghash WHERE provenienza='"+
        paytype+"' AND importo>0)+"+importo,      
            function(risultato){
                if(risultato.length>0){
                    console.log("Pagamento possibile");
                    pagaPerUtente(result,row,data);
                }
                else
                    console.log("Pagamento posticipato");
            });  
    }
}


function pagaPerUtente(result,row,data){
    querylist=[];
    querylist.push("UPDATE abbonamento SET numeropagamenti=numeropagamenti-1 WHERE id="+result[row].id);
    if(result[row].paytype==null)
        querylist.push("UPDATE account SET importo=importo-"+result[row].importo+" WHERE email='"+result[row].emailsend+"'");
    else
        querylist.push("UPDATE cards SET saldo=saldo-"+result[row].importo+" WHERE codice='"+result[row].paytype+"'");               
    querylist.push("INSERT INTO usertrans(emailsend,data,emailrecv,importo,tipo) VALUES('"+result[row].emailsend+"','"+data+"','"+result[row].piva+"',"+result[row].importo+",true)");
    querylist.push("DELETE FROM abbonamento WHERE numeropagamenti=0");
    myvar.transazione(querylist,
        function(risultato){
            console.log("Analizzati Abbonamenti Per Utente");
    });
}

module.exports={
    main:main
};