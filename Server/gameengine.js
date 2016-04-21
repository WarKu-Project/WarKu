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

/** PLAYER PART **/

//number of player counter
global.player_counter = 0;

/** Function to update number of player **/
function updateNumberPlayer(){
  con.query('SELECT COUNT(pid) AS num_player FROM player',function(err,rows) {
    if (err) throw err;
    console.log('Query result : '+JSON.stringify(rows));
    global.num_player = rows[0].num_player;
    console.log('Number of player is updated! = '+global.num_player);
  });
}
//Update Number of player from database for first time
updateNumberPlayer();

/** Function to verify player **/
exports.verify = function(info) {
  this.in = false;
  console.log('Received Data = '+JSON.stringify(info));
  con.query('SELECT username FROM player WHERE username=? AND password=?',[info['username'],info['password']],function(err,rows){
    if (err) throw err;
    console.log('Query result'+JSON.stringify(rows));
    if (rows.length==0) console.log('Player doesn\'t exist');
    else {
      this.in = true;
      console.log('Player '+rows[0].username+'is verify.');
    }
  });
  return this.in;
}

/** Function to check that player is existing in Database **/
exports.exist = function(info) {
  this.in = false;
  con.query('SELECT username FROM player WHERE username = ? OR email = ?',[info['username'],[info['email']]],function(err,rows) {
    if (err) throw err;
    console.log('Query result'+JSON.stringify(rows));
    if (rows.length==0) console.log('Player doesn\'t exist');
    else{
      this.in = true;
      console.log('Player '+rows[0].username+'is existed');
    }
  });
  return this.in;
}

/** Function to create new player **/
exports.createPlayer = function(info) {
  console.log('Received Data = '+JSON.stringify(info));
  //create dictionary and adapt json array to simulate row of sql
  var player = {username : info['username'],password : info['password'],email : info['email']};
  con.query('INSERT INTO player SET ?',player,function(err) {
    if (err) throw err;
    console.log('Success! New Player Created!!!');
    //Update Number of player to the server
    updateNumberPlayer();
  });
  this.pid = 1;
  con.query('SELECT pid FROM player ORDER BY pid DESC LIMIT 1',function(err,rows) {
    if (err) throw err;
    console.log('Query Result : '+JSON.stringify(rows));
    this.pid = rows[0].pid;
    console.log("Current Pid = "+this.pid);
      initFirstVillege(this.pid);
  });
  console.log("Current Pid = "+this.pid);
}


/** VILLEGE PART **/

/** Function to assign player to the villege randomly **/
function initFirstVillege(pid) {
  this.vid = 0;
  console.log(pid +" : "+vid);
  con.query('SELECT vid FROM villege WHERE vid <=100 AND pid = 0 ORDER BY RAND() LIMIT 1',function(err,rows) {
    if (err) throw err;
    console.log('Query Result : '+JSON.stringify(rows));
    this.vid = rows[0].vid;
      updateOwnerOfVillege(pid,this.vid);
  });
}
/** Function that player conquer the villege **/
function updateOwnerOfVillege(pid,vid) {
  con.query('UPDATE villege SET pid = ? WHERE vid = ?',[pid,vid],function(err,result) {
    if (err) throw err;
    else {
      console.log('Changed ' + result.changedRows + ' rows');
      console.log("Player "+pid+" : Villege "+vid);
    }
  })
}
