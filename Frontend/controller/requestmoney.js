/*
Script di frontend per richiedere denaro.
*/

var session_id=localStorage.getItem("PWYWYSESSION_ID"); //Recupero della sessione corrente.

function richiedidenaro(importo,email){
    var res=0;
    res = richiedi("../../Backend/controller/requestmoney?importo="+importo+"&email="+email+"&session_id="+session_id);

    if(res==0){
        window.open("../view/info.html?errorcode=ERROR","_self",false);
    }
    else {
        window.open("../view/info.html?errorcode=OKREQUEST","_self",false);
    }

    return false;
}



