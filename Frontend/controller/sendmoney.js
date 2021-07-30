/*
Script di frontend per inviare denaro ad utenti registrati o meno.
*/

var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
function scalaimporto(importo,email,flag,codice){
    var res=0;
    var idnotifica=(window.location.href).split("idnotifica=")[1];
    if(flag=="VIRTUAL") 
        res = richiedi("../../Backend/controller/sendmoney?operazione=VIRTUAL&idnotifica="+idnotifica+"&importo="+importo+"&email="+email+"&codice=0"+"&session_id="+session_id);
    else if(flag=="REAL")
        res = richiedi("../../Backend/controller/sendmoney?operazione=REAL&idnotifica="+idnotifica+"&importo="+importo+"&email="+email+"&codice="+codice+"&session_id="+session_id);
        
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
    }
    else {
			if(res!="nomoneys" && res!="nocorrectimport") 
                window.open("../view/info.html?errorcode=OKPAYMENT","_self",false);
            else if(res=="nomoneys")
                window.open("../view/info.html?errorcode=NOMONEYS","_self",false);
            else if(res=="nocorrectimport")
                window.open("../view/info.html?errorcode=NOCORRECTIMPORT","_self",false);
    } 
    return false;    
}

function listaMetodiPagamento(){
    var res=richiedi("../../Backend/controller/sendmoney?operazione=SELECTPAYTYPES"+"&session_id="+session_id);
    var lista = JSON.parse(res);
    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
        return false;
    }
    var tabella = document.getElementById("listapaytypes");
    for(var i=0;i<lista.length;i++){
        tabella.innerHTML+="<br>"+
        "<button class='btn btn-lg btn-primary btn-block text-uppercase' type='submit' onclick=\"return scalaimporto(document.getElementById('inputImporto').value,document.getElementById('inputEmail').value,'REAL','"+lista[i].codice+"')\" value='Paga'>PAGA CON "+lista[i].tipocarta+" "+lista[i].codice+"</button></td></tr>";
    }
    return true;

}



    

