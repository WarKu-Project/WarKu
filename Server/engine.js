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

//Player part
/** Function to verify player **/
exports.verify = function(username,password,callback) {
  console.log('Engine Receive verify From Server : username = '+username+' password = '+password);
  //Get username by SQL with username and password from player table.
  con.query('SELECT username FROM player WHERE username=? AND password=?',[username,password],function(err,result){


    if (err) callback(err);
    else {
        //If SQL result is empty, this mean no player which has matched this username and this password.
        if (result.length==0) {
          console.log('Player Not Found!!');
          //Return false to the server
          callback(null,false);
        }else {
          //If result.length > 1 this mean username and password match with some player
          var username_result = result[0].username;
          console.log('Player '+username_result+" is found!");
          //Return true to the server
          callback(null,true,username_result)
        }
    }
  });
}
/** Function to check that player is existing in Database **/
exports.exist = function(username,email,callback) {
  console.log('Engine Receive exist From Server : username = '+username+' email = '+email);
  //Get username by SQL with username or email from player table.
  con.query('SELECT username FROM player WHERE username = ? OR email = ?',[username,email],function(err,result) {


    if (err) callback(err);
    else {
        //If SQL result is empty, this mean no player which has this username or this email.
        if (result.length==0) {
          console.log('Player doesn\'t exist');
          //Return false to the server
          callback(null,false);
        }else{
          //If result.length > 1 this mean username or email match with some player
          console.log('Player '+result[0].username+'is existed');
          //Return true to the server
          callback(null,true);
        }
    }
  });
}
/** Function to create new player **/
exports.createPlayer = function(username,password,email,callback) {
  console.log('Engine Receive createPlayer From Server : username = '+username+' password = '+password+' email = '+email);
  //INSERT NEW PLAYER TO SQL table player
  con.query('INSERT INTO player(username,password,email) values(?,?,?)',[username,password,email],function(err,result) {


    if (err) callback(err);
    else {
      //Receive latest pid
      var pid = result.insertId;
      console.log("Latest PID = "+pid);
      //Initilize Starter Villege by Random
      initFirstVillege(pid,function(err,vid) {
        //Assign player to random villege
        updateOwnerOfVillege(pid,vid,function (err) {
          if (err) callback(err);
          else {
            //Initilize player and villege status
            initStatus(pid,vid);
            saveVillegeStatus(vid);
          }
        });
      });
      callback(null,username)
    }
  });
}

/** Status PART **/
/** Function to init status **/
function initStatus(pid,vid) {
  console.log('initStatus with : pid = '+pid+' vid = '+vid);
  //Initilize recentstatus for player
  con.query('INSERT INTO recentstatus(pid,vid,lastvisitedtime) values(?,?,NOW())',[pid,vid],function(err,result) {


    if (err) console.log(err);
    else{
        console.log('Init recent status with pid = '+pid+" vid = "+vid);
        //Return null because it doesn't error    }
      }
  })
}
/** Function to save villege status **/
function saveVillegeStatus(vid) {
  console.log('initVillegeStatus with : vid = '+vid);
  //save recentvillegestatus for villege
  con.query('UPDATE recentvillegestatus SET lastvisitedtime  = NOW() WHERE vid = ?',vid,function(err,result) {


    if (err) console.log(err);
    else {
      console.log('Init new villege status with vid ='+vid);
    }
  })
}
/** Function to save status **/
function saveStatus(username,vid){
  console.log('saveStatus with : username = '+username+' vid = '+vid);
  //save recentstatus by update recent villege
  con.query('UPDATE recentstatus SET vid = ? , lastvisitedtime = NOW() WHERE pid = (SELECT pid FROM player WHERE username = ?)',[vid,username],function(err,result) {


    if (err) console.log(err);
    else {
      console.log("Update recentstatus with username = "+username+" vid = "+vid);
      //save villege status
      saveVillegeStatus(vid);
    }
  });
}
/** Function to save status **/
function saveStatus(username){
  console.log('saveStatus with : username = '+username);
  //save recentstatus by update current villege
  con.query('UPDATE recentstatus SET lastvisitedtime = NOW() WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function(err,result) {


    if (err) callback(err);
    else {
      console.log("Update recentstatus with username = "+username);
      //Select current villege from recentstatus
      getCurrentVillege(username,function (err,vid) {
        if (err) callback(err);
        else {
          saveVillegeStatus(vid);
        }
      })
    }
  });
}

/** VILLEGE PART **/
/** Function to assign player to the villege randomly **/
function initFirstVillege(pid,callback) {
  console.log("initialFirstVillege with pid = "+ pid);
  //Randomly SELECT vid From SQL table villege
  con.query('SELECT vid FROM villege WHERE pid = 1 ORDER BY RAND() LIMIT 1',function(err,result) {


    if (err) callback(err);
    else {
      //SELECT vid from sql
      var vid = result[0].vid;
      console.log('SELECT villege vid = '+vid);
      //Return vid for assign villege to player
      callback(null,vid);
    }
  });
}
/** Function that player conquer the villege **/
function updateOwnerOfVillege(pid,vid,callback) {
  console.log('UpdateOwnerOfVillege with : pid = '+pid+' vid = '+vid);
  //Assign villege to player in SQL
  con.query('UPDATE villege SET pid = ? WHERE vid = ?',[pid,vid],function(err,result) {

     ;
    if (err) callback(err);
    else {
      console.log("Player "+pid+" assign to Villege "+vid);
      //Return null because it doesn't error
      callback(null);
    }
  })
}
/** Fuction to get Current Villege **/
function getCurrentVillege(username,callback){
  console.log('getCurrentVillege with username = '+username);
  //SELECT vid FROM recentstatus
  con.query('SELECT vid FROM recentstatus WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function (err,result) {

     ;
    if (err) callback(err);
    else {
      var vid = result[0].vid;
      console.log("Current vid = "+vid);
      //Return vid
      callback(null,vid);
    }
  });
}

/**- LOAD PART -**/
function loadResource(vid,callback) {
  con.query('SELECT type,level FROM structure JOIN resource ON structure.sid = resource.sid WHERE vid = ?',vid,function(err,result) {

     ;
    if(err) callback(err);
    else {
      var list_of_resource = result;
      //console.log("Resource of "+vid+" is "+JSON.stringify(list_of_resource));
      // Return list of resource
      callback(null,list_of_resource);
      //save status

    }
  })
}
/** Function to Load List of Resource with type **/
exports.loadResource = function(username,callback){
  console.log("Engine Receive loadResource From Server username =  " + username);
  //get Current Villege
  getCurrentVillege(username,function(err,vid) {
    if (err) callback(err);
    else {
      //Select list of resource of current villege
      loadResource(vid,function (err,resource_list) {
          if (err) callback(err)
          else callback(null,resource_list)
      })
      saveStatus(username);
    }
  })
}
/** Function to Load list of building **/
exports.loadBuilding = function(username,callback) {
  console.log("Engine Receive loadBuilding From Server username =  " + username);
  //get Current Villege
  getCurrentVillege(username,function (err,vid) {
    if (err) callback(err);
    else {
        //Select list of building of current villege
        con.query('SELECT type,level,pos FROM structure JOIN building ON structure.sid = building.sid WHERE vid = ?',vid,function(err,result) {
          if (err) callback(err);
          else {
              var list_of_building = result;
              console.log("Building of "+vid+" is "+JSON.stringify(list_of_building));
              //save status
              saveStatus(username);
              callback(null,list_of_building);
          }
        });
    }
  })
}
/** Function to load wall **/
exports.loadWall = function(username,callback) {
  console.log("Engine Receive loadWall From Server username =  " + username);
  //get Current Villege
  getCurrentVillege(username,function (err,vid) {
    //SELECT wall from current villege
    con.query('SELECT type,level FROM structure JOIN wall ON structure.sid = wall.sid WHERE vid = ?)',vid,function(err,result) {

         ;
        if (err) callback(err);
        else {
            var wall = result[0];
            console.log("Wall of "+vid+" is "+JSON.stringify(wall));
            //save status
            saveStatus(username);
            callback(null,wall);
        }
    });
  })
}

