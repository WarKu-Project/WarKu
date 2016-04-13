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

/**
* Declare important variable
*/
/** Declare number of player counter **/
global.num_player = 0;

/**
* Declare inner module function
*/
/** Function to Update number of player **/
function updateNumberPlayer(){
  con.query('SELECT COUNT(pid) AS num_player FROM player',function(err,rows) {
    if (err) throw err;
    console.log('Query result : '+rows);
    global.num_player = rows[0].num_player;
    console.log('Number of player is updated! = '+global.num_player);
  });
}

/**
* Declare export module function
*/
/** Function to create new player **/
exports.createPlayer = function(info) {
  console.log('Received Data = '+info);
  //create dictionary and adapt json array to simulate row of sql
  var player = {pid : global.num_player,username : info['username'],password : info['password'],email : info['email']};
  con.query('INSERT INTO player SET ?',player,function(err,rows) {
    if (err) throw err;
    console.log('Success! New Player Created!!!');
    //Update Number of player to the server
    updateNumberPlayer();
  })
}
/**Function to authorize player**/
exports.authorize = function(info) {
  this.in = false;
  console.log('Received Data = '+info);
  var player = [info['username'],info['password']];
  console.log(player);
  con.query('SELECT username FROM player WHERE username=? AND password=?',player,function(err,rows) {
    if (err) throw err;
    if (rows.length==0) console.log('Player doesn\'t exist');
    else {
      this.in = true;
      console.log('Player '+rows[0].username+'is authorized.');
    }
  });
  return this.in;
}

/**
* First access done
*/
updateNumberPlayer();
