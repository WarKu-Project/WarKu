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
con.query('CREATE TABLE player (pid int NOT NULL ,  username varchar(20) NOT NULL,  password varchar(20) NOT NULL,  email varchar(100) NOT NULL,  PRIMARY KEY(pid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('player table is created to MySQL');
});

/** Initialize villege table **/
con.query('CREATE TABLE villege (vid int NOT NULL,villege_name varchar(30) NOT NULL,wood int NOT NULL,clay int NOT NULL,iron int NOT NULL,crop int NOT NULL,pid int NOT NULL,PRIMARY KEY(vid),FOREIGN KEY(pid) REFERENCES player(pid))',function(err) {
    if (err) console.log(err.toString());
    else console.log('villege table is created to MySQL');
});

/** Initialize structure table (use as superclass of resource ,building and wall) **/
con.query('CREATE TABLE structure (sid int NOT NULL,level int NOT NULL,vid int NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(vid) REFERENCES villege(vid))',function(err) {
  if(err) console.log(err.toString());
  else console.log('structure table is created to MySQL');
});

/** Initialize resource table **/
con.query('CREATE TABLE resource (sid int NOT NULL,resource_pos int NOT NULL,resource_type varchar(20) NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(sid) REFERENCES structure(sid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('resource table is created to MySQL');
});

/** Initialize building table **/
con.query('CREATE TABLE building (sid int NOT NULL,building_pos int NOT NULL,building_type varchar(20) NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(sid) REFERENCES structure(sid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('building table is created to MySQL');
});

/** Initialize wall table **/
con.query('CREATE TABLE wall (sid int NOT NULL,wall_type varchar(20) NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(sid) REFERENCES structure(sid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('wall table is created to MySQL');
});

/** Initialize troop table **/
con.query('CREATE TABLE troop (tid int NOT NULL,type varchar(20) NOT NULL,amount int NOT NULL,level int NOT NULL,morale int NOT NULL,vid int NOT NULL,PRIMARY KEY(tid),FOREIGN KEY(vid) REFERENCES villege(vid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('troop table is created to MySQL');
});

/** Initialize hero table **/
con.query('CREATE TABLE hero (hid int NOT NULL,hero_name varchar(20) NOT NULL,level int NOT NULL,str int NOT NULL,def int NOT NULL,wis int NOT NULL,ability char(2),vid int NOT NULL,PRIMARY KEY(hid),FOREIGN KEY(vid) REFERENCES villege(vid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('hero table is created to MySQL');
});

/** Initialize task table **/
con.query('CREATE TABLE task (taskid int NOT NULL,endtime datetime NOT NULL,PRIMARY KEY(taskid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('task table is created to MySQL');
});

/** Initialize buildingtask table **/
con.query('CREATE TABLE buildingtask (taskid int NOT NULL,sid int NOT NULL,PRIMARY KEY(taskid),FOREIGN KEY(taskid) REFERENCES task(taskid),FOREIGN KEY(sid) REFERENCES structure(sid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('buildingtask table is created to MySQL');
});

/** Initialize trainingtask table **/
con.query('CREATE TABLE trainingtask (taskid int NOT NULL,type varchar(20) NOT NULL,amount int,starttime datetime NOT NULL,tid int NOT NULL,PRIMARY KEY(taskid),FOREIGN KEY(taskid) REFERENCES task(taskid),FOREIGN KEY(tid) REFERENCES troop(tid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('traingtask table is created to MySQL');
});

/** Initialize movingtask table **/
con.query('CREATE TABLE movingtask (taskid int NOT NULL,purpose char(3) NOT NULL,maceman_amount int,swordman_amount int,spearman_amount int,guardian_amount int,archer_amount int,scout_amount int,pathfinder_amount int,mountedarcher_amount int,mountedwarrior_amount int,heavymountedknight_amount int,ram_amount int,catapult_amount int,diplomat_amount int,settler_ammount int,home_id int NOT NULL,des_id int NOT NULL,PRIMARY KEY(taskid),FOREIGN KEY(taskid) REFERENCES task(taskid),FOREIGN KEY(home_id) REFERENCES villege(vid),FOREIGN KEY(des_id) REFERENCES villege(vid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('movingtask table is created to MySQL');
});

/** Initialize markettask table **/
con.query('CREATE TABLE markettask (taskid int NOT NULL,wood int,clay int,iron int,crop int,start_id int NOT NULL,des_id int NOT NULL,PRIMARY KEY(taskid),FOREIGN KEY(taskid) REFERENCES task(taskid),FOREIGN KEY(start_id) REFERENCES villege(vid),FOREIGN KEY(des_id) REFERENCES villege(vid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('markettask table is created to MySQL');
});
