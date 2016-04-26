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
      saveStatus(rows[0].username);
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
  con.query('INSERT INTO recentvillegestatus(vid,lastvisitedtime) values(?,NOW())',vid,function(err,result) {
    if (err) throw err;
    console.log('Query : '+JSON.stringify(result));
    console.log('Init new villege status');
  })
}
/** Function to save villege status **/
function saveVillegeStatus(vid) {
  con.query('UPDATE recentvillegestatus SET lastvisitedtime = NOW() WHERE vid = ? ',vid,function (err) {
    if (err) throw err;
  })
}
/** Function to save status **/
function saveStatus(username,vid){
  con.query('UPDATE recentstatus SET vid = ? , lastvisitedtime = NOW() WHERE pid = (SELECT pid FROM player WHERE username = ?)',[vid,username],function(err,result) {
    console.log("Query : "+JSON.stringify(result));
    //console.log('Changed ' + result.changedRows + ' rows');
    console.log("Player "+username+" : Update recent status ");
  });
  saveVillegeStatus(vid);
}
/** Function to save status **/
function saveStatus(username){
  con.query('UPDATE recentstatus SET lastvisitedtime = NOW() WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function(err,result) {
    console.log("Query : "+JSON.stringify(result));
    console.log('Changed ' + result.changedRows + ' rows');
    console.log("Player "+username+" : Update recent status ");
  });
  con.query('SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function(err,result) {
    if (err) throw err;
    saveVillegeStatus(result[0].vid);
  })
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
    saveStatus(username);
    callback(null,rows);
  });
}
/** Function to load building **/
exports.loadBuilding = function(username,callback) {
  console.log("Received data "+username);
  con.query('SELECT type,level,pos FROM structure JOIN building ON structure.sid = building.sid WHERE vid = (SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ? ))',username,function(err,rows) {
    if (err) callback(err,null);
    console.log("Query Result : "+JSON.stringify(rows));
    saveStatus(username);
    callback(null,rows);
  });
}
/** Function to load wall **/
exports.loadWall = function(username,callback) {
  console.log("Received data "+username);
  con.query('SELECT type,level FROM structure JOIN wall ON structure.sid = wall.sid WHERE vid = (SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ? ))',username,function(err,rows) {
    if (err) callback(err,null);
    console.log("Query Result : "+JSON.stringify(rows));
    saveStatus(username);
    callback(null,rows);
  });
}
/** Function to format to two digit**/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}
/** Function to calculate next date **/
function calculateFinishDate(time,ah,ami,as) {
  console.log('Now : '+time.toString());
  time.setHours(time.getHours()+ah);
  time.setMinutes(time.getMinutes()+ami);
  time.setSeconds(time.getSeconds()+as);
  console.log('End : '+time.toString());
  return time.getFullYear()+'-'+twoDigits(1+time.getMonth())+'-'+twoDigits(time.getDate())+" "+twoDigits(time.getHours())+":"+twoDigits(time.getUTCMinutes())+":"+twoDigits(time.getSeconds());
}
var resource_info = {"crop" : {cost : [[70,90,70,20],[115,150,115,35],[195,250,195,55],[325,420,325,95],[545,700,545,155],[910,1170,910,260],[1520,1950,1520,435],[2535,3260,2535,725],[4235,5445,4235,1210],[7070,9095,7070,2020]], consumption : [0,0,0,0,0,1,1,1,1,1],produce : [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0,min : 0,sec : 30},{hour : 0,min : 1,sec : 15},{hour : 0,min : 3,sec : 0},{hour : 0,min : 5,sec : 30},{hour : 0,min : 9,sec : 20},{hour : 0,min : 15,sec : 30},{hour : 0,min : 25,sec : 50},{hour : 0,min : 36,sec : 30},{hour : 1,min : 8,sec : 15},{hour : 1,min : 45,sec : 30}]},"iron" : {cost : [[100,80,30,60],[165,135,50,100],[280,225,85,165],[465,375,140,280],[780,620,235,465],[1300,1040,390,780],[2170,1735,650,1300],[3625,2900,1085,2175],[6050,4840,1815,3630],[10105,8080,3030,6060]],consumption : [3,2,2,2,2,2,2,2,2,2],produce: [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0, min : 1, sec : 5},{hour : 0, min : 3, sec : 0},{hour : 0, min : 5, sec : 30},{hour : 0, min : 9, sec : 35},{hour : 0, min : 16, sec : 0},{hour : 0, min : 26, sec : 30},{hour : 0, min : 42, sec : 35},{hour : 1, min : 8, sec : 0},{hour : 1, min : 49, sec : 5},{hour : 2, min : 58, sec : 30}]},"clay" : {cost : [[80,40,80,50],[135,65,135,85],[225,110,225,140],[375,185,375,235],[620,310,620,390],[1040,520,1040,650],[1735,870,1735,1085],[2900,1450,2900,1810],[4840,2420,4840,3025],[8080,4040,8080,5050]],consumption : [2,1,1,1,1,5,5,5,5,5],produce: [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0, min : 0, sec : 40},{hour : 0, min : 1, sec : 50},{hour : 0, min : 3, sec : 30},{hour : 0, min : 6, sec : 20},{hour : 0, min : 10, sec : 50},{hour : 0, min : 18, sec : 10},{hour : 0, min : 29, sec : 50},{hour : 0, min : 48, sec : 20},{hour : 1, min : 18, sec : 10},{hour : 2, min : 5, sec : 30}]},"wood" : {cost : [[40,100,50,60],[65,165,85,100],[110,280,140,165],[185,465,235,280],[310,780,390,465],[520,1300,650,780],[870,2170,1085,1300],[1450,3625,1810,2175],[2420,6050,3025,3630],[4040,10105,5050,6060]],consumption : [2,1,1,1,1,2,2,2,2,2],produce: [15,25,45,75,125,155,255,355,505,725,1500],time : [{hour : 0, min : 0, sec : 50},{hour : 0, min : 2, sec : 0},{hour : 0, min : 3, sec : 50},{hour : 0, min : 7, sec : 0},{hour : 0, min : 11, sec : 50},{hour : 0, min : 18, sec : 50},{hour : 0, min : 32, sec : 0},{hour : 1, min : 51, sec : 50},{hour : 1, min : 23, sec : 50},{hour : 2, min : 14, sec : 50}]}}
function checkAvailableTask(username,callback) {
  con.query('SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function (err,result) {
    if (err) callback(err,null,null);
    console.log('Query Result : '+JSON.stringify(result));
    var vid  = result[0].vid;
    con.query('SELECT COUNT(*) AS numtask FROM structuringtask JOIN task ON structuringtask.tid = task.tid WHERE vid = ? ',vid,function(err,result) {
      if (err) callback(err,null,null);
      console.log('Query Result : '+JSON.stringify(result));
      var num = result[0].numtask;
      var endtime = result[0].endtime;
      con.query('SELECT level FROM building JOIN structure ON structure.sid = building.sid WHERE vid = ? and type = \'villagehall\'',vid,function(err,result) {
        if (err) callback(err,null,null);
        console.log('Query Result : '+JSON.stringify(result));
        var num_worker = result[0].level+1;
        if (num<num_worker) {
          //var available_worker = num_worker-num;
          console.log('Can update task');
          saveStatus(username);
          callback(null,true,vid);
        }
        else {
          console.log('All worker are busy');
          saveStatus(username);
          callback(null,false,null,null);
        }
      })
    })
  });
}
/** Function to get upgrade status of resource**/
exports.getResourceUpgradeStatus = function(username,pos,callback) {
  console.log('Received Data username = '+username+" pos = "+pos);
  checkAvailableTask(username,function(err,status,vid) {
    if (err) callback(err);
    console.log('Received Data status = '+status+" vid = "+vid);
    if (!status) {
      console.log('Can\'t upgrade');
      callback(null,false)
    }else {
      con.query('SELECT structure.sid AS sid,type,level FROM resource JOIN structure ON resource.sid = structure.sid WHERE vid = ? AND pos=?',[vid,pos],function (err,result) {
        if (err) callback(err);
        console.log('Query Result : '+JSON.stringify(result[0]));
        var sid = result[0].sid;
        var level = result[0].level;
        var type = result[0].type;
        con.query('SELECT level,endTime FROM structuringtask JOIN task ON structuringtask.tid = task.tid WHERE sid = ? ORDER BY structuringtask.tid DESC LIMIT 1',sid,function (err,result) {
          if (err) callback(err);
          console.log('Query Result : '+JSON.stringify(result));
          var startTime = new Date();
          if (result.length>0) {
            level = result[0].level;
            startTime = result[0].endTime;
          }
          if (level >= 10) {
            callback(err,false)
          }else {
            con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function (err,result) {
              if (err) callback(err);
              console.log('Query Result : '+JSON.stringify(result));
              var require_resource = resource_info[type].cost[level];
              var timeuse = resource_info[type].time[level];
              console.log(JSON.stringify(timeuse));
              if (result[0].wood>=require_resource[0]&&result[0].clay>=require_resource[1]&&result[0].iron>=require_resource[2]&&result[0].crop>=require_resource[3]){
                console.log('Can upgrade');
                var endTime = calculateFinishDate(startTime,timeuse.hour,timeuse.min,timeuse.sec);
                var left_resource = { wood : (result[0].wood-require_resource[0]) , clay : (result[0].clay-require_resource[1]), iron : (result[0].iron-require_resource[2]) , crop : (result[0].crop-require_resource[3])};
                callback(null,true,left_resource,sid,vid,endTime,level)
              }
              else {
                console.log('Can\'t Upgrade');
                callback(err,false);
              }
              saveStatus(username);
            })
          }
        })
      })
    }
  })
}
/** Function to upgrade resource **/
exports.upgradeResource = function(username,pos,callback){
  exports.getResourceUpgradeStatus(username,pos,function(err,status,left_resource,sid,vid,finishDate,level) {
    if (err) throw err;
    if (status){
      console.log('Receive data | left_resource : '+left_resource+' sid : '+sid + ' vid  :'+vid);
      con.query('UPDATE villege SET ? WHERE vid = ?',[left_resource,vid],function(err) {
        if (err) callback(err,null);
        console.log('Success update resource in villege');
      })
      con.query('INSERT INTO task(vid,endtime) values(?,?)',[vid,finishDate],function(err,result) {
        if (err) callback(err,null);
        var tid = result.insertId;
        console.log('Success update task');
        con.query('INSERT INTO structuringtask(tid,sid,level) values(?,?,?)',[tid,sid,level],function(err) {
          if (err) callback(err,null);
          console.log('Success update structuringtask');
          saveStatus(username);
          callback(err,true);
        })
      })
    }
  })
}
var building_info ={  "villagehall" : {  cost : [[70,40,60,20],[90,50,75,25],[115,65,100,35],[145,85,125,40],[190,105,160,55],[240,135,205,70],[310,175,265,90],[395,225,340,115],[505,290,430,145],[645,370,555,185]],  consumption : [2,1,1,1,1,2,2,2,2,2],  time : [{hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}]  },  "market" : {  cost : [  [80,70,120,70],[100,90,155,90],[130,115,195,115],[170,145,250,145],[215,190,320,190],[275,240,410,240],[350,310,530,310],[450,395,675,395],[575,505,865,505],[740,645,1105,645]  ],  consumption : [4,2,2,2,2,3,3,3,3,3],  time : [ {hour:0,min:06,sec:00},{hour:0,min:07,sec:58},{hour:0,min:10,sec:14},{hour:0,min:12,sec:52},{hour:0,min:15,sec:56},{hour:0,min:19,sec:28},{hour:0,min:23,sec:36},{hour:0,min:28,sec:22},{hour:0,min:33,sec:54},{hour:0,min:40,sec:20}]  },  "ballack" : {  cost : [  [210,140,260,120]	,[270,180,335,155]	,[345,230,425,195]	,[440,295,545,250]	,[565,375,700,320]	,[720,480,895,410]	,[925,615,1145,530],	[1180,790,1465,675]	,[1515,1010,1875,865],[1935,1290,2400,1105]	  ],  consumption : [4,2,2,2,2,3,3,3,3,3],  time : [  {hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}  ]  },  "academy" : {  cost:[[220,160,90,40],[280,205,115,50],[360,260,145,65],[460,335,190,85],[590,430,240,105],[755,550,310,135],[970,705,395,175],[1240,900,505,225],[1585,1155,650,290],[2030,1475,830,370]],  consumption : [4,2,2,2,2,3,3,3,3,3],    time : [  {hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}  ]  },  "stable" : {  cost : [[260,140,220,100],[335,180,280,130],[425,230,360,165],[545,295,460,210],[700,375,590,270],[895,480,755,345],[1145,615,970,440],[1465,790,1240,565],[1875,1010,1585,720],[2400,1290,2030,920]],  consumption : [5,3,3,3,3,3,3,3,3,3],  time : [{hour:0,min:07,sec:20},{hour:0,min:09,sec:30},{hour:0,min:12,sec:02},{hour:0,min:14,sec:58},{hour:0,min:18,sec:20},{hour:0,min:22,sec:16},{hour:0,min:26,sec:50},{hour:0,min:32,sec:08},{hour:0,min:38,sec:16},{hour:0,min:45,sec:24}]  },  "headquarter" : {  cost : [[700,670,700,240],[930,890,930,320],[1240,1185,1240,425],[1645,1575,1645,565],[2190,2095,2190,750],[2915,2790,2915,1000],[3875,3710,3875,1330],[5155,4930,5155,1765],[6855,6560,6855,2350],[9115,8725,9115,3125]],  consumption : [2,1,1,1,1,2,2,2,2,2],  time : [  {hour:0,min:07,sec:40},{hour:0,min:08,sec:54},{hour:0,min:10,sec:18},{hour:0,min:11,sec:58},{hour:0,min:13,sec:52},{hour:0,min:16,sec:06},{hour:0,min:18,sec:40},{hour:0,min:21,sec:40},{hour:0,min:25,sec:08},{hour:0,min:29,sec:10}]},"workshop" : {cost : [[460,510,600,320],[590,655,770,410],[755,835,985,525],[965,1070,1260,670],[1235,1370,1610,860],[1580,1750,2060,1100],[2025,2245,2640,1405],[2590,2870,3380,1800],[3315,3675,4325,2305],[4245,4705,5535,2950]],consumption : [3,2,2,2,2,2,2,2,2,2],time : [{hour:0,min:10,sec:00},{hour:0,min:12,sec:36},{hour:0,min:15,sec:36},{hour:0,min:19,sec:06},{hour:0,min:23,sec:10},{hour:0,min:27,sec:52},{hour:0,min:33,sec:20},{hour:0,min:39,sec:40},{hour:0,min:47,sec:02},{hour:0,min:55,sec:32}]},"smithy":{cost : [[180,250,500,160],[230,320,640,205],[295,410,820,260],[375,525,1050,335],[485,670,1340,430],[620,860,1720,550],[790,1100,2200,705],[1015,1405,2815,900],[1295,1800,3605,1155],[1660,2305,4610,1475]],consumption : [4,2,2,2,2,3,3,3,3,3],time : [{hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}]}, "granary" : {cost : [[80,100,70,20],[100,130,90,25],[130,165,115,35],[170,210,145,40],[215,270,190,55],[275,345,240,70],[350,440,310,90],[450,565,395,115],[575,720,505,145],[740,920,645,185]],consumption : [1,1,1,1,1,1,1,1,1,1],time : [{hour:0,min:05,sec:20},{hour:0,min:07,sec:12},{hour:0,min:09,sec:20},{hour:0,min:11,sec:50},{hour:0,min:14,sec:44},{hour:0,min:18,sec:04},{hour:0,min:21,sec:58},{hour:0,min:26,sec:30},{hour:0,min:31,sec:44},{hour:0,min:37,sec:48}]},"warehouse" : {cost : [[130,160,90,40],[165,205,115,50],[215,260,145,65],[275,335,190,85],[350,430,240,105],[445,550,310,135],[570,705,395,175],[730,900,505,225],[935,1155,650,290],[1200,1475,830,370]],consumption:[1,1,1,1,1,1,1,1,1,1],time : [{hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}]}}/** Function to get how many resource left in villege **/
/** Function to get resource left from villege **/
exports.getResourceOfVillege = function(username,callback) {
  con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = (SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ?))',username,function(err,result) {
    if (err) callback(err);
    console.log('Query Result : '+JSON.stringify(result));
    saveStatus(username);
    callback(null,result[0]);
  })
}
var building_require = {
  "villagehall" : [],
  "warehouse" : [],
  "granary" : [],
  "market" : [{type : "warehouse",level : 1},{type : "granary",level : 1}],
  "ballack" : [{type : "villagehall",level : 3}],
  "academy" : [{type : "villagehall",level : 5}],
  "stable" : [{type : "ballack",level : 3},{type : "academy",level : 5}],
  "smithy" : [{type : "academy",level : 3},{type : "ballack",level : 3}],
  "headquarter" : [{type : "villagehall",level : 5},{type : "ballack",level :5},{type : "academy",level : 5}],
  "workshop" : [{type : "academy",level : 3},{type : "ballack",level : 3}]
};
/** Function to generate SQL condition of building requirement **/
function generateSQLBuildingRequirement(type,vid) {
  console.log('Receive data type = '+type+" vid = "+vid);
  var require = building_require[type];
  console.log("Require :" +JSON.stringify(require));
  var statement = "";
  if (require.length>0) statement+= " AND "
  for (c in require){
    statement+= c.level+"<= (SELECT level FROM structure JOIN building ON structure.sid=building.sid WHERE type = \'"+c.type+"\' AND vid = "+vid+") ";
  }
  console.log("Statement : "+statement);
  return statement;
}
/** Function to create building **/
exports.getCreateBuildingStatus = function(username,pos,type,callback) {
  checkAvailableTask(username,function(err,status,vid) {
    if (err) callback(err);
    if (status){
      con.query('SELECT vid FROM building JOIN structure ON building.sid=structure.sid WHERE vid = ?'+generateSQLBuildingRequirement(type,vid),vid,function (err,result) {
        console.log('Start check on requirement');
        console.log('Query Result : '+JSON.stringify(result));
        if (result.length==1) {
          console.log('Can create!');
          var startTime = new Date();
          con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function(err,result) {
            if (err) calback(err);
            console.log('Query Result : '+JSON.stringify(result));
            var require_resource = building_info[type].cost[0];
            var timeuse = building_info[type].time[0];
            console.log(JSON.stringify(timeuse));
            if (result[0].wood>=require_resource[0]&&result[0].clay>=require_resource[1]&&result[0].iron>=require_resource[2]&&result[0].crop>=require_resource[3]){
              console.log('Can create');
              var endTime = calculateFinishDate(startTime,timeuse.hour,timeuse.min,timeuse.sec);
              var left_resource = { wood : (result[0].wood-require_resource[0]) , clay : (result[0].clay-require_resource[1]), iron : (result[0].iron-require_resource[2]) , crop : (result[0].crop-require_resource[3])};
              callback(null,true,vid,endTime,left_resource);
            }
            else {
              console.log('Can\'t create');
              callback(null)
            }
          })
        }else {
          console.log('Can\'t Create!');
          callback(err,false);
        }
      })
    }else {
      console.log('Can\'t create!');
      callback(err,false);
    }
  })
}
/** Function to Crate Buildign **/
exports.createBuilding = function(username,pos,type,callback) {
  console.log('CREATING');
  exports.getCreateBuildingStatus(username,pos,type,function(err,status,vid,endtime,left_resource) {
    con.query('UPDATE villege SET ? WHERE vid = ?',[left_resource,vid],function(err) {
      if (err) callback(err,null);
      console.log('Success update resource in villege');
    })
    con.query('INSERT INTO structure(level,vid) values(?,?)',[1,vid],function(err,result) {
      console.log('Query Result : '+JSON.stringify(result));
      if (err) callback(err,null);
      var sid = result.insertId;
      console.log('Success insert structure');
      con.query('INSERT INTO building(sid,pos,type) values(?,?,?)',[sid,pos,type],function(err) {
        if (err) callback(err,null);
          con.query('INSERT INTO task(vid,endtime) values(?,?)',[vid,endtime],function(err,result) {
            if (err) callback(err,null);
            var tid = result.insertId;
            console.log('Success update task');
            con.query('INSERT INTO structuringtask(tid,sid,level) values(?,?,?)',[tid,sid,0],function(err) {
              if (err) callback(err,null);
              console.log('Success update structuringtask');
              saveStatus(username);
              callback(err,true);
            })
          })
          console.log('Success Create');
      })
    })
  })
}
/** Function to get upgrade status of building**/
exports.getBuildingUpgradeStatus = function(username,pos,callback) {
  console.log('Received Data username = '+username+" pos = "+pos);
  checkAvailableTask(username,function(err,status,vid) {
    if (err) callback(err);
    console.log('Received Data status = '+status+" vid = "+vid);
    if (!status) {
      console.log('Can\'t upgrade');
      callback(null,false)
    }else {
      con.query('SELECT structure.sid,type,level FROM building JOIN structure ON building.sid = structure.sid WHERE vid = ? AND pos=?',[vid,pos],function (err,result) {
        if (err) callback(err);
        console.log('Query Result : '+JSON.stringify(result[0]));
        var sid = result[0].sid;
        var level = result[0].level+1;
        var type = result[0].type;
        con.query('SELECT level,endTime FROM structuringtask JOIN task ON structuringtask.tid = task.tid WHERE sid = ? ORDER BY structuringtask.tid DESC LIMIT 1',sid,function (err,result) {
          if (err) callback(err);
          console.log('Query Result : '+JSON.stringify(result));
          var startTime = new Date();
          if (result.length>0) {
            level = result[0].level+1;
            startTime = result[0].endTime;
          }
          if (level >= 10) {
            callback(err,false)
          }else {
            con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function (err,result) {
              if (err) callback(err);
              console.log('Query Result : '+JSON.stringify(result));
              var require_resource = building_info[type].cost[level-1];
              var timeuse = building_info[type].time[level-1];
              console.log(JSON.stringify(timeuse));
              if (result[0].wood>=require_resource[0]&&result[0].clay>=require_resource[1]&&result[0].iron>=require_resource[2]&&result[0].crop>=require_resource[3]){
                console.log('Can upgrade');
                var endTime = calculateFinishDate(startTime,timeuse.hour,timeuse.min,timeuse.sec);
                var left_resource = { wood : (result[0].wood-require_resource[0]) , clay : (result[0].clay-require_resource[1]), iron : (result[0].iron-require_resource[2]) , crop : (result[0].crop-require_resource[3])};
                callback(null,true,left_resource,sid,vid,endTime,level)
              }
              else {
                console.log('Can\'t Upgrade');
                callback(err,false);
              }
              saveStatus(username);
            })
          }
        })
      })
    }
  })
}
/** Function to building resource **/
exports.upgradeBuilding = function(username,pos,callback){
  exports.getBuildingUpgradeStatus(username,pos,function(err,status,left_resource,sid,vid,finishDate,level) {
    if (err) throw err;
    if (status){
      console.log('Receive data | left_resource : '+left_resource+' sid : '+sid + ' vid  :'+vid);
      con.query('UPDATE villege SET ? WHERE vid = ?',[left_resource,vid],function(err) {
        if (err) callback(err,null);
        console.log('Success update resource in villege');
      })
      con.query('INSERT INTO task(vid,endtime) values(?,?)',[vid,finishDate],function(err,result) {
        if (err) callback(err,null);
        var tid = result.insertId;
        console.log('Success update task');
        con.query('INSERT INTO structuringtask(tid,sid,level) values(?,?,?)',[tid,sid,level],function(err) {
          if (err) callback(err,null);
          console.log('Success update structuringtask');
          saveStatus(username);
          callback(err,true);
        })
      })
    }
  })
}
/** Function to convert datetime to Date() **/
function covertToDate(datetime) {
  var datetime_arr = datetime.split('T');
  var date = datetime_arr[0].split('-');
  var time = (datetime_arr[1].split('.'))[0].split(':');
  return new Date(date[0],date[1],date[2],time[0],time[1],time[2]);
}
/** Function to calculate added resource **/
function calculateresource(lastvisit,resource,info,capacity) {
  console.log("Recieved data lastvisit : "+lastvisit.toString()+" resource : "+JSON.stringify(resource)+" info "+JSON.stringify(info));
  var produce_rate = [0,0,0,0];
  for (var i = 0;i<info.length;i++){
    if (info[i].type=="wood") produce_rate[0] += resource_info[info[i].type].produce[info[i].level];
    if (info[i].type=="clay") produce_rate[1] += resource_info[info[i].type].produce[info[i].level];
    if (info[i].type=="iron") produce_rate[2] += resource_info[info[i].type].produce[info[i].level];
    if (info[i].type=="crop") produce_rate[3] += resource_info[info[i].type].produce[info[i].level];
  }
  console.log('produce rate :' +produce_rate );
  var date_in_sec = lastvisit.getHours()*3600+lastvisit.getMinutes()*60+lastvisit.getSeconds();
  var now = new Date();
  var now_in_sec = now.getHours()*3600+now.getMinutes()*60+now.getSeconds();
  var diff_time = now_in_sec-date_in_sec;
  for (var i = 0;i<4;i++){
    if (i<3){
      if (resource[i]+produce_rate[i]*diff_time/3600<=capacity["warehouse"])
        resource[i]+=produce_rate[i]*diff_time/3600;
    }
    else {
      if (resource[i]+produce_rate[i]*diff_time/3600<=capacity["granary"])
        resource[i]+=produce_rate[i]*diff_time/3600;
    }
  }
  console.log(JSON.stringify(resource));
  return resource;
}
/** Function to get Capacity of granary and warehouse **/
exports.getCapacity = function(vid,callback) {
  var capacity = [1700,3100,5000,7800,11800,17600,25900,37900,55100,80000];
  con.query('SELECT level,type FROM structure JOIN building ON structure.sid = building.sid WHERE type IN (\'granary\',\'warehouse\')',function(err,result) {
    if (err) callback(err);
    var sumcapacity = {"granary" : 0, "warehouse" : 0};
    if (result.length == 0) callback(null,{"granary" : 800, "warehouse" : 800});
    else {
      for (var i = 0;i<result.length;i++){
        sumcapacity[result[i].type]+=capacity[result[i].level-1];
      }
      callback(null,sumcapacity);
    }
  })
}
/** Function to update resource **/
function updateResource(username) {
  console.log('Updating');
  con.query('SELECT recentvillegestatus.lastvisitedtime AS lastvisitedtime,recentvillegestatus.vid FROM recentvillegestatus JOIN recentstatus ON recentvillegestatus.vid = recentstatus.vid WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function (err,result) {
    console.log('Query Result : '+JSON.stringify(result));
    if (err) throw err;
    var datetime = result[0].lastvisitedtime;
    var vid = result[0].vid;
    exports.getCapacity(vid,function(err,sumcapacity) {
      if (err) throw err;
      var capacity = sumcapacity;
      exports.getResourceOfVillege(username,function (err,result) {
        console.log('Query Result : '+JSON.stringify(result));
        if (err) throw err;
        var resource = [result["wood"],result["clay"],result["iron"],result["crop"]];
        exports.loadResource(username,function (err,result) {
            console.log('Query Result : '+JSON.stringify(result));
            if (err) throw err;
            var now_resource = calculateresource(datetime,resource,result,capacity);
            console.log("Now Resouce : "+now_resource);
            con.query('UPDATE villege SET wood = ? ,clay = ? ,iron = ? ,crop = ? WHERE vid = ?',[now_resource[0],now_resource[1],now_resource[2],now_resource[3],vid],function (err) {
              if (err) throw err;
              console.log('Update resource');
            })
        })
      })
    })
  });
}
/** Function to update structuringtask **/
function updateStructure(username) {
  console.log('Updating');
  con.query('SELECT recentvillegestatus.lastvisitedtime,recentvillegestatus.vid FROM recentvillegestatus JOIN recentstatus ON recentvillegestatus.vid = recentstatus.vid WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function (err,result) {
    console.log('Query Result : '+JSON.stringify(result));
    if (err) throw err;
    var datetime = result[0].lastvisitedtime;
    var vid = result[0].vid;
    con.query('SELECT endtime,sid,level,structuringtask.tid FROM task JOIN structuringtask ON task.tid = structuringtask.tid WHERE vid = ?',vid,function (err,result) {
      console.log('Query Result : '+JSON.stringify(result));
      if (err) throw err;
      var sid = [];
      for (var i = 0;i<result.length;i++){
        var now = new Date();
        if (result[i].endtime<=now) {
          var tid = result[i].tid;
          con.query('UPDATE structure SET level = ? WHERE sid = ?',[result[i].level,result[i].sid],function(err) {
            if (err) throw err;
            console.log('Success');
            con.query('DELETE FROM task WHERE tid = ?',tid,function (err) {
              if (err) throw err;
              console.log('Success delete');
            })
            con.query('DELETE FROM structuringtask WHERE tid = ? ',tid,function (err) {
              if (err) throw err;
              console.log('Success Delete');
            })
          });
        }
      }
    })
  })
}
/** Update **/
exports.update = function(username){
  updateResource(username);
  updateStructure(username);
}
/** Function tov check what structing task is doing **/
exports.getStructingTask = function(username) {
  con.query('SELECT sid,level,endtime FROM task JOIN structuringtask ON task.tid = structuringtask.tid WHERE vid=(SELECT FROM )')
}
