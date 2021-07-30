/*
Script di frontend per listare le transazioni per conto dell'utente loggato,
con la possibilità di effettuare il download o inviare per mail/telegram l'estratto
conto mensile.
*/

window.onload = function () { 
  
    listaTransazioni();
}

var session_id=localStorage.getItem("PWYWSESSION_ID"); //Recupero della sessione corrente.
    
    function listaTransazioni(){
        var res=richiedi("../../Backend/controller/transactions?operazione=SELECT&session_id="+session_id);
        var emailLoggato = JSON.parse(res).emailLoggato;
        var lista = JSON.parse(res).risultatoQuery;
        if(res==0){
            window.open("../view/info.html?errorcode=ERROR","_self",false);
            return false;
        }
        var tabella = document.getElementById("listatransactions");
        for(var i=0;i<lista.length;i++){
            if(emailLoggato==lista[i].emailsend){
                lista[i].importo=(-1)*lista[i].importo;
            }

            tabella.innerHTML+="<tr><td>" +
            JSON.stringify(lista[i].data).substring(1,11)+"</td><td>"+
            lista[i].emailsend+"</td><td>"+
            lista[i].emailrecv+"</td><td>"+
            lista[i].importo+"</td>";

        }

        return true;
    
    }

          
    function downloadpdf() {

        doc = createpdf()
        doc.save('movimenti.pdf');

        return true;
    }

    function sendpdf(op,id) {

        doc = createpdf();
        var moddeduristring = btoa(doc.output());
        var params=[];
        var startchnum=0;
        var chnum=0;
        var frame=0;
        for(ch in moddeduristring){
            chnum++;
            if(chnum%5000==0||chnum==moddeduristring.length-1){
                params.push(moddeduristring.substring(startchnum,chnum));
                var pdfpart=moddeduristring.substring(startchnum,chnum);
                if(chnum>5000 && chnum!=moddeduristring.length-1)
                    frame=0.5;
                else if(chnum==moddeduristring.length-1)
                    frame=1;
                if(op=="INVIAEMAIL")
                    richiedi("../../Backend/controller/transactions?operazione="+op+"&frame="+frame+"&pdf="+pdfpart+"&session_id="+session_id);
                else if(op=="INVIATELEGRAM")
                richiedi("../../Backend/controller/transactions?operazione="+op+"&idtg="+id+"&frame="+frame+"&pdf="+pdfpart+"&session_id="+session_id);

                startchnum=chnum;
            }
        }

        return true;
    }

    function createpdf(){
        var res=richiedi("../../Backend/controller/transactions?operazione=DOWNLOAD&session_id="+session_id);
        var lista = JSON.parse(res).risultatoQuery;
        var emailLoggato = JSON.parse(res).emailLoggato;

        if(res==0){
            window.open("../view/info.html?errorcode=ERROR","_self",false);
            return false;
        }

        var doc = new jsPDF(); 
        var col = [["Data", "Eseguito da", "Ricevuto da", "Importo"]];
        var rows = [];
        
        for(var i=0;i<lista.length;i++){
            if(emailLoggato==lista[i].emailsend){
                lista[i].importo=(-1)*lista[i].importo;
            }
            var temp = [JSON.stringify(lista[i].data).substring(1,11), lista[i].emailsend, lista[i].emailrecv, lista[i].importo];
            rows.push(temp);
        }
        
        doc.autoTable({head: col, body: rows});

        return doc;
    }
        
