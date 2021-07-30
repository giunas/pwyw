/*
Script di frontend per inviare denaro ad esercizi commerciali.
*/

var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.

window.onload = function () { 

    listacomm();

}

function scalaimporto(importo,flag,codice,piva){
    var res=0;
    if(flag=="VIRTUAL") 
        res = richiedi("../../Backend/controller/sendcommoney?operazione=VIRTUAL&importo="+importo+"&codice=0&piva="+piva+"&session_id="+session_id);
    else if(flag=="REAL")
        res = richiedi("../../Backend/controller/sendcommoney?operazione=REAL&importo="+importo+"&codice="+codice+"&piva="+piva+"&session_id="+session_id);

    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
    }
    else {
				if(res!="nomoneys")
                    window.open("../view/info.html?errorcode=OKPAYMENT","_self",false);
				else
                    window.open("../view/info.html?errorcode=NOMONEYS","_self",false);
    } 
    return false;
    
}

function listacomm(){
    var res=richiedi("../../Backend/controller/sendcommoney?operazione=SELECTCOMM&session_id="+session_id);
    var lista = JSON.parse(res);
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
        return false;
    }
    var tabella = document.getElementById("listaesecom");

    for(var i=0;i<lista.length;i++){
        tabella.innerHTML+="<tr><td>"+
        lista[i].nome+"</td><td>"+
        lista[i].piva+"</td><td><button id = 'formButton' onClick=popup('"+lista[i].piva+"'); value='Seleziona' class='btn btn-primary'>SELEZIONA</button></td></tr>";
    }

    return true;

}

function popup(piva) {

    $(document).ready(function(){

        $("#myModal").modal('show');

    });
    
    listaMetodiPagamento(piva); 
}

function listaMetodiPagamento(piva){
    var res=richiedi("../../Backend/controller/sendmoney?operazione=SELECTPAYTYPES&session_id="+session_id);
    var lista = JSON.parse(res);
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
        return false;
    }

    document.getElementById("listapaytypes").innerHTML = "";
    
    var tabella = document.getElementById("listapaytypes");

    tabella.innerHTML+="<button class='btn btn-lg btn-primary btn-block text-uppercase' type='submit' onclick=\"return scalaimporto(document.getElementById('inputImporto').value,'VIRTUAL',0,'"+piva+"')\" value='Paga' class='btn btn-primary'>PAGA CON IL PORTAFOGLIO</button>";
    for(var i=0;i<lista.length;i++){
        tabella.innerHTML+="<br>"+
        "<button class='btn btn-lg btn-primary btn-block text-uppercase' type='submit' onclick=\"return scalaimporto(document.getElementById('inputImporto').value,'REAL','"+lista[i].codice+"','"+piva+"')\" value='Paga' class='btn btn-primary'>PAGA CON "+lista[i].tipocarta+" "+lista[i].codice+"</button>";
    }

    return true;

}


