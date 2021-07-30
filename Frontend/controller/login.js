	/*
	Script di frontend per l'autenticazione e costruzione del session_id.
	*/
	
	window.onload=checkSessioneGiaMemorizzata();	


	function checkSessioneGiaMemorizzata(){
		var sessione_corrente=localStorage.getItem("PWYWSESSION_ID");
		var res = richiedi("../../Backend/controller/panel?operazione=AUTH"+"&session_id="+sessione_corrente);
		if(res!=0){
			window.open("../view/panel.html","_self",false);
			return true;
		}
		return false;
	}


  function accedi(email,password){
    var res = richiedi("../../Backend/controller/login?email="+email+"&password="+password); 
    if (res !=0){
				if(res!="notauth"){
					localStorage.setItem("PWYWSESSION_ID",res);
        			window.open("../view/panel.html","_self",false);
				}
				else
				window.open("../view/info.html?errorcode=AUTHFAILED","_self",false);
    }
    else{
        window.open("../view/info.html?errorcode=ERROR","_self",false);
    }
    return false;
  }
