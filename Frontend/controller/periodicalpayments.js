/*
Script di frontend per listare o eliminare abbonamenti.
*/

window.onload = function () { 
  
    listaAbbonamenti();
}


var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
    
    function listaAbbonamenti(){
        var res=richiedi("../../Backend/controller/periodicalpayments?operazione=SELECT"+"&session_id="+session_id);
        var lista = JSON.parse(res);
        if(res==0){
            window.open("../view/info.html?errorcode=ERROR","_self",false);
            return false;
        }
        var tabella = document.getElementById("listaperiodicalpayments");
        for(var i=0;i<lista.length;i++){
            tabella.innerHTML+="<tr><td>"+
            lista[i].nome+"</td><td>"+
            lista[i].piva+"</td><td>"+
            JSON.stringify(lista[i].dataavvio).substring(1,11)+"</td><td>"+
            lista[i].periodicita+"</td><td>"+
            lista[i].numeropagamenti+"</td><td>"+
            lista[i].importo+"</td>"+
            "<td><button onClick=eliminaAbbonamento("+lista[i].id+") value='Elimina' class='btn btn-primary'>ELIMINA</button></td></tr>";
        }
        return true;
    
    }
    
    function eliminaAbbonamento(id){
        var res=richiedi("../../Backend/controller/periodicalpayments?operazione=DELETE&id="+id+"&session_id="+session_id);
        if(res==0){
            window.open("../view/info.html?errorcode=ERROR","_self",false);
            return false;
        }
        window.open("../view/periodicalpayments.html", "_self");
    }
