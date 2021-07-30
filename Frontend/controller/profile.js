  /*
  Script di frontend per listare o aggiornare i dati dell'utente.
  */
  
  var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.

  function mostraCampi(){
    var res = richiedi("../../Backend/controller/profile?operazione=SELECT"+"&session_id="+session_id);
    if(res!=0 && res.length>0){
        res= JSON.parse(res);
        document.getElementById("inputNome").value=res.nome;
        document.getElementById("inputCognome").value=res.cognome;
        if(res.gender=="M")
            document.getElementById("Maschio").checked="checked";
        else   
            document.getElementById("Femmina").checked="checked";
        document.getElementById("inputNascita").value=JSON.stringify(res.ddn).substring(1,11);
        document.getElementById("inputComune").value=res.ln;
        document.getElementById("inputResidenza").value=res.residenza;
        document.getElementById("inputIndirizzo").value=res.indirizzo;
        document.getElementById("inputTelefono").value=res.telefono;
        document.getElementById("inputEmail").value=res.email;

    }
    else{
      window.open("../view/info.html?errorcode=ERROR","_self",false);
    }

  }

    function aggiorna(nome, cognome, gender, ddn, comune, residenza, indirizzo, telefono, email){

      var cf=calcolaCf(nome,cognome,gender,ddn,comune);

      var res=-1; 

      var res = richiedi("../../Backend/controller/profile?operazione=UPDATE&cf="+cf+"&nome="+nome+"&cognome="+cognome+"&gender="+gender+"&ddn="+ddn+"&comune="+comune+"&residenza="+residenza+"&indirizzo="+indirizzo+"&email="+email+"&telefono="+telefono+"&session_id="+session_id); // RICHIESTA HTTP
      
  
      if (res !=0){
        window.open("../view/info.html?errorcode=OKUPDATEPROFILE","_self",false);
      }
      else{
        window.open("../view/info.html?errorcode=ERROR","_self",false);
      }
      return false;
    }

    function aggiornaPwd(oldPwd, newPwd, confPwd){
        
      var res=0;

      if (matchPSW(oldPwd,newPwd, confPwd)==true){
        var res = richiedi("../../Backend/controller/profile?operazione=UPDATENEWPWD&newPwd="+newPwd+"&session_id="+session_id); // RICHIESTA HTTP
      }
  
      if (res !=0){
        window.open("../view/info.html?errorcode=OKPWDUPDATE","_self",false);
      }
      return false;
    }

    function matchPSW(oldPwd,newPwd, confPwd) {
        var res = richiedi("../../Backend/controller/profile?operazione=CHECKOLDPWD&oldPwd="+oldPwd+"&session_id="+session_id);
        var verifica = false;
        if(res!=0 && res.length>0){
            if(newPwd == confPwd) {
                verifica = true;
            }

            else {
              window.open("../view/info.html?errorcode=NOMATCHPWD","_self",false);
            }
        }

        else {
          window.open("../view/info.html?errorcode=ERROR","_self",false);
        }
        return verifica;
    }


    function minAge(ddn){
      var dateString=ddn;
      var today = new Date();
      var birthDate = new Date(dateString);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
      {
          age--;
      }
      if (age<18){
        alert("Devi avere 18 anni, ricompila il campo");
        document.getElementById("inputNascita").value=null;
      }
    }
    function calcolaCf(nome, cognome, gender, ddn, comune) {
      var cf = new CodiceFiscale({
        name: nome,
        surname: cognome,
        gender: gender,
        day: ddn.split("-")[2],
        month: ddn.split("-")[1],
        year: ddn.split("-")[0],
        birthplace: comune
      });
  
      return cf["code"];
    }