/** Utitlity PART**/
/** Function to format to two digit**/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}
/** Function to calculate next date **/
function calculateFinishDate(time,ah,ami,as) {
  console.log('calculateFinishDate time = '+time.toString()+" ah = "+ah+" ami = "+ami+" as = "+as);
  console.log('Now : '+time.toString());
  time.setHours(time.getHours()+ah);
  time.setMinutes(time.getMinutes()+ami);
  time.setSeconds(time.getSeconds()+as);
  console.log('End : '+time.toString());
  return time.getFullYear()+'-'+twoDigits(1+time.getMonth())+'-'+twoDigits(time.getDate())+" "+twoDigits(time.getHours())+":"+twoDigits(time.getUTCMinutes())+":"+twoDigits(time.getSeconds());
}
//Resource info
var resource_info = {
  "crop" : {
    cost : [[70,90,70,20],[115,150,115,35],[195,250,195,55],[325,420,325,95],[545,700,545,155],[910,1170,910,260],[1520,1950,1520,435],[2535,3260,2535,725],[4235,5445,4235,1210],[7070,9095,7070,2020]],
    consumption : [0,0,0,0,0,1,1,1,1,1],
    produce : [15,25,45,75,125,155,255,355,505,725,1500],
    time : [{hour : 0,min : 0,sec : 30},{hour : 0,min : 1,sec : 15},{hour : 0,min : 3,sec : 0},{hour : 0,min : 5,sec : 30},{hour : 0,min : 9,sec : 20},{hour : 0,min : 15,sec : 30},{hour : 0,min : 25,sec : 50},{hour : 0,min : 36,sec : 30},{hour : 1,min : 8,sec : 15},{hour : 1,min : 45,sec : 30}]
  },
  "iron" : {
    cost : [[100,80,30,60],[165,135,50,100],[280,225,85,165],[465,375,140,280],[780,620,235,465],[1300,1040,390,780],[2170,1735,650,1300],[3625,2900,1085,2175],[6050,4840,1815,3630],[10105,8080,3030,6060]],
    consumption : [3,2,2,2,2,2,2,2,2,2],
    produce: [15,25,45,75,125,155,255,355,505,725,1500],
    time : [{hour : 0, min : 1, sec : 5},{hour : 0, min : 3, sec : 0},{hour : 0, min : 5, sec : 30},{hour : 0, min : 9, sec : 35},{hour : 0, min : 16, sec : 0},{hour : 0, min : 26, sec : 30},{hour : 0, min : 42, sec : 35},{hour : 1, min : 8, sec : 0},{hour : 1, min : 49, sec : 5},{hour : 2, min : 58, sec : 30}]
  },
  "clay" : {
    cost : [[80,40,80,50],[135,65,135,85],[225,110,225,140],[375,185,375,235],[620,310,620,390],[1040,520,1040,650],[1735,870,1735,1085],[2900,1450,2900,1810],[4840,2420,4840,3025],[8080,4040,8080,5050]],
    consumption : [2,1,1,1,1,5,5,5,5,5],
    produce: [15,25,45,75,125,155,255,355,505,725,1500],
    time : [{hour : 0, min : 0, sec : 40},{hour : 0, min : 1, sec : 50},{hour : 0, min : 3, sec : 30},{hour : 0, min : 6, sec : 20},{hour : 0, min : 10, sec : 50},{hour : 0, min : 18, sec : 10},{hour : 0, min : 29, sec : 50},{hour : 0, min : 48, sec : 20},{hour : 1, min : 18, sec : 10},{hour : 2, min : 5, sec : 30}]
  },"wood" : {
    cost : [[40,100,50,60],[65,165,85,100],[110,280,140,165],[185,465,235,280],[310,780,390,465],[520,1300,650,780],[870,2170,1085,1300],[1450,3625,1810,2175],[2420,6050,3025,3630],[4040,10105,5050,6060]],
    consumption : [2,1,1,1,1,2,2,2,2,2],
    produce: [15,25,45,75,125,155,255,355,505,725,1500],
    time : [{hour : 0, min : 0, sec : 50},{hour : 0, min : 2, sec : 0},{hour : 0, min : 3, sec : 50},{hour : 0, min : 7, sec : 0},{hour : 0, min : 11, sec : 50},{hour : 0, min : 18, sec : 50},{hour : 0, min : 32, sec : 0},{hour : 1, min : 51, sec : 50},{hour : 1, min : 23, sec : 50},{hour : 2, min : 14, sec : 50}]
  }
}
/** Function to check are there any avaiable structuring task **/
function checkAvailableStructingTask(username,callback) {
  console.log('checkAvailableStructingTask username  = '+username);
  //get current villege
  getCurrentVillege(username,function(err,vid){
    if (err) callback(err);
    else {
      //Count number of task which are working in current villege
      con.query('SELECT COUNT(*) AS numtask FROM structuringtask JOIN task ON structuringtask.tid = task.tid WHERE vid = ? ',vid,function(err,result) {

         ;
        if (err) callback(err);
        else {
          //number of active task
          var numtask = result[0].numtask;
          console.log('Villege '+vid + " has "+numtask+" working structuring task.");
          //Select level of villagehall and calculate number of non-working worker
          con.query('SELECT level FROM building JOIN structure ON structure.sid = building.sid WHERE vid = ? and type = \'villagehall\'',vid,function(err,result) {

             ;
            if (err) callback(err);
            else {
                            //total number of worker
              var num_worker  = 1
              for (var i = 0;i<result.length;i++){
                num_worker+=result[i].level;
              }
              console.log("Villege "+vid +" has "+num_worker+" worker.");
              //check can we upgrade
              if (numtask<num_worker){
                console.log('Villege '+vid+" can upgrade task.");
                //saveStatus
                saveStatus(username)
                callback(null,true,vid);
              }
              else {
                console.log('All workeer in villege '+vid +" are busy");
                //saveStatus
                saveStatus(username);
                callback(null,false);
              }
            }
          })
        }
      })
    }
  })
}

