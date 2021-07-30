  /*
  Script di frontend per listare saldo, nome ed eventuali notifiche di richieste di denaro.
  */

  window.onload = function () { 
	var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
	 var res = richiedi("../../Backend/controller/panel?operazione=AUTH"+"&session_id="+session_id);
	 if(res!=0){
    autentica(res);
    mostraSoldi(res);
   }
	 else
    window.open("../view/info.html?errorcode=ERROR","_self",false);
  }

  function autentica(risultato){
    if(JSON.parse(risultato).length>0){
      document.getElementById("Nomen").innerHTML="Benvenuto "+JSON.parse(risultato)[0].nome;
      listaNotifiche(risultato);
    }
    else
      window.open("../view/info.html?errorcode=ERROR","_self",false);
  }

  function listaNotifiche(risultato) {
	var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
    var account = JSON.parse(risultato)[0];
    var email = account.email;
    var password=account.password;
    var tabella = document.getElementById("listanotifiche");
    var res = richiedi("../../Backend/controller/panel?operazione=SELECTNOTIFIES&email="+email+"?password="+password+"&session_id="+session_id);

    if(res==0) {
      window.open("../view/info.html?errorcode=ERROR","_self",false);
    }

    else{
      var lista = JSON.parse(res);
      for(var i=0;i<lista.length;i++){
        tabella.innerHTML+="<tr><td>"+
        lista[i].emailrecv+"</td><td>"+
        lista[i].importo+"</td><td><button onClick=window.open('sendmoney.html?idnotifica="+lista[i].id+"'"+",'_self',false) value='Paga' class='btn btn-primary'>PAGA</button></td></tr>";
    }
    }

  }

  function mostraSoldi(risultato) {
    document.getElementById("Importo").innerHTML="Il tuo saldo è di: "+JSON.parse(risultato)[0].importo+" EURO";
  }
