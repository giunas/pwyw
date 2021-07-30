/*
Script di frontend per deautenticare l'utente.
*/

var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
function slogga(){
    var res=richiedi("../../Backend/controller/logout"+"?session_id="+session_id);
    if (res==0)
         window.open("../view/info.html?errorcode=ERROR","_self",false);
    else{
				localStorage.removeItem("PWYWSESSION_ID");
        window.open("login.html","_self",false);
		}
}
