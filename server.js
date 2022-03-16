//Dependencies//
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const http = require('http');
const path = require("path");
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");


//PORTS//
var app = express();
var PORT = 1010;

//Create Server//
var server = http.createServer(app);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:100
});

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use(limiter);
//Set up DB //
let db = new sqlite3.Database('tab');
db.run('CREATE TABLE IF NOT EXISTS tab(id TEXT,name TEXT)');

//ROUTES//
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'./public/form.html'));
});
//Set up a GET request to render our HTML PAGE


// Add
app.post("/add", function (req, res) {
    db.serialize(() => {
      db.run(
        "INSERT INTO tab(id,name) VALUES(?,?)",
        [req.body.id, req.body.name],
        function (err) {
          if (err) {
              res.send('an error has ocerd')
            return console.log(err.message);
          }
          console.log("New employee has been added!");
          res.send(
            "New movie has been added into the database with Movie = " +
              req.body.id +
              " and directer = " +
              req.body.name
          );
        }
      );
    });
  });


// View
app.post('/view', function(req,res){
    db.serialize(()=>{
        db.each('SELECT id ID, name NAME FROM tab WHERE name =?',[req.body.name],function(err,row){
            if (err){
                res.send("ERROR encouterd while displaying");
                return console.error(err.message);
            }
            res.send(` ID:  ${row.ID},    Name: ${row.NAME}`);
            console.log("ENTRY deslayed sucsesfull")
        });
    });
});


//Update
app.post('/update', function(req,res){
    db.serialize(()=>{
        db.run('UPDATE tab SET name = ? WHERE id = ?', [req.body.name,req.body.id],
        function(err){
            if(err){
                res.send("Error encounteered while updating");
                return console.error(err.message);
            }
            res.send("Entry updated successfully");
            console.log("Entry updated sucessfully");
        });
    });
});
// Delete
app.post('/delete',function(req,res){
    db.serialize(()=>{
        db.run('DELETE FROM tab WHERE id = ?', req.body.id,
        function(err){
            if(err){
                res.send("Error encounteered while deleteing");
                return console.error(err.message);
            }
            res.send("Delete successfully");
            console.log("Delete sucessfully");
        });
    });
});
// Closing the database connection.
app.get('/close', function(req,res){
    db.close((err)=>{
        if(err){
            res.send('There is some error in closing');
            return console.error(err.message);
        }
        console.log('Closing the conection');
        res.send('database has been closed');
    });
});


//Start your Server
server.listen(1010,function(){
    console.log("server is listening on port" + PORT);
});
