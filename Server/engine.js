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
  console.log('Engine Receive From Server : username = '+username+' password = '+password);
  //Get username by SQL with username and password from player table.
  con.query('SELECT username FROM player WHERE username=? AND password=?',[username,password],function(err,result){
    //Log SQL result
    console.log('SQL Result : '+JSON.stringify(result));
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
  console.log('Engine Receive From Server : username = '+username+' email = '+email);
  //Get username by SQL with username or email from player table.
  con.query('SELECT username FROM player WHERE username = ? OR email = ?',[username,email],function(err,result) {
    //Log SQL result
    console.log('SQL Result : '+JSON.stringify(result));
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
  console.log('Engine Receive From Server : username = '+username+' password = '+password+' email = '+email);
  //INSERT NEW PLAYER TO SQL table player
  con.query('INSERT INTO player(username,password,email) values(?,?,?)',[username,password,email],function(err,result) {
    //Log SQL result
    console.log('SQL Result : '+JSON.stringify(result));
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
            initStatus(pid,vid,function(err) {
              if (err) callback(err);
              else {
                //Initilize villege status
                saveVillegeStatus(vid,function(err) {
                  if (err) callback(err);
                  else {
                    console.log('Success! New Player with pid = '+pid+' is Created!!!');
                    callback(null,username);
                  }
                });
              }
            });
          }
        });
      });
    }
  });
}

/** Status PART **/
/** Function to init status **/
function initStatus(pid,vid,callback) {
  console.log('initStatus with : pid = '+pid+' vid = '+vid);
  //Initilize recentstatus for player
  con.query('INSERT INTO recentstatus(pid,vid,lastvisitedtime) values(?,?,NOW())',[pid,vid],function(err,result) {
    //Log SQL Result
    console.log('SQL Result : '+JSON.stringify(result));
    if (err) callback(err);
    else{
        console.log('Init recent status with pid = '+pid+" vid = "+vid);
        //Return null because it doesn't error
        callback(null);
    }
  })
}
/** Function to save villege status **/
function saveVillegeStatus(vid,callback) {
  console.log('initVillegeStatus with : vid = '+vid);
  //save recentvillegestatus for villege
  con.query('UPDATE recentvillegestatus SET lastvisitedtime  = NOW() WHERE vid = ?',vid,function(err,result) {
    //Log SQL Result
    console.log('SQL Result : '+JSON.stringify(result));
    if (err) callback(err);
    else {
      console.log('Init new villege status with vid ='+vid);
      //Return null because it doesn't error
      callback(null)
    }
  })
}
/** Function to save status **/
function saveStatus(username,vid,callback){
  console.log('saveStatus with : username = '+username+' vid = '+vid);
  //save recentstatus by update recent villege
  con.query('UPDATE recentstatus SET vid = ? , lastvisitedtime = NOW() WHERE pid = (SELECT pid FROM player WHERE username = ?)',[vid,username],function(err,result) {
    //Log SQL Result
    console.log('SQL Result : '+JSON.stringify(result));
    if (err) callback(err);
    else {
      console.log("Update recentstatus with username = "+username+" vid = "+vid);
      //save villege status
      saveVillegeStatus(vid,function(err) {
        if (err) callback(err);
        else {
          console.log('Success update status of username = '+username+' vid = '+vid);
          //Return null because it doesn't error
          callback(null);
        }
      });
    }
  });
}
/** Function to save status **/
function saveStatus(username){
  console.log('saveStatus with : username = '+username);
  //save recentstatus by update current villege
  con.query('UPDATE recentstatus SET lastvisitedtime = NOW() WHERE pid = (SELECT pid FROM player WHERE username = ?)',username,function(err,result) {
    //Log SQL Result
    console.log('SQL Result : '+JSON.stringify(result));
    if (err) callback(err);
    else {
      console.log("Update recentstatus with username = "+username);
      //Select current villege from recentstatus
      getCurrentVillege(username,function (err,vid) {
        if (err) callback(err);
        else {
          saveVillegeStatus(vid,function (err) {
            if (err) callback(err);
            else {
              console.log('Success update Status of username = '+username);
              //Return null because it doesn't error
              callback(null);
            }
          })
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
    //Log SQL Result
    console.log('SQL Result : '+JSON.stringify(result));
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
    //Log SQL Result
    console.log("SQL Result : "+JSON.stringify(result));
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
    //Log SQL Result
    console.log("SQL Result : "+JSON.stringify(result));
    if (err) callback(err);
    else {
      var vid = result[0].vid;
      console.log("Current vid = "+vid);
      //Return vid
      callback(null,vid);
    }
  });
}

/** STRUCTURE PART **/
/**- LOAD PART -**/
/** Function to Load List of Resource with type **/
exports.loadResource = function(username,callback){
  console.log("Engine Receive From Server username =  " + username);
  //get Current Villege
  getCurrentVillege(username,function(err,vid) {
    if (err) callback(err);
    else {
      //Select list of resource of current villege
      con.query('SELECT type,level FROM structure JOIN resouce ON structure.sid = resource.sid WHERE vid = ?',vid,function(err,result) {
        //Log SQL Result
        console.log("SQL Result : "+JSON.stringify(result));
        if(err) callback(err);
        else {
          var list_of_resource = result;
          console.log("Resource of "+vid+" is "+JSON.stringify(list_of_resource));
          //save status
          saveStatus(username,function(err) {
            if (err) callback(err);
            else {
              // Return list of resource
              callback(null,list_of_resource);
            }
          })
        }
      })
    }
  })
}
/** Function to Load list of building **/
exports.loadBuilding = function(username,callback) {
  console.log("Engine Receive From Server username =  " + username);
  //get Current Villege
  getCurrentVillege(username,function (err,vid) {
    if (err) callback(err);
    else {
        //Select list of building of current villege
        con.query('SELECT type,level,pos FROM structure JOIN building ON structure.sid = building.sid WHERE vid = ?)',vid,function(err,result) {
          //Log SQL Result
          console.log("SQL Result : "+JSON.stringify(result));
          if (err) callback(err);
          else {
              var list_of_building = result;
              console.log("Building of "+vid+" is "+JSON.stringify(list_of_building));
              //save status
              saveStatus(username,function(err) {
                if (err) callback(err);
                else {
                  //Return list of building
                  callback(null,list_of_building);
                }
              })
          }
        });
    }
  })
}
/** Function to load wall **/
exports.loadWall = function(username,callback) {
  console.log("Engine Receive From Server username =  " + username);
  //get Current Villege
  getCurrentVillege(username,function (err,vid) {
    //SELECT wall from current villege
    con.query('SELECT type,level FROM structure JOIN wall ON structure.sid = wall.sid WHERE vid = ?)',vid,function(err,result) {
        //Log SQL Result
        console.log("SQL Result : "+JSON.stringify(result));
        if (err) callback(err);
        else {
            var wall = result[0];
            console.log("Wall of "+vid+" is "+JSON.stringify(wall));
            //save status
            saveStatus(username,function(err) {
              if (err) callback(err);
              else {
                //Return list of wall
                callback(null,wall);
              }
            })
        }
    });
  })
}
