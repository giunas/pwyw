/*
Script di frontend per listare o eliminare metodi di pagamento.
*/

window.onload = function () { 
  
listaMetodiPagamento();
}
var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
function listaMetodiPagamento(){
    var res=richiedi("../../Backend/controller/deletepayments?operazione=SELECT"+"&session_id="+session_id); 
    var lista = JSON.parse(res);
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
        return false;
    }
    var tabella = document.getElementById("listapaytypes");
    for(var i=0;i<lista.length;i++){
        tabella.innerHTML+="<tr><td>"+
        lista[i].codice+"</td><td>"+
        lista[i].tipocarta+"</td><td><button onClick=eliminaMetodo('"+lista[i].codice+"') value='Elimina' class='btn btn-primary'>ELIMINA</button></td></tr>";
    }
    return true;

}

function eliminaMetodo(codice){
    var res=richiedi("../../Backend/controller/deletepayments?operazione=DELETE&codice="+codice+"&session_id="+session_id);
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
        return false;
    }
    window.open("../view/deletepayments.html", "_self");
}


