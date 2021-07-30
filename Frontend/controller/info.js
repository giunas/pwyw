window.onload = function () { 
  
    elaboraErrore();
}

function elaboraErrore() {
    var err =(window.location.href).split("errorcode=")[1];

    if(err == "OKPAYTYPE") {
        editmessage("Metodo di pagamento aggiunto.");
    }
    else if(err == "OKPERIODICAL"){
        editmessage("Abbonamento aggiunto.");
    }
    else if(err == "OKUPDATEPROFILE"){
        editmessage("Informazioni aggiornate.");
    }
    else if(err== "OKPWDUPDATE"){
        editmessage("Password modificata.");
    }
    else if(err== "NOMATCHPWD"){
        editmessage("Le password non coincidono.");
    }
    else if(err== "OKREGISTRATION"){
        editmessage("Registrazione effettuata.")
    }
    else if(err== "OKREQUEST"){
        editmessage("Richiesta di denaro inviata.");
    }
    else if(err== "OKPAYMENT"){
        editmessage("Versamento di denaro effettuato.");
    }
    else if(err== "NOMONEYS"){
        editmessage("Non ci sono soldi. Siamo un po' a secco, eh?");
    }
    else if(err== "NOCORRECTIMPORT"){
        editmessage("Per favore inserisci l'importo specificato dalla richiesta.");
    }
    else if(err== "AUTHFAILED"){
        editmessage("Dati d'accesso errati.");
    }
    else {
        editmessage("Oops! Qualcosa è andato storto :(");
    }
}

function editmessage(message) {

    var text = document.getElementById("text");
    text.innerHTML = message;
}