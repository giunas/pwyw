/*
Lo script si occupa di creare un PDF dei movimenti del mese corrente per un determinato utente,
inviare mail o messaggi su telegram che possono contenere o meno tale PDF in allegato.
In fase di creazione del PDF, viene creato un file temporaneo la cui rimozione è effettuata
al termine dell'invio. I file temporanei sono memorizzati all'interno della directory temp.
*/

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var nodemailer = require('nodemailer');

tokentg = "875348816:AAEXXJhM5OtqiHMSa22Lir0H8ReT27knRh4";

var sendTextTg=function(text) {
  var xhttp = new XMLHttpRequest();
  var url = 'https://api.telegram.org/bot' + tokentg + '/sendMessage?chat_id=' + chatId + '&text=' + text;

  xhttp.open("GET", url);
  xhttp.send();
}

var sendFileTg=function(pdfBinary, idtg,cripted,frame) {
  const request = require('request');
  const fs = require('fs');
  const chatId = idtg;
  const tokentg = "875348816:AAEXXJhM5OtqiHMSa22Lir0H8ReT27knRh4";

  const url = 'https://api.telegram.org/bot'+tokentg+'/sendDocument';

  let r = request(url, (err, res, body) => {
    if(err) console.log(err)

    else {
      if(frame==1)
        destroyPdf(cripted);
    }
    console.log(body);
  })

  let f = r.form();
  f.append('chat_id', chatId);

  var pdffilename=buildPdf(pdfBinary,cripted,frame);
  if (frame==1) {
    f.append('document', fs.createReadStream(pdffilename)); 
  }



}
function sendEmailPdf(pdfBinary,cripted,frame,emailCookie){
  var pdffilename=buildPdf(pdfBinary,cripted,frame);
    if (frame==1){
      var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'progwebemobile@gmail.com',
          pass: '12321343'
      }
      });


        var mailOptions = {
        from: 'progwebemobile@gmail.com',
        to: emailCookie,
        subject: 'Movimenti mensili',
        text: 'In allegato la tua lista di movimenti del mese corrente.',
        attachments: [
          {
              path: pdffilename

          }
        ]
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        destroyPdf(cripted);
  });
}
}

/*
Funzioni responsabili alla creazione e distruzione del PDF. Ogni PDF è univoco per session_id
espresso dal parametro cripted. Frame è un parametro che permettere di suddividere
grandi frammenti di base64 in frammenti di dimensioni inferiori, per facilitarne la 
ricostruzione.
*/

function buildPdf(pdfBinary,cripted,frame) {

  var pdfB64 = pdfBinary.split(" ").join("+"); //Correzione del base64 ricevuto dal frontend.

  var fs = require('fs'); 

  var filename = './temp/tmp-'+cripted+".txt";

  if(frame==0)
    fs.writeFileSync(filename,pdfB64);
  else if(frame==0.5)
    fs.appendFileSync(filename, pdfB64);
  else{
      fs.appendFileSync(filename, pdfB64);
      var pdffilename = './temp/tmp-'+cripted+".pdf";
      fs.writeFileSync(pdffilename,(Buffer.from(fs.readFileSync(filename, 'utf-8'), 'base64').toString('binary')));
      return pdffilename;
  }
}

function destroyPdf(cripted){
      var fs = require('fs'); 
       fs.unlink("./temp/tmp-"+cripted+".pdf", (err) => {
              if (err) {
              console.error(err)
              return
              }
          
              //txt rimosso.
          });
          fs.unlink("./temp/tmp-"+cripted+".txt", (err) => {
            if (err) {
            console.error(err)
            return
            }
        
            //pdf rimosso.
        });   
}

module.exports={
  sendTextTg : sendTextTg,
  sendFileTg: sendFileTg,
  sendEmailPdf: sendEmailPdf
};