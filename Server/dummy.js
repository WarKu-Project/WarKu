/**
* Initialize mysql Module
*/
var mysql = require('mysql');

/** Set up connection of mysql **/
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "warku"
});

/** Initialize player table **/
con.query('CREATE TABLE player (pid int,username varchar(20) NOT NULL,password varchar(20) NOT NULL,email varchar(50) NOT NULL,PRIMARY KEY(pid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('Create player table to mysql !!');
});

//Initialize npc in player table
con.query('INSERT INTO player (pid,username,password,email) value(0,\'Nature\',\'root\',\'bot@nomail.gg\')',function(err) {
  if (err) console.log(err.toString());
  else console.log('Nature is born');
})

/** Initialize villege table **/
con.query('CREATE TABLE villege (vid int,name varchar(30) DEFAULT \'New Villege\',x int NOT NULL,y int NOT NULL,wood int DEFAULT 750 , clay int DEFAULT 750,iron int DEFAULT 750, crop int DEFAULT 750,pid int DEFAULT 0,PRIMARY KEY(vid),FOREIGN KEY(pid) REFERENCES player(pid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('Create villege table to mysql !!');
});
