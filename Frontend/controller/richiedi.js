/*
La seguente funzione serve ad effettuare richieste al server.
*/

function richiedi(filename){

    var esito=0;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          if (this.responseText!="0"){ 
            esito=this.response;
          }
          else{
              esito=0;
          }
      }
      else{
          esito=0;
      }
    };
  xhttp.open("GET", filename, false);
  xhttp.send();

  return esito;
}
