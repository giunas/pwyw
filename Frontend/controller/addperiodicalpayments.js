/*
Script di frontend per l'aggiunta di abbonamenti.
*/

var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.

window.onload = function () { 

    listacomm();

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
    var res=richiedi("../../Backend/controller/sendcommoney?operazione=SELECTPAYTYPES&session_id="+session_id);
    var lista = JSON.parse(res);
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
        return false;
    }

    document.getElementById("listapaytypes").innerHTML = "";

    var tabella = document.getElementById("listapaytypes");
    

    tabella.innerHTML+="<div class='form-check'>"+ 
        "<input id='metodo' class='form-check-input' type='radio' name='metodo' style='height:29px;' value='null' checked>"+
        "<label class='form-control' style='border:0px'>Portafoglio</label>"+
    "</div>";

    for(var i=0;i<lista.length;i++){
        tabella.innerHTML+="<div class='form-check'>"+ 
            "<input id='metodo' class='form-check-input' type='radio' name='metodo' style='height:29px;' value='"+lista[i].codice+"'>"+
            "<label class='form-control' style='border:0px'>"+lista[i].codice+ " " + lista[i].tipocarta+"</label>"+
        "</div>";
    }

    tabella.innerHTML+='<br><button type="submit" value="Aggiungi Abbonamento" class="btn btn-primary">Aggiungi Abbonamento</button>';
    document.getElementById("formperiodical").setAttribute('onSubmit','return aggiungiabbonamento("'+piva+'"'+',document.getElementById("inputDataavvio").value,document.getElementById("inputPeriodicita").value,document.getElementById("inputNumeropagamenti").value,document.getElementById("inputImporto").value,document.querySelector("input[name=metodo]:checked").value)');
    return true;
}

function aggiungiabbonamento(piva,dataavvio,periodicita,numeropagamenti,importo, paytype){
    var res=richiedi("../../Backend/controller/addperiodicalpayments?piva="+piva+"&dataavvio="+dataavvio+"&periodicita="+periodicita+"&numeropagamenti="+numeropagamenti+"&importo="+importo+"&paytype="+paytype+"&session_id="+session_id);
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
    }
    else{
        if(res!="NOTAUTH"){
            window.open("../view/info.html?errorcode=OKPERIODICAL","_self",false);
        }
    }
    return false;
}