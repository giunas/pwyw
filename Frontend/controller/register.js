/*
Script di frontend per registrare un visitatore.
*/

window.onload = function () { 
  
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); 
  var yyyy = today.getFullYear();
  
  today = yyyy + '-' + mm + '-' + dd;
  document.getElementById("inputNascita").max=today; 

}

function registra(nome, cognome, gender, ddn, comune, residenza, indirizzo, telefono, email, password,cpassword){

    var hash=(window.location.href).split("hash=")[1];
    var cf=calcolaCf(nome,cognome,gender,ddn,comune);

    var res=-1; 
    if (matchPSW(password,cpassword)==true){
      var res = richiedi("../../Backend/controller/register?hash="+hash+"&cf="+cf+"&nome="+nome+"&cognome="+cognome+"&gender="+gender+"&ddn="+ddn+"&comune="+comune+"&residenza="+residenza+"&indirizzo="+indirizzo+"&email="+email+"&telefono="+telefono+"&password="+password); // RICHIESTA HTTP
    }

    if (res!=0){
				if(res!=-1)
          window.open("../view/info.html?errorcode=OKREGISTRATION","_self",false);
				else {
          //document.write("Le password non coincidono!");
          var popup = document.getElementById("popup");
          popup.innerHTML="<div class='alert alert-danger alert-dismissible fade show'><strong>Le password non coincidono.</strong>"+
          "<button type='button' class='close' data-dismiss='alert'>&times;</button></div>";
        }
    }
    else{
      window.open("../view/info.html?errorcode=ERROR","_self",false);
    }
    return false;
  }

  function matchPSW(pwd1,pwd2){
    if(pwd1==pwd2){
      return true;
    }
    return false;
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

  
