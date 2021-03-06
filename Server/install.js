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
con.query('CREATE TABLE player (pid int NOT NULL AUTO_INCREMENT,username varchar(20) NOT NULL,password varchar(20) NOT NULL,email varchar(50) NOT NULL,PRIMARY KEY(pid),CONSTRAINT uk UNIQUE(username,password,email))',function(err) {
  if (err) console.log(err.toString());
  else console.log('Create player table to mysql !!');
});

/** Initialize village table **/
con.query('CREATE TABLE village (vid int  NOT NULL AUTO_INCREMENT,name varchar(30) DEFAULT \'New village\',x int NOT NULL,y int NOT NULL,wood float DEFAULT 750 , clay float DEFAULT 750,iron float DEFAULT 750, crop float DEFAULT 750,pid int DEFAULT 1,PRIMARY KEY(vid),FOREIGN KEY(pid) REFERENCES player(pid),CONSTRAINT coordinates UNIQUE(x,y))',function(err) {
  if (err) console.log(err.toString());
  else console.log('Create village table to mysql !!');
});

/** Initialize structure table **/
con.query('CREATE TABLE structure (sid int  NOT NULL AUTO_INCREMENT,level int DEFAULT 0,vid int NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(vid) REFERENCES village(vid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('Create structure table to mysql !!');
})

/** Initialize resource table **/
con.query('CREATE TABLE resource (sid int NOT NULL ,pos int NOT NULL,type varchar(10) NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(sid) REFERENCES structure(sid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('Create resource table to mysql !!');
});

//Initialize npc in player table
  con.query('INSERT IGNORE INTO player (username,password,email) value(\'Nature\',\'root\',\'bot@nomail.gg\')',function(err) {
    if (err) console.log(err.toString());
    else console.log('Nature is born');
  })
/** Initialize recentstatus tabke **/
con.query('CREATE TABLE recentstatus (pid int NOT NULL,vid int NOT NULL,PRIMARY KEY(pid),lastvisitedtime datetime DEFAULT NOW(),FOREIGN KEY(pid) REFERENCES player(pid),FOREIGN KEY(vid) REFERENCES village(vid))',function (err) {
  if (err) console.log(err.toString());
  else console.log('recentstatus is created to mysql');
})
/** Initialize Building table **/
con.query('CREATE TABLE building (sid int NOT NULL,pos int NOT NULL,type varchar(15) NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(sid) REFERENCES structure(sid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('building is created to mysql');
})
/** Initialize Wall table **/
con.query('CREATE TABLE wall (sid int NOT NULL,type varchar(5) NOT NULL,PRIMARY KEY(sid),FOREIGN KEY(sid) REFERENCES structure(sid))',function(err) {
  if (err) console.log(err.toString());
  else console.log('wall is created to mysql');
})
/** Initialize task table **/
con.query('CREATE TABLE task (tid int NOT NULL AUTO_INCREMENT,endtime datetime NOT NULL,vid INT NOT NULL,PRIMARY KEY(tid),FOREIGN KEY(vid) REFERENCES village(vid))',function (err) {
  if (err) console.log(err.toString());
  else console.log('task is created to mysql');
})
/** Initialize structuringtask table **/
con.query('CREATE TABLE structuringtask (tid int NOT NULL,type varchar(15) NOT NULL,sid int NOT NULL,PRIMARY KEY(tid),level int NOT NULL,pos int NOT NULL,FOREIGN KEY(tid) REFERENCES task(tid),FOREIGN KEY(sid) REFERENCES structure(sid))',function (err) {
  if (err) console.log(err.toString());
  else console.log('structuringtask is created to mysql');
})
/** Initialize recentvillagestatus table **/
con.query('CREATE TABLE recentvillagestatus(vid int NOT NULL,lastvisitedtime datetime NOT NULL,PRIMARY KEY(vid),FOREIGN KEY(vid) REFERENCES village(vid))',function (err) {
  if (err) console.log(err.toString());
  else console.log('recentvillagestatus is created to mysql');
})
/** Initilize markettask table **/
con.query('CREATE TABLE markettask (tid int NOT NULL,des_vid int NOT NULL, wood int DEFAULT 0,clay int DEFAULT 0,iron int DEFAULT 0,crop int DEFAULT 0,type char(1) DEFAULT \'S\',PRIMARY KEY(tid),FOREIGN KEY(des_vid) REFERENCES village(vid))',function (err) {
  if (err) console.log(err.toString());
  else console.log('markettask is created to mysql');
});
/** Initilize mail table **/
con.query('CREATE TABLE mail (mid int NOT NULL AUTO_INCREMENT,sendtime datetime NOT NULL,receiver_id int NOT NULL,sender_id int NOT NULL,title varchar(50) DEFAULT \'\',info varchar(100) DEFAULT \' \',PRIMARY KEY(mid),FOREIGN KEY(receiver_id) REFERENCES player(pid),FOREIGN KEY(sender_id) REFERENCES player(pid) )',function(err) {
  if (err) console.log(err.toString());
  else console.log('mail is created to mysql');
})
/** Initilize troop table **/
//con.query('CREATE TABLE troop (pid int NOT NULL,vid int NOT NULL,)')
//Initialize starter village
// for (var j = 0;j<100;j++){
//   var randomXY = [Math.floor(Math.random()*100),Math.floor(Math.random()*100)];
//   con.query('INSERT IGNORE INTO village(x,y) values(?,?)',randomXY,function(err,result) {
//     if (err) console.log(err.toString());
//     else {
//       console.log('village '+result.affectedRows+'is created!');
//     }
//   });
//   for (var i = 1;i<=16;i++){
//     con.query('INSERT INTO structure(vid) values((SELECT vid FROM village ORDER BY vid DESC LIMIT 1))',function(err) {
//       if (err) console.log(err.toString());
//       else console.log('structure inserted!');
//     });
//     var resource = global.resource_list[Math.floor(Math.random()*4)];
//     if (i<4) resource = 'crop';
//     con.query('INSERT INTO resource(sid,pos,type) values((SELECT sid FROM structure ORDER BY sid DESC LIMIT 1),?,?)',[i,resource],function(err) {
//       if (err) console.log(err.toString());
//       else {
//         console.log('Starter village is created');
//       }
//     });
//   }
// }
//
/*function checkExist(x,y,callback) {
  return con.query('SELECT vid FROM village WHERE x=? AND y=?',[i,j],function(err,result) {
    if (err) callback(err,null);
    if (result.length==0) return callback(null,false);
    else return callback(null,true);
  })
}*/
global.resource_list = ['wood','clay','iron','crop'];