/** Upgrade Part **/
/** Function to check can I upgrade resource**/
exports.canUpgradeResource = function(username,pos,callback) {
  console.log('canUpgradeResource username = '+username+' pos = '+pos);
  //Check avaiable structuringtask
  checkAvailableStructingTask(username,function (err,avaiable,vid) {
    if (err) callback(err);
    else {
      if (avaiable){
        //Select sid type level from pos from resource join structure on
        con.query('SELECT structure.sid AS sid,type,level,pos FROM resource JOIN structure ON resource.sid = structure.sid WHERE vid = ? AND pos=?',[vid,pos],function (err,result) {

           ;
          if (err) callback(err);
          else {
            var sid = result[0].sid;
            var level = result[0].level+1;
            var type = result[0].type;
            var pos = result[0].pos;
            console.log('Resource detail at pos '+ pos+ " : sid ="+sid+" level = "+level+" type = "+type+" pos = "+pos);
            //Select endtime and level of latest upgrading resource at this pos (same sid)
            con.query('SELECT level,endTime FROM structuringtask JOIN task ON structuringtask.tid = task.tid WHERE sid = ? ORDER BY structuringtask.tid DESC LIMIT 1',sid,function (err,result) {

               ;
              if (err) callback(err);
              else {
                //initialize now time
                var startTime = new Date();
                console.log("Now : "+startTime);
                //check are there any upgrading task at this sid
                if (result.length>0) {
                  //update level to upgrade
                  level = result[0].level+1;
                  //update start time to upgrade
                  startTime = result[0].endTime;
                }
                //Check that this is not maximum level
                if (level>=10) {
                  //return false can't upgrade
                  callback(null,false);
                }else {
                  //Select resource from villege to check can we upgrade
                  con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function (err,result) {

                     ;
                    if (err) callback(err);
                    else {
                      //get require_resource from resource_info
                      var require_resource = resource_info[type].cost[level-1];
                      //get time use from resource_info
                      var timeuse = resource_info[type].time[level-1];
                      console.log('Require resource = '+require_resource+" timeuse = "+timeuse);
                      //Check require resource
                      if (result[0].wood>=require_resource[0]&&result[0].clay>=require_resource[1]&&result[0].iron>=require_resource[2]&&result[0].crop>=require_resource[3]){
                        //calculate endtime
                        var endTime = calculateFinishDate(startTime,timeuse.hour,timeuse.min,timeuse.sec);
                        console.log("Endtime = "+endTime.toString());
                        var left_resource = {
                          wood : (result[0].wood-require_resource[0]) ,
                          clay : (result[0].clay-require_resource[1]),
                          iron : (result[0].iron-require_resource[2]) ,
                          crop : (result[0].crop-require_resource[3])
                        };
                        console.log('Can upgrade '+sid+" with left resource = "+left_resource);
                        saveStatus(username);
                        callback(null,true,left_resource,sid,vid,endTime,level,type,pos);
                      }
                      else {
                        console.log('Can\'t upgrade '+sid);
                        saveStatus(username);
                        callback(null,false)
                      }
                    }
                  })
                }
              }
            })
          }
        })
      }
      else {
        console.log('Vid = '+vid+" Can't upgrade resource at pos = "+pos);
        //save status
        saveStatus(username);
        callback(null,false);
      }
    }
  })
}
/** Function to upgrade resource **/
exports.upgradeResource = function(username,pos,callback){
  console.log("upgradeResource username = "+username+" pos = "+pos);
  //Check requirement for upgrade resource
  exports.canUpgradeResource(username,pos,function(err,status,left_resource,sid,vid,finishDate,level,type,pos) {
    if (err) callback(err);
    else {
      if (status){
        console.log('Can upgrade with left_resource = '+left_resource+" sid = "+sid+" vid = "+vid+" finishDate = "+finishDate+" level = "+level+" type "+type+" pos "+pos);
        //Update resource of villege
        con.query('UPDATE villege SET ? WHERE vid = ?',[left_resource,vid],function(err,result) {

           ;
          if (err) callback(err);
          else {
            console.log('Successful to update resource at '+vid);
            //INSERT new task
            con.query('INSERT INTO task(vid,endtime) values(?,?)',[vid,finishDate],function(err,result) {

               ;
              if (err) callback(err);
              else {
                console.log('Success Update task with vid = '+finishDate+' vid = '+vid);
                //Get latest tid
                var tid = result.insertId;
                console.log('Task id  = '+tid);
                //Insert new structuringtask
                con.query('INSERT INTO structuringtask(tid,sid,level,type,pos) values(?,?,?,?,?)',[tid,sid,level,type,pos],function(err,result) {

                   ;
                  if (err) callback(err)
                  else {
                    console.log('Success Update task with tid = '+tid+" sid = "+sid+" level = "+level+" type = "+type+" pos "+pos);
                    //saveStatus
                    saveStatus(username)
                    callback(null,true);
                  }
                })
              }
            })
          }
        })
      }
      else {
        //save status
        saveStatus(username);
        callback(err,false);
      }
    }
  })
}
function getResourceOfVillege(vid,callback) {
  con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function(err,result) {

     ;
    if (err) callback(err);
    else {
      var resource = result[0];
      console.log('Villege vid = '+vid+" has "+JSON.stringify(resource));
      //saveStatus
      callback(null,resource);
    }
  })
}
/** Function to get resource left from villege **/
exports.getResourceOfVillege = function(username,callback) {
  console.log('getResourceOfVillege username = '+username);
  /** get current villege vid **/
  getCurrentVillege(username,function (err,vid) {
    if (err) callback(err);
    else {
      getResourceOfVillege(vid,function(err,resource) {
        if (err) callback(err)
        else callback(null,resource)
      })
      saveStatus(username)
    }
  })
}
var building_info = {
  "villagehall" : {
    cost : [[70,40,60,20],[90,50,75,25],[115,65,100,35],[145,85,125,40],[190,105,160,55],[240,135,205,70],[310,175,265,90],[395,225,340,115],[505,290,430,145],[645,370,555,185]],
    consumption : [2,1,1,1,1,2,2,2,2,2],
    time : [{hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}]
  },
  "market" : {
    cost : [[80,70,120,70],[100,90,155,90],[130,115,195,115],[170,145,250,145],[215,190,320,190],[275,240,410,240],[350,310,530,310],[450,395,675,395],[575,505,865,505],[740,645,1105,645]],
    consumption : [4,2,2,2,2,3,3,3,3,3],
    time : [ {hour:0,min:06,sec:00},{hour:0,min:07,sec:58},{hour:0,min:10,sec:14},{hour:0,min:12,sec:52},{hour:0,min:15,sec:56},{hour:0,min:19,sec:28},{hour:0,min:23,sec:36},{hour:0,min:28,sec:22},{hour:0,min:33,sec:54},{hour:0,min:40,sec:20}]
  },
  "barracks" : {
    cost : [[210,140,260,120],[270,180,335,155],[345,230,425,195],[440,295,545,250],[565,375,700,320],[720,480,895,410],[925,615,1145,530],[1180,790,1465,675],[1515,1010,1875,865],[1935,1290,2400,1105]],
    consumption : [4,2,2,2,2,3,3,3,3,3],
    time : [  {hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52} ]
  },
  "academy" : {
    cost:[[220,160,90,40],[280,205,115,50],[360,260,145,65],[460,335,190,85],[590,430,240,105],[755,550,310,135],[970,705,395,175],[1240,900,505,225],[1585,1155,650,290],[2030,1475,830,370]],
    consumption : [4,2,2,2,2,3,3,3,3,3],
    time : [  {hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52} ]
  },  "stable" : {
    cost : [[260,140,220,100],[335,180,280,130],[425,230,360,165],[545,295,460,210],[700,375,590,270],[895,480,755,345],[1145,615,970,440],[1465,790,1240,565],[1875,1010,1585,720],[2400,1290,2030,920]],
    consumption : [5,3,3,3,3,3,3,3,3,3],
    time : [{hour:0,min:07,sec:20},{hour:0,min:09,sec:30},{hour:0,min:12,sec:02},{hour:0,min:14,sec:58},{hour:0,min:18,sec:20},{hour:0,min:22,sec:16},{hour:0,min:26,sec:50},{hour:0,min:32,sec:08},{hour:0,min:38,sec:16},{hour:0,min:45,sec:24}]
  },
  "headquarter" : {
    cost : [[700,670,700,240],[930,890,930,320],[1240,1185,1240,425],[1645,1575,1645,565],[2190,2095,2190,750],[2915,2790,2915,1000],[3875,3710,3875,1330],[5155,4930,5155,1765],[6855,6560,6855,2350],[9115,8725,9115,3125]],
    consumption : [2,1,1,1,1,2,2,2,2,2],
    time : [  {hour:0,min:07,sec:40},{hour:0,min:08,sec:54},{hour:0,min:10,sec:18},{hour:0,min:11,sec:58},{hour:0,min:13,sec:52},{hour:0,min:16,sec:06},{hour:0,min:18,sec:40},{hour:0,min:21,sec:40},{hour:0,min:25,sec:08},{hour:0,min:29,sec:10}]
  },
  "workshop" : {
    cost : [[460,510,600,320],[590,655,770,410],[755,835,985,525],[965,1070,1260,670],[1235,1370,1610,860],[1580,1750,2060,1100],[2025,2245,2640,1405],[2590,2870,3380,1800],[3315,3675,4325,2305],[4245,4705,5535,2950]],
    consumption : [3,2,2,2,2,2,2,2,2,2],
    time : [{hour:0,min:10,sec:00},{hour:0,min:12,sec:36},{hour:0,min:15,sec:36},{hour:0,min:19,sec:06},{hour:0,min:23,sec:10},{hour:0,min:27,sec:52},{hour:0,min:33,sec:20},{hour:0,min:39,sec:40},{hour:0,min:47,sec:02},{hour:0,min:55,sec:32}]
  },
  "smithy":{
    cost : [[180,250,500,160],[230,320,640,205],[295,410,820,260],[375,525,1050,335],[485,670,1340,430],[620,860,1720,550],[790,1100,2200,705],[1015,1405,2815,900],[1295,1800,3605,1155],[1660,2305,4610,1475]],
    consumption : [4,2,2,2,2,3,3,3,3,3],
    time : [{hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}]
  },
  "granary" : {cost : [[80,100,70,20],[100,130,90,25],[130,165,115,35],[170,210,145,40],[215,270,190,55],[275,345,240,70],[350,440,310,90],[450,565,395,115],[575,720,505,145],[740,920,645,185]],
    consumption : [1,1,1,1,1,1,1,1,1,1],
    time : [{hour:0,min:05,sec:20},{hour:0,min:07,sec:12},{hour:0,min:09,sec:20},{hour:0,min:11,sec:50},{hour:0,min:14,sec:44},{hour:0,min:18,sec:04},{hour:0,min:21,sec:58},{hour:0,min:26,sec:30},{hour:0,min:31,sec:44},{hour:0,min:37,sec:48}]
  },
  "warehouse" : {
    cost : [[130,160,90,40],[165,205,115,50],[215,260,145,65],[275,335,190,85],[350,430,240,105],[445,550,310,135],[570,705,395,175],[730,900,505,225],[935,1155,650,290],[1200,1475,830,370]],
    consumption:[1,1,1,1,1,1,1,1,1,1],
    time : [{hour:0,min:06,sec:40},{hour:0,min:08,sec:44},{hour:0,min:11,sec:08},{hour:0,min:13,sec:54},{hour:0,min:17,sec:08},{hour:0,min:20,sec:52},{hour:0,min:25,sec:14},{hour:0,min:30,sec:16},{hour:0,min:36,sec:06},{hour:0,min:42,sec:52}]
  }
}
var building_require = {
  "villagehall" : [],
  "warehouse" : [],
  "granary" : [],
  "market" : [{type : "warehouse",level : 1},{type : "granary",level : 1}],
  "barracks" : [{type : "villagehall",level : 3}],
  "academy" : [{type : "villagehall",level : 5}],
  "stable" : [{type : "barracks",level : 3},{type : "academy",level : 5}],
  "smithy" : [{type : "academy",level : 3},{type : "barracks",level : 3}],
  "headquarter" : [{type : "villagehall",level : 5},{type : "barracks",level :5},{type : "academy",level : 5}],
  "workshop" : [{type : "academy",level : 3},{type : "barracks",level : 3}]
};
/** Function to get upgrade status of building**/
exports.canUpgradeBuilding = function(username,pos,callback) {
  console.log('getBuildingUpgradeStatus username = '+username+" pos = "+pos);
  //Check avaiable structuringtask
  checkAvailableStructingTask(username,function(err,avaiable,vid) {
    if (err) callback(err);
    else {
      if (avaiable){
        //Select sid type level sid from pos from building
        con.query('SELECT structure.sid,type,level FROM building JOIN structure ON building.sid = structure.sid WHERE vid = ? AND pos=?',[vid,pos],function (err,result) {


          if (err) callback(err);
          else {
            var sid = result[0].sid;
            var level = result[0].level+1;
            var type = result[0].type;
            console.log('Building detail at pos '+ pos+ " : sid ="+sid+" level = "+level+" type = "+type+" pos = "+pos);
            //Select endtime and level of latest upgrading buidling at this pos (same sid)
            con.query('SELECT level,endTime FROM structuringtask JOIN task ON structuringtask.tid = task.tid WHERE sid = ? ORDER BY structuringtask.tid DESC LIMIT 1',sid,function (err,result) {


              if (err) callback(err);
              else {
                //initialize now time
                var startTime = new Date();
                console.log("Now : "+startTime);
                //check are there any upgrading task at this sid
                if (result.length>0) {
                  //update level to upgrade
                  level = result[0].level+1;
                  //update start time to upgrade
                  startTime = result[0].endTime;
                }
                //Check that this is not maximum level
                if (level>=10) {
                  //return false can't upgrade
                  callback(null,false);
                }else {
                  //Select resource from villege to check can we upgrade
                  con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function (err,result) {

                     ;
                    if (err) callback(err);
                    else {
                        //get require_resource from resource_info
                        var require_resource = building_info[type].cost[level-1];
                        //get time use from resource_info
                        var timeuse = building_info[type].time[level-1];
                        console.log('Require resource = '+require_resource+" timeuse = "+timeuse);
                        //Check require resource
                        if (result[0].wood>=require_resource[0]&&result[0].clay>=require_resource[1]&&result[0].iron>=require_resource[2]&&result[0].crop>=require_resource[3]){
                          //calculate endtime
                          var endTime = calculateFinishDate(startTime,timeuse.hour,timeuse.min,timeuse.sec);
                          console.log("Endtime = "+endTime.toString());
                          var left_resource = {
                            wood : (result[0].wood-require_resource[0]) ,
                            clay : (result[0].clay-require_resource[1]),
                            iron : (result[0].iron-require_resource[2]) ,
                            crop : (result[0].crop-require_resource[3])
                          };
                          console.log('Can upgrade '+sid+" with left resource = "+left_resource);
                          saveStatus(username);
                          callback(null,true,left_resource,vid,endTime,type,pos,level,sid);
                        }
                        else {
                          console.log('Can\'t upgrade '+sid);
                          saveStatus(username);
                          callback(null,false)
                        }
                    }
                  })
                }
              }
            })
          }
        })
      }
      else {
        console.log('Vid = '+vid+" Can't upgrade building at pos = "+pos);
        saveStatus(username);
        callback(null,false);
      }
    }
  })
}
/** Function to generate SQL condition of building requirement **/
function generateSQLBuildingRequirement(type,vid) {
  console.log('generateSQLBuildingRequirement data type = '+type+" vid = "+vid);
  var require = building_require[type];
  console.log("Require :" +JSON.stringify(require));
  var statement = "";
  for (var i = 0;i<require.length;i++){
      statement+= " AND "+require[i].level+"<= (SELECT level FROM structure JOIN building ON structure.sid=building.sid WHERE type = \'"+require[i].type+"\' AND vid = "+vid+" ORDER BY level DESC LIMIT 1 ) ";
  }
  console.log("SQL Statement : "+statement);
  return statement;
}
/** Function to check can create building **/
exports.canCreateBuilding = function(username,pos,type,callback) {
  console.log('canCreateBuilding username = '+username+" pos = "+pos+' type = '+type);
  //Check avaiable structuringtask
  checkAvailableStructingTask(username,function(err,avaiable,vid) {
    if (err) callback(err);
    else {
        if (avaiable){
            console.log('SELECT vid FROM villege WHERE vid = ?'+generateSQLBuildingRequirement(type,vid));
        //Check this villege requirement by select vid and check on condition
        con.query('SELECT vid FROM villege WHERE vid = ?'+generateSQLBuildingRequirement(type,vid),vid,function (err,result) {
          console.log('Result '+JSON.stringify(result));
          if (err) callback(err);
          else {
            if (result.length==1){
              console.log('Requirement of '+vid+' pass!');
              var startTime = new Date();
              //check resource of villege
              con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',vid,function(err,result) {
                if (err) callback(err);
                else {
                  var require_resource = building_info[type].cost[0];
                  var timeuse = building_info[type].time[0];
                  console.log('Building '+" use resoure "+JSON.stringify(require_resource)+" time use "+timeuse.toString());
                  //check require resource
                  if (result[0].wood>=require_resource[0]&&result[0].clay>=require_resource[1]&&result[0].iron>=require_resource[2]&&result[0].crop>=require_resource[3]){
                    var endTime = calculateFinishDate(startTime,timeuse.hour,timeuse.min,timeuse.sec);
                    var left_resource = {
                      wood : (result[0].wood-require_resource[0]) ,
                      clay : (result[0].clay-require_resource[1]),
                      iron : (result[0].iron-require_resource[2]) ,
                      crop : (result[0].crop-require_resource[3])
                    };
                    console.log("Left resource : "+JSON.stringify(left_resource));
                    saveStatus(username);
                    callback(null,true,left_resource,vid,endTime,type,pos);
                  }
                  else {
                    console.log('Requirement of '+vid+' not pass!');
                    saveStatus(username,function (err) {
                      callback(null,false);
                    })
                  }
                }
              })
            }
            else {
              console.log('Requirement of '+vid+' not pass!');
              saveStatus(username);
              callback(null,false);
            }
          }
        })
      }else{
        saveStatus(username)
        callback(null,false);
      }
    }
  })
}
/** Function to create building **/
exports.createBuilding = function(username,pos,type,callback) {
  console.log('createBuilding username = '+username+" pos = "+pos+" type = "+type);
  //Check can upgrade building
  exports.canCreateBuilding(username,pos,type,function(err,status,left_resource,vid,endtime,type,pos) {
    if (err) callback(err);
    else {
      if (status){
        console.log('left_resource c '+JSON.stringify(left_resource));
        //Update resource in villege
        con.query('UPDATE villege SET ? WHERE vid = ?',[left_resource,vid],function(err,result) {
          console.log(JSON.stringify(result));
          console.log('UPDATING');
          if (err) callback(err);
          else {
            exports.getResourceOfVillege(username,function (err,resource) {
                console.log(JSON.stringify(resource));
            })
            console.log('Successful to update resource at '+vid);
            //Insert new structure
            con.query('INSERT INTO structure(level,vid) values(?,?)',[0,vid],function(err,result) {

               ;
              if (err) callback(err);
              else {
                var sid = result.insertId;
                console.log('Structure '+sid+' is created!');
                //Insert new buidling
                con.query('INSERT INTO building(sid,pos,type) values(?,?,?)',[sid,pos,type],function(err,result) {
                  if(err) callback(err);
                  else {
                    console.log(type+' sid = '+sid+' at pos = '+pos+' is created');
                    //insert new task
                    con.query('INSERT INTO task(vid,endtime) values(?,?)',[vid,endtime],function(err,result) {

                       ;
                      if(err) callback(err);
                      else {
                        var tid = result.insertId;
                        console.log('Task '+tid+' is created! vid = '+vid+" endtime = "+endtime);
                        //insert new structuringtask
                        con.query('INSERT INTO structuringtask(tid,sid,level,type,pos) values(?,?,?,?,?)',[tid,sid,1,type,pos],function(err,result) {

                           ;
                          if (err) callback(err);
                          else {
                            console.log('New structuringtask tid = '+tid+" vid = "+vid+" sid = "+sid+" type = "+type+" pos = "+pos);
                            //saveStatus
                            saveStatus(username)
                            callback(null,true);
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }else {
        saveStatus(username)
        callback(null,false);
      }
    }
  })
}
/** Function to building resource **/
exports.upgradeBuilding = function(username,pos,callback){
  console.log('upgradeBuilding username  = '+username+' pos = '+pos);
  //Check can upgrade building
  //null,true,left_resource,vid,endTime,type,pos,level,sid

  exports.canUpgradeBuilding(username,pos,function(err,status,left_resource,vid,endtime,type,pos,level,sid) {
    if (err) callback(err);
    else {
      if (status){
        //update resource of villege
        con.query('UPDATE villege SET ? WHERE vid = ?',[left_resource,vid],function(err,result) {


          if (err) callback(err);
          else {
            console.log('Successful update villege '+vid+' which resource is '+left_resource);
            //insert task
            con.query('INSERT INTO task(vid,endtime) values(?,?)',[vid,endtime],function(err,result) {


              if (err) callback(err);
              else {
                var tid = result.insertId;
                console.log('Task tid = '+tid+' inserted');
                //insert structuringtask
                con.query('INSERT INTO structuringtask(tid,sid,level,type,pos) values(?,?,?,?,?)',[tid,sid,level,type,pos],function(err) {


                  if (err) callback(err);
                  else {
                    console.log('New structuringtask tid = '+tid+" vid = "+vid+" sid = "+sid+" level = "+level+" type = "+type+" pos = "+pos);
                    //saveStatus
                    saveStatus(username)
                    callback(null,true);
                  }
                })
              }
            })
          }
        })
      }
      else {
        //return false because can't upgrade
        saveStatus(username)
        callback(null,false);
      }
    }
  })
}
/** Function to convert datetime to Date() **/
function covertToDate(datetime) {
  console.log('covertToDate datetime = '+datetime);
  var datetime_arr = datetime.split('T');
  var date = datetime_arr[0].split('-');
  var time = (datetime_arr[1].split('.'))[0].split(':');
  return new Date(date[0],date[1],date[2],time[0],time[1],time[2]);
}
/** Function to calculate added resource **/
function calculateresource(lastvisit,resource,info,capacity) {
  console.log("calculateresource lastvisit : "+lastvisit.toString()+" resource : "+JSON.stringify(resource)+" info "+JSON.stringify(info)+" capacity : "+JSON.stringify(capacity));
  var produce_rate = [0,0,0,0];
  for (var i = 0;i<info.length;i++){
    if (info[i].type=="wood") produce_rate[0] += resource_info[info[i].type].produce[info[i].level];
    if (info[i].type=="clay") produce_rate[1] += resource_info[info[i].type].produce[info[i].level];
    if (info[i].type=="iron") produce_rate[2] += resource_info[info[i].type].produce[info[i].level];
    if (info[i].type=="crop") produce_rate[3] += resource_info[info[i].type].produce[info[i].level];
  }
  console.log('produce rate :' +produce_rate );
  var date_in_sec = lastvisit.getTime()/1000;
  var now = new Date();
  var now_in_sec = now.getTime()/1000;
  var diff_time = now_in_sec-date_in_sec;
  for (var i = 0;i<4;i++){
    if (i<3){
      //console.log('capacity '+capacity["warehouse"]);
      if (resource[i]+produce_rate[i]*diff_time/3600<=capacity["warehouse"])
      //console.log('Product '+(produce_rate[i]*diff_time/3600));
        resource[i]+=produce_rate[i]*diff_time/3600;
        //console.log('i Resource = '+JSON.stringify(resource));
    }
    else {
      //console.log('Capacity g'+capacity["granary"]);
      if (resource[i]+produce_rate[i]*diff_time/3600<=capacity["granary"])
        resource[i]+=produce_rate[i]*diff_time/3600;
    }
  }
  console.log('Resource = '+JSON.stringify(resource));
  return resource;
}
/** capacity by level **/
var capacity = [1700,3100,5000,7800,11800,17600,25900,37900,55100,80000];
/** Function to get Capacity of granary and warehouse **/
function getCapacity(vid,callback) {
  console.log('getCapacity vid = '+vid);
  //get level of granary and warehouse
  con.query('SELECT level,type FROM structure JOIN building ON structure.sid = building.sid WHERE type IN (\'granary\',\'warehouse\') AND vid = ?',vid,function(err,result) {

    if (err) callback(err);
    else {
        var sumcapacity = {"granary" : 800, "warehouse" : 800};
        if (result.length == 0) {
          console.log('vid = '+vid+' granary cap = 800 warehouse cap = 800');
          callback(null,{"granary" : 800, "warehouse" : 800});
        }
        else {
          //sum capacity
          for (var i = 0;i<result.length;i++){
            if (result[i].level >0){
              sumcapacity[result[i].type]+=capacity[result[i].level-1];
            }
          }
          console.log('vid = '+vid+' sumcapacity = '+JSON.stringify(sumcapacity));
          callback(null,sumcapacity);
        }
    }
  })
}
/** Function to get Capacity of granary and warehouse By username **/
exports.getCapacity = function (username,callback) {
  console.log('getCapacity username = '+username);
  //
  getCurrentVillege(username,function(err,vid) {
    if (err) callback(err);
    else {
      getCapacity(vid,function(err,capacity) {
        if (err) callback(err)
        else {
          saveStatus(username);
          callback(null,capacity);
        }
      })
    }
  })
}
/** Function to update resource **/
function updateResource(vid) {
  console.log('Updating Resource');
  con.query('SELECT recentvillegestatus.lastvisitedtime AS lastvisitedtime,recentvillegestatus.vid FROM recentvillegestatus JOIN recentstatus ON recentvillegestatus.vid = ?',vid,function (err,result) {
    console.log('Query Result : '+JSON.stringify(result));
    if (err) throw err;
    var datetime = result[0].lastvisitedtime;
    var vid = result[0].vid;
    getCapacity(vid,function(err,sumcapacity) {
      if (err) throw err;
      var capacity = sumcapacity;
      console.log("Cap : "+capacity);
      getResourceOfVillege(vid,function (err,result) {
        console.log('Query Result : '+JSON.stringify(result));
        if (err) throw err;
        var resource = [result["wood"],result["clay"],result["iron"],result["crop"]];
        loadResource(vid,function (err,result) {
            //console.log('Query Result : '+JSON.stringify(result));
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
function updateStructure(vid) {
  console.log('Updating Structure');
  con.query('SELECT recentvillegestatus.lastvisitedtime,recentvillegestatus.vid FROM recentvillegestatus JOIN recentstatus ON recentvillegestatus.vid = ?',vid,function (err,result) {
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
        if ((new Date(result[i].endtime.toString()))<=now) {
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
  console.log('update username= '+username);
  getCurrentVillege(username,function(err,vid){
    if (err) console.log(err);
    else update(vid)
  })
}
function update(vid) {
  updateResource(vid);
  updateStructure(vid);
  updateMarketTask(vid)
  saveVillegeStatus(vid);
}
/** Function tov check what structing task is doing **/
exports.getStructingTask = function(username,callback) {
  console.log('getStructingTask username = '+username);
  //get vid of current villege
  getCurrentVillege(username,function(err,vid) {
    con.query('SELECT type,sid,endtime,pos FROM structuringtask JOIN task ON structuringtask.tid = task.tid WHERE vid = ?',vid,function (err,result) {
      if (err) callback(err);
      else {
        console.log('Villege vid working structuringtask = '+JSON.stringify(result));
        saveStatus(username);
        callback(null,result);
      }
    })
  })
}
/** Function to add market task when send some resource **/
function sendResource(username,des_vid,wood,clay,iron,crop,callback) {
    console.log("Send Resource "+username);

  getCurrentVillege(username,function(err,home_vid) {
    if (err) callback(err);
    else {
      con.query('SELECT level FROM structure JOIN building ON structure.sid = building.sid WHERE vid = ? and type = "market"',home_vid,function(err,result) {
        if (err) callback(err);
        else {
          var num_merchant = 0;
          //sum number of merchant
          for (var i = 0;i<result.length;i++){
            num_merchant+=result[i].level;
          }
          con.query('SELECT wood,clay,iron,crop FROM markettask JOIN task ON markettask.tid = task.tid WHERE vid = ?',home_vid,function(err,result) {
            if (err) callback(err);
            else {
              for (var i  =0;i<result.length;i++){
                var sum = result[i].wood+result[i].clay+result[i].iron+result[i].crop;
                num_merchant-=Math.ceil(sum/500.0);
              }
              var resource = wood+clay+iron+crop;
              var require_merchant = Math.ceil(resource/500.0);
              if (require_merchant>num_merchant){
                console.log('Merchants are not enough : require_merchant = '+require_merchant+" avaiable merchant = "+num_merchant);
                callback(null,false)
              }
              else{
                con.query('SELECT wood,clay,iron,crop FROM villege WHERE vid = ?',home_vid,function(err,result) {
                  if (err) callback(err);
                  else {
                    if (wood<=result[0].wood&&clay<=result[0].clay&&iron<=result[0].iron&&crop<=result[0].crop){
                      var left_resource = {wood : (result[0].wood-wood), clay : (result[0].clay-clay), iron : (result[0].iron-iron), crop : (result[0].crop-crop)};
                      //home x,y
                      con.query('SELECT x,y FROM villege WHERE vid IN (?,?)',[home_vid,des_vid],function(err,result) {
                        if (err) callback(err);
                        else {
                          var distance = Math.sqrt(Math.pow(result[0].x-result[1].x,2)+Math.pow(result[0].y-result[1].y,2))
                          console.log('distance  = '+distance);
                          var timeuse_in_sec = distance;
                          var finishDate = calculateFinishDate(new Date(),0,0,timeuse_in_sec);
                          con.query('UPDATE villege SET ? WHERE vid = ?',[left_resource,home_vid],function (err,result) {
                            if (err) callback(err);
                            else {
                              con.query('INSERT INTO task(endtime,vid) values(?,?)',[finishDate,home_vid],function (err,result) {
                                if (err) callback(err);
                                else {
                                  var tid = result.insertId;
                                  console.log('Q : '+tid,des_vid,wood,clay,iron,crop,'S');
                                  con.query('INSERT INTO markettask(tid,des_vid,wood,clay,iron,crop,type) values(?,?,?,?,?,?,?)',[tid,des_vid,wood,clay,iron,crop,'S'],function (err,result) {
                                    if (err) callback(err);
                                    else {
                                      console.log('Success transfer '+tid);
                                      callback(null,true);
                                    }
                                  })
                                }
                              })
                            }
                          })
                        }
                      })
                    }else {
                      console.log("Not enough Resource");
                      callback(null,false);
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
  })

}
/** Function to add market task when send some resource **/
exports.sendResource = function(username,v_name,wood,clay,iron,crop,callback){
  console.log("Send Resource "+username);
  con.query('SELECT vid FROM villege WHERE name = ?',v_name,function(err,result) {
    if (err) callback(err);
    else {
      var des_vid = result[0].vid;
      sendResource(username,des_vid,wood,clay,iron,crop,function (err,status) {
        if (err) callback(err);
        else {
          callback(null,status);
        }
      })
    }
  })
}
/** Function to add market task when send same resource **/
exports.sendResource = function(username,x,y,wood,clay,iron,crop,callback){
    console.log("Send Resource "+username);

  con.query('SELECT vid FROM villege WHERE x = ? AND y=?',[x,y],function(err,result) {
    if (err) callback(err);
    else {
      var des_vid = result[0].vid;
      sendResource(username,des_vid,wood,clay,iron,crop,function (err,status) {
        if (err) callback(err);
        else {
          callback(null,status);
        }
      })
    }
  })
}
/** Function to get map information **/
exports.getMapXY = function(x,y,callback){
  console.log('GET MAP X = '+x+" Y = "+y);
  var xlist = []
  var ylist = []
  var minx = x-4;
  var miny = y-4;
  for (var i = 0;i<9;i++){
    miny+=1;
    minx+=1;
    if (miny<1){
      miny+=100;
    }
    if (minx<1){
      minx+=100
    }
    if (miny>100){
      miny-=100;
    }
    if (minx>100){
      minx-=100;
    }
    xlist.push(minx-1);
    ylist.push(miny-1);
  }
  console.log(JSON.stringify(xlist),(ylist));
  var select_res = 'SELECT villege.vid AS vid,name,x,y, (CASE WHEN type = \'wood\' THEN 1 ELSE 0 END) AS wood ,(CASE WHEN type = \'clay\' THEN 1 ELSE 0 END) AS clay,(CASE WHEN type = \'iron\' THEN 1 ELSE 0 END) AS iron,(CASE WHEN type = \'crop\' THEN 1 ELSE 0 END) AS crop,username FROM ((villege JOIN structure ON villege.vid = structure.vid) JOIN resource ON structure.sid = resource.sid) JOIN player ON villege.pid = player.pid WHERE x IN (?) AND y IN (?)' ;
  var select_select_res = 'SELECT username,name,x,y,SUM(wood) AS wood,SUM(clay) AS clay,SUM(iron) AS iron,SUM(crop) AS crop FROM ('+select_res+') AS resourcelist GROUP BY vid'
  con.query(select_select_res,[xlist,ylist],function(err,result) {
    if (err) callback(err);
    else {
      var villege = result;
      var max = 0;
      for (var i = 0;i<result.length;i++){
        if (villege[i].wood > max) {
          villege[i]['type'] = 'wood';
          max = villege[i].wood;
        }
        if (villege[i].clay > max) {
          villege[i]['type'] = 'clay';
          max = villege[i].clay;
        }
        if (villege[i].iron > max) {
          villege[i]['type'] = 'iron';
          max = villege[i].iron;
        }
        if (villege[i].crop > max) {
          villege[i]['type'] = 'crop';
          max = villege[i].crop;
        }
        if (villege[i].clay==villege[i].wood&&villege[i].wood==villege[i].iron&&villege[i].iron==villege[i].crop){
          villege[i]['type'] = 'balance';
        }
        max = 0;
      }
      callback(null,result);
    }
  })
}
/** Function to get map infomation **/
exports.getMap = function (username,callback) {
  getCurrentVillege(username,function(err,vid) {
    if (err) callback(err);
    else {
      con.query('SELECT x,y FROM villege WHERE vid = ?',vid,function(err,result) {
        if (err) callback(err);
        else {
          var x= result[0].x;
          var y = result[0].y;
          exports.getMapXY(x,y,function (err,map) {
            if (err) callback(err);
            else {
              callback(null,map)
            }
          })
        }
      })
    }
  })
}
/** Function to getName and coordinate of villege **/
exports.getVillegeInfo = function(username,callback) {
  getCurrentVillege(username,function(err,vid) {
    if (err) callback(err);
    else {
      con.query('SELECT name ,x,y FROM villege WHERE vid = ?',vid,function(err,result) {
        if(err) callback(err);
        else {
          console.log(JSON.stringify(result[0]));
          callback(null,result[0])
        }
      })
    }
  })
}
/** Function to change name of villege **/
exports.changeName = function(username,name,callback) {
  getCurrentVillege(username,function(err,vid) {
    con.query('UPDATE villege SET name = ? WHERE vid = ?',[name,vid],function(err) {
      if (err) callback(err)
      else {
        callback(null,true);
      }
    })
  })
}
/** Function to update markettask **/
function updateMarketTask(vid) {
  console.log('UpdaTE markettask');
  //getCurrentVillege(username,function (err,vid) {
  //  if (err) console.log(err);
  //  else {
      con.query('SELECT markettask.*,endtime FROM task JOIN markettask ON task.tid = markettask.tid WHERE vid = ?',vid,function(err,result) {
        if (err) throw err;
        else {
          for (var i = 0;i<result.length;i++){
            console.log(JSON.stringify(result[i]));
            var task = result[i]
            var now = new Date();
            var endtime = new Date(result[i].endtime.toString());
            console.log('END : '+endtime.toString());
          //  update(task.des_vid);
            if (endtime<now) {
              if (result[i].type=='B'){
                con.query('DELETE FROM markettask WHERE tid=?',task.tid,function (err) {
                  if (err)  throw err;
                  else console.log('Success remove from markettask '+task.tid);
                })
                con.query('DELETE FROM task WHERE tid=?',task.tid,function (err) {
                  if (err) throw err;
                  else console.log('Success remove from task '+task.tid);
                })
              }
              else if (result[i].type=='S'){
                con.query('UPDATE villege SET wood=wood+?,clay=clay+?,iron=iron+?,crop=crop+? WHERE vid = ?',[task.wood,task.clay,task.iron,task.crop,task.des_vid],function(err) {
                  if (err) throw err;
                  else {
                    console.log('Update '+task.des_vid);
                  }
                })
                con.query('DELETE FROM markettask WHERE tid=?',task.tid,function (err) {
                  if (err)  throw err;
                  else console.log('Success remove from markettask '+task.tid);
                })
                con.query('DELETE FROM task WHERE tid=?',task.tid,function (err) {
                  if (err) throw err;
                  else console.log('Success remove from task '+task.tid);
                })
                con.query('SELECT x,y FROM villege WHERE vid IN (?)',[[vid,task.des_vid]],function(err,result) {
                  if (err) console.log(err);
                  else {
                    var distance = Math.sqrt(Math.pow(result[0].x-result[1].x,2)+Math.pow(result[0].y-result[1].y,2))
                    console.log('distance  = '+distance);
                    var timeuse_in_sec = distance;
                    var finishDate = calculateFinishDate(new Date(),0,0,timeuse_in_sec);
                    con.query('INSERT INTO task(endtime,vid) values(?,?)',[finishDate,vid],function (err,result) {
                      if (err) console.log(err);
                      else {
                        var tid = result.insertId
                        con.query('INSERT INTO markettask(tid,type,des_vid) values(?,?,?)',[tid,'B',task.des_vid],function(err) {
                          if (err) throw err;
                          else {
                            console.log('Turn back');
                          }
                        })
                      }
                    })
                  }
                })


              }
            }
          }
        }
      })
    //}
  //})
}
exports.getMarkettask =function (username,callback) {
  getCurrentVillege(username,function(err,vid) {
    if (err) callback(err);
    else {
      con.query('SELECT vid AS home_vid,des_vid,type,endtime,wood,clay,iron,crop FROM task JOIN markettask ON task.tid=markettask.tid WHERE vid = ? ORDER BY endtime',vid,function (err,result) {
        if (err) callback(err);
        else {
          console.log('Villege vid working markettask = '+JSON.stringify(result));
          saveStatus(username);
          callback(null,result);
        }
      })
    }
  })
}
var troop = {
  "maceman" : {
    'cost' : [[75,65,40,40],[120,150,180,80]],
    'status' : [{'atkt' : 30,'atkh' : 10,'deft':15,'defh':5,'spd':45,'crr':60},{'atkt' : 70,'atkh' : 60,'deft':35,'defh':45,'spd':40,'crr':60}],
    'consumption' : 1,
    'time' : {min:2,sec:20}
  },
  "spearman" : {
    'cost' : [[100,130,100,30],[150,130,170,50]],
    'status' : [{'atkt' : 15,'atkh' : 20,'deft':30,'defh':50,'spd':30,'crr':20},{'atkt' : 30,'atkh' : 40,'deft':40,'defh':80,'spd':25,'crr':20}],
    'consumption' : 1,
    'time' : {min:3,sec:20}
  },
  "warrior" : {
    'cost' : [[140,150,185,60],[180,190,220,80]],
    'status' : [{'atkt' : 65,'atkh' : 55,'deft':25,'defh':15,'spd':35,'crr':50},{'atkt' : 100,'atkh' : 65,'deft':40,'defh':25,'spd':35,'crr':50}],
    'consumption' : 1,
    'time' : {min:5,sec:0}
  },
  "guardian" : {
    'cost' : [[100,120,150,30],[120,150,170,70]],
    'status' : [{'atkt' : 20,'atkh' : 15,'deft':50,'defh':20,'spd':30,'crr':20},{'atkt' : 30,'atkh' : 20,'deft':90,'defh':35,'spd':30,'crr':20}],
    'consumption' : 1,
    'time' : {min:4,sec:20}
  },
  "scout" : {
    'cost' : [[140,150,20,40],[150,160,30,50]],
    'status' : [{'atkt' : 0,'atkh' : 0,'deft':20,'defh':10,'spd':80,'crr':0},{'atkt' : 0,'atkh' : 0,'deft':30,'defh':15,'spd':80,'crr':0}],
    'consumption' : 2,
    'time' : {min:4,sec:20}
  },
  "cavalry" : {
    'cost' : [[350,400,300,60],[400,450,470,70]],
    'status' : [{'atkt' : 120,'atkh' : 160,'deft':60,'defh':60,'spd':90,'crr':100},{'atkt' : 180,'atkh' : 160,'deft':70,'defh':70,'spd':90,'crr':100}],
    'consumption' : 2,
    'time' : {min:8,sec:00}
  },
  "heavycavalry" : {
    'cost' : [[450,550,700,70],[600,750,970,90]],
    'status' : [{'atkt' : 200,'atkh' : 180,'deft':90,'defh':100,'spd':50,'crr':70},{'atkt' : 280,'atkh' : 220,'deft':150,'defh':200,'spd':50,'crr':70}],
    'consumption' : 3,
    'time' : {min:10,sec:00}
  },
  "catapult" :{
    'cost' : [[900,1200,600,90],[1500,3000,900,120]],
    'status' : [{'atkt' : 60,'atkh' : 40,'deft':30,'defh':20,'spd':15,'crr':0},{'atkt' : 70,'atkh' : 60,'deft':40,'defh':30,'spd':15,'crr':0}],
    'consumption' : 6,
    'time' : {min:24,sec:0}
  },
  "ram" : {
    'cost' : [[900,300,500,90],[1200,500,900,120]],
    'status' : [{'atkt' : 50,'atkh' : 40,'deft':20,'defh':20,'spd':20,'crr':0},{'atkt' : 60,'atkh' : 50,'deft':40,'defh':30,'spd':20,'crr':0}],
    'consumption' : 6,
    'time' : {min:15,sec:0}
  }
}
