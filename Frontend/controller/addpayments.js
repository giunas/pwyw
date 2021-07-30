    /*
    Script di frontend per l'aggiunta di metodi di pagamento.
    */
    
    var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
    function registraCarta(codcarta, tipocarta, scadenza, CVV){

        var res = richiedi("../../Backend/controller/addpayments?ibanorcard=CARD&codice="+codcarta+"&tipocarta="+tipocarta+"&scadenza="+scadenza+"&CVV="+CVV+"&session_id="+session_id); 
  
      if (res !=0){
        window.open("../view/info.html?errorcode=OKPAYTYPE","_self",false);
      }

      else{
        window.open("../view/info.html?errorcode=ERROR","_self",false);
      }
      return false;
    }

    function registraIBAN(IBAN){

        var res = richiedi("../../Backend/controller/addpayments?ibanorcard=IBAN&codice="+IBAN+"&session_id="+session_id); // RICHIESTA HTTP
  
        if (res !=0){
            window.open("../view/info.html?errorcode=OKPAYTYPE","_self",false);
          }
    
          else{
            window.open("../view/info.html?errorcode=ERROR","_self",false);
          }
          return false;
        }


