/*
Helper che permette connessioni, query singole o raggruppate in transazioni
(da intendere nel linguaggio SQL).
*/

var mysql = require('../../node_modules/mysql/index');

var con = mysql.createPool({
    connectionLimit : 10,
    host: "localhost",
    user: "root",
    password: "root",
    database: "Progetto",
    timezone: 'utc'
});



var eseguiquery = function(sql, callback) {
    con.query(sql, function (err, result, fields) {
        console.log(err);
        if (err) return callback("err");
        return callback(result);
    });
}

var eseguiTransazione = function(sqllist,i,connection,callback){
        connection.query(sqllist[i], function(err, result) {
          if (err) { 
              console.log(err);
            connection.rollback(function() {
              return callback("err");
            });
          }
          else{
            if(i<sqllist.length-1)
                eseguiTransazione(sqllist,i+1,connection,callback);
            else{
                connection.commit(function(err) {
                if (err) { 
                    connection.rollback(function() {
                    return callback("err");
                    });
                }
                console.log("Transazione Completata");
                connection.release();
                return callback(result);
                });
            }
        }
          });
}

var transazione=function(sqllist,callback)
{
    con.getConnection(function(err,connection){
        connection.beginTransaction(function(err) {
            if (err) { throw err; }    
            eseguiTransazione(sqllist,0,connection,callback);
        });
        if(err) return callback("err");
    });
}

module.exports={
    eseguiquery : eseguiquery,
    transazione: transazione
};

