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
exports.verify = function(info,callback) {
  console.log('Received Data = '+JSON.stringify(info));
  con.query('SELECT username FROM player WHERE username=? AND password=?',[info['username'],info['password']],function(err,rows){
    if (err) callback(err,null);
    console.log('Query result'+JSON.stringify(rows));
    if (rows.length==0) {
      console.log('Player doesn\'t exist');
      callback(null,false);
    }else {
      console.log('Player '+rows[0].username+' is verify.');
      callback(null,true);
    }
  });
}
/** Function to check that player is existing in Database **/
exports.exist = function(info,callback) {
  con.query('SELECT username FROM player WHERE username = ? OR email = ?',[info['username'],[info['email']]],function(err,rows) {
    if (err) callback(err,null);
    console.log('Query result'+JSON.stringify(rows));
    if (rows.length==0) {
      console.log('Player doesn\'t exist');
      callback(null,false);
    }else{
      console.log('Player '+rows[0].username+'is existed');
      callback(null,true);
    }
  });
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
/** Function to init status **/
function initStatus(pid,vid) {
  con.query('INSERT INTO recentstatus(pid,vid,lastvisitedtime) values(?,?,NOW())',[pid,vid],function(err,result) {
    if (err) throw err;
    console.log('Query : '+JSON.stringify(result));
    console.log('Init new status');
  })
}
/** Function to save status **/
function saveStatus(pid,vid){
  con.query('UPDATE recentstatus SET vid = ? , lastvisitedtime = NOW() WHERE pid = ?)',[vid,pid],function(err,result) {
      console.log("Query : "+JSON.stringify(result));
    console.log('Changed ' + result.changedRows + ' rows');
    console.log("Player "+username+" : Update recent status ");
  });
}

/** VILLEGE PART **/
/** Function to assign player to the villege randomly **/
function initFirstVillege(pid) {
  this.vid = 0;
  console.log(pid +" : "+vid);
  con.query('SELECT vid FROM villege WHERE pid = 1 ORDER BY RAND() LIMIT 1',function(err,rows) {
    if (err) throw err;
    console.log('Query Result : '+JSON.stringify(rows));
    this.vid = rows[0].vid;
    updateOwnerOfVillege(pid,this.vid);
    initStatus(pid,this.vid);
  });
}
/** Function that player conquer the villege **/
function updateOwnerOfVillege(pid,vid) {
  con.query('UPDATE villege SET pid = ? WHERE vid = ?',[pid,vid],function(err,result) {
    if (err) throw err;
    else {
      console.log("Query : "+JSON.stringify(result));
      console.log('Changed ' + result.changedRows + ' rows');
      console.log("Player "+pid+" : Villege "+vid);
    }
  })
}
/** Function to load resource **/
exports.loadResource = function(username,callback){
  console.log("Received data " + username);
  con.query('SELECT type,level FROM structure JOIN resource ON structure.sid = resource.sid WHERE vid = (SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ? ))',username,function(err,rows) {
    if (err) callback(err,null);
    console.log("Query Result : "+JSON.stringify(rows));
    callback(null,rows);
  });
}
/** Function to load building **/
exports.loadBuilding = function(username,callback) {
  console.log("Received data "+username);
  con.query('SELECT type,level,pos FROM structure JOIN building ON structure.sid = building.sid WHERE vid = (SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ? ))',username,function(err,rows) {
    if (err) callback(err,null);
    console.log("Query Result : "+JSON.stringify(rows));
    callback(null,rows);
  });
}
/** Function to load wall **/
exports.loadWall = function(username,callback) {
  console.log("Received data "+username);
  con.query('SELECT type,level FROM structure JOIN wall ON structure.sid = wall.sid WHERE vid = (SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ? ))',username,function(err,rows) {
    if (err) callback(err,null);
    console.log("Query Result : "+JSON.stringify(rows));
    callback(null,rows);
  });
}
var resource_info = {"crop" : {cost : [[70,90,70,20],[115,150,115,35],[195,250,195,55],[325,420,325,95],[545,700,545,155],[910,1170,910,260],[1520,1950,1520,435],[2535,3260,2535,725],[4235,5445,4235,1210],[7070,9095,7070,2020]], consumption : [0,0,0,0,0,1,1,1,1,1],produce : [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0,min : 0,sec : 30},{hour : 0,min : 1,sec : 15},{hour : 0,min : 3,sec : 0},{hour : 0,min : 5,sec : 30},{hour : 0,min : 9,sec : 20},{hour : 0,min : 15,sec : 30},{hour : 0,min : 25,sec : 50},{hour : 0,min : 36,sec : 30},{hour : 1,min : 8,sec : 15},{hour : 1,min : 45,sec : 30}]},"iron" : {cost : [[100,80,30,60],[165,135,50,100],[280,225,85,165],[465,375,140,280],[780,620,235,465],[1300,1040,390,780],[2170,1735,650,1300],[3625,2900,1085,2175],[6050,4840,1815,3630],[10105,8080,3030,6060]],consumption : [3,2,2,2,2,2,2,2,2,2],produce: [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0, min : 1, sec : 5},{hour : 0, min : 3, sec : 0},{hour : 0, min : 5, sec : 30},{hour : 0, min : 9, sec : 35},{hour : 0, min : 16, sec : 0},{hour : 0, min : 26, sec : 30},{hour : 0, min : 42, sec : 35},{hour : 1, min : 8, sec : 0},{hour : 1, min : 49, sec : 5},{hour : 2, min : 58, sec : 30}]},"clay" : {cost : [[80,40,80,50],[135,65,135,85],[225,110,225,140],[375,185,375,235],[620,310,620,390],[1040,520,1040,650],[1735,870,1735,1085],[2900,1450,2900,1810],[4840,2420,4840,3025],[8080,4040,8080,5050]],consumption : [2,1,1,1,1,5,5,5,5,5],produce: [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0, min : 0, sec : 40},{hour : 0, min : 1, sec : 50},{hour : 0, min : 3, sec : 30},{hour : 0, min : 6, sec : 20},{hour : 0, min : 10, sec : 50},{hour : 0, min : 18, sec : 10},{hour : 0, min : 29, sec : 50},{hour : 0, min : 48, sec : 20},{hour : 1, min : 18, sec : 10},{hour : 2, min : 5, sec : 30}]},"wood" : {cost : [[40,100,50,60],[65,165,85,100],[110,280,140,165],[185,465,235,280],[310,780,390,465],[520,1300,650,780],[870,2170,1085,1300],[1450,3625,1810,2175],[2420,6050,3025,3630],[4040,10105,5050,6060]],consumption : [2,1,1,1,1,2,2,2,2,2],produce: [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0, min : 0, sec : 50},{hour : 0, min : 2, sec : 0},{hour : 0, min : 3, sec : 50},{hour : 0, min : 7, sec : 0},{hour : 0, min : 11, sec : 50},{hour : 0, min : 18, sec : 50},{hour : 0, min : 32, sec : 0},{hour : 1, min : 51, sec : 50},{hour : 1, min : 23, sec : 50},{hour : 2, min : 14, sec : 50}]}}
/** Function to get upgrade status of resource**/
exports.getResourceUpgradeStatus = function(username,pos,callback) {
  con.query('SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function(err,result) {
    if (err) callback(err,null);
    console.log("Query Result : "+JSON.stringify(result));
    var vid = result[0].vid;
    con.query('SELECT level,type FROM structure JOIN resource ON structure.sid = resource.sid WHERE vid = ? AND pos = ?',[vid,pos],function(err,result) {
      if (err) callback(err,null);
      console.log("Query Result : "+JSON.stringify(result));
      var level = result[0].level;
      var type = result[0].type;
      var require_resource = resource_info[type].cost[level];
      console.log("Require : "+require_resource);
      con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function(err,result) {
        if (err) callback(err,null);
        console.log("Query Result : "+JSON.stringify(result));
        if (result[0].wood>require_resource[0]&&result[0].clay>require_resource[1]&&result[0].iron>require_resource[2]&&result[0].crop>require_resource[3]){
          console.log('Can upgrade');
          callback(null,true);
        }
        else {
          console.log('Can\'t upgrade');
          callback(null,false);
        }
      })
    })
  })
}