//Initialize village
for (var i = 0;i<100;i++){
  for (var j = 0;j<100;j++){
    //if (checkExist(i,j)) {
      //if (err) console.log(err.toString());
      // console.log('village is existed');
      //else {
        con.query('INSERT IGNORE INTO village(x,y) values(?,?)',[i,j],function(err,result) {
          if (err) console.log(err.toString());
        });
          con.query('INSERT INTO recentvillagestatus(vid,lastvisitedtime) values((SELECT vid FROM village ORDER BY vid DESC LIMIT 1),NOW())',function (err) {
              if (err) console.log(err.toString());
              else console.log('village status inserted!');
          })

            con.query('INSERT INTO structure(vid,level) values((SELECT vid FROM village ORDER BY vid DESC LIMIT 1),1)',function(err) {
              if (err) console.log(err.toString());
              else console.log('structure inserted!');
            });
            con.query('INSERT INTO building(sid,pos,type) values((SELECT sid FROM structure ORDER BY sid DESC LIMIT 1),1,\'villagehall\')',function(err) {
                if (err) console.log(err.toString());
                else {
                  console.log('villagehall is created');
                }
            })
            for (var k = 1;k<=16;k++){
                  con.query('INSERT INTO structure(vid) values((SELECT vid FROM village ORDER BY vid DESC LIMIT 1))',function(err) {
                    if (err) console.log(err.toString());
                    else console.log('structure inserted!');
                  });
                  var resource = global.resource_list[Math.floor(Math.random()*4)];
                  con.query('INSERT INTO resource(sid,pos,type) values((SELECT sid FROM structure ORDER BY sid DESC LIMIT 1),?,?)',[k,resource],function(err) {
                    if (err) console.log(err.toString());
                    else {
                      console.log('Natural village is created');
                    }
                  });
            }
      //}
  //  }

  }
}
con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});
