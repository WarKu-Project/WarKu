/** Initialize express **/
var app = require('express')();
/** initialize body-parser **/
var bp = require('body-parser');
/** use body-parser which parse app/json **/
app.use(bp.json());
app.use(bp.urlencoded({
    extended: true
}));
/** initialize cors **/
var cors = require('cors');
/** use cors for prevent different access origin problem **/
app.use(cors());
/** Initialize GameEngine Module **/
var engine = require('./engine');

/** online_user list **/
var online_user = {};
/** login **/
app.post('/login',function(req,res){
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  var username=req.body.user;
  var password=req.body.password;
  console.log('Server Recieve login From Client');
  console.log("Server Receive From Client : Username = "+username+" Password = "+password);
  engine.verify(username,password,function(err,verify,enusername) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on our server :( Try Again ~ ");
    }
    if (verify){
      console.log("Server Receive From Engine : verify = "+verify+" username = "+enusername);
      //Add Player to online list
      online_user[ip] = enusername;
      //Return verify message to client
      res.end("Welcome ! "+enusername);
    }else {
      console.log("Server Receive From Engine : verify = "+verify);
      //Return not verify message to client
      res.end("Username or Password are Invalid!");
    }
  });
});
/** Register **/
app.post('/register',function(req,res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("\nCurrent IP : "+ip);
    var username = req.body.user;
    var password = req.body.pass;
    var email = req.body.mail;
    console.log('Server Recieve register From Client');
    console.log("Server Receive From Client : Username = "+username+" Password = "+password+" email = "+email);
    engine.exist(username,email,function(err,exist) {
      if (err){
        console.log("Server Recieve From Engine : "+err.toString());
        //Return error message to client
        res.end("Something wrong on our server :( Try Again ~ ");
      }
      console.log("Server Recieve From Engine : "+exist);
      if (exist){
        //Return player exist message to client
        res.end("Player is exist!!");
      }else {
        engine.createPlayer(username,password,email,function(err) {
          if (err) {
            //Return error message to client
            console.log("Server Recieve From Engine : "+err.toString());
            res.end("Something wrong on our server :( Try Again~");
          }
          else {
            //Return Success message to Client
            console.log("Server Recieve From Engine : username = "+username);
            res.end("Welcome ! "+username);
          }
        })
      }
    })
})
/** loadresource **/
app.post('/loadresource',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve loadresource From Client');
  engine.update(online_user[ip]);
  engine.loadResource(online_user[ip],function(err,resource) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on our server :( Try Again~");
    }
    else{
      console.log("Server Recieve From Engine : resource = "+JSON.stringify(resource));
      //Return resource to client
      res.end(JSON.stringify(resource));
    }
  })
})
/** loadbuilding **/
app.post('/loadbuilding',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve loadbuilding From Client');
  engine.update(online_user[ip]);
  engine.loadBuilding(online_user[ip],function (err,building) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on our server :( Try Again~");
    }
    else{
      console.log("Server Recieve From Engine : buidling = "+JSON.stringify(building));
      //Return building to client
      res.end(JSON.stringify(building));
    }
  })
})
/** loadwall **/
app.post('/loadwall',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log('Server Recieve loadbuilding From Client');
  engine.update(online_user[ip]);
  engine.loadWall(online_user[ip],function (err,wall) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on our server :( Try Again~");
    }
    else{
      console.log("Server Recieve From Engine : buidling = "+JSON.stringify(wall));
      //Return wall to client
      res.end(JSON.stringify(wall));
    }
  })
})
app.post('/canUpgradeResource',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var pos = req.body.pos;
  console.log('Server Recieve canUpgradeResource From Client : pos = '+pos);
  engine.update(online_user[ip],function(err){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  })
  engine.canUpgradeResource(online_user[ip],pos,function (err,status) {
    if(err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(JSON.stringify(status));
    }
  })
})
app.post('/upgradeResource',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var pos = req.body.pos;
  console.log('Server Recieve upgradeResource From Client : pos = '+pos);
  //engine.update(online_user[ip]);
  engine.upgradeResource(online_user[ip],pos,function(err,status) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(JSON.stringify(status));
    }
  })
})
app.post('/getResource',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getResource From Client');
  engine.update(online_user[ip]);
  engine.getResourceOfVillage(online_user[ip],function(err,resource) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+JSON.stringify(resource));
      res.end(JSON.stringify(resource));
    }
  })
})
app.post('/canUpgradeBuilding',function(req,res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("\nCurrent IP : "+ip);
    console.log("Current User : "+online_user[ip]);
    var pos = req.body.pos;
    console.log('Server Recieve canUpgradeBuilding From Client : pos = '+pos);
    engine.update(online_user[ip]);
    engine.canUpgradeBuilding(online_user[ip],pos,function(err,status) {
        if (err) {
          console.log("Server Recieve From Engine : "+err.toString());
          res.end("Something wrong on our server :( Try Again~");
        }else {
          console.log("Server Recieve From Engine : "+status);
          res.end(JSON.stringify(status));
        }
    })
})
app.post('/canCreateBuilding',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var pos = req.body.pos;
  var type = req.body.type;
  console.log('Server Recieve canCreateBuilding From Client : pos = '+pos+' type = '+type);
  engine.update(online_user[ip]);
  engine.canCreateBuilding(online_user[ip],pos,type,function (err,status) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(JSON.stringify(status));
    }
  })
})
app.post('/createBuilding',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var pos = req.body.pos;
  var type = req.body.type;
  console.log('Server Recieve createBuilding From Client : pos = '+pos+' type = '+type);
  engine.createBuilding(online_user[ip],pos,type,function (err,status) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(JSON.stringify(status));
    }
  })
  //engine.update(online_user[ip]);
})
app.post('/upgradeBuilding',function(req,res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("\nCurrent IP : "+ip);
    console.log("Current User : "+online_user[ip]);
    var pos = req.body.pos;
    console.log('Server Recieve upgradeBuilding From Client : pos = '+pos);
    //engine.update(online_user[ip]);
    engine.upgradeBuilding(online_user[ip],pos,function(err,status) {
        if (err) {
          console.log("Server Recieve From Engine : "+err.toString());
          res.end("Something wrong on our server :( Try Again~");
        }else {
          console.log("Server Recieve From Engine : "+status);
          res.end(JSON.stringify(status));
        }
    })
})
app.post('/getCapacity',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getCapacity From Client');
  engine.update(online_user[ip]);
  engine.getCapacity(online_user[ip],function(err,capacity) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+JSON.stringify(capacity));
      res.end(JSON.stringify(capacity));
    }
  })
})
app.post('/getStructingTask',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getStructingTask From Client');
  engine.update(online_user[ip]);
  engine.getStructingTask(online_user[ip],function(err,task) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+JSON.stringify(task));
      res.end(JSON.stringify(task));
    }
  })
})
app.post('/getVillageInfo',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getStructingTask From Client');
  engine.update(online_user[ip]);
  engine.getVillageInfo(online_user[ip],function(err,result) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      res.end(JSON.stringify(result))
    }
  })
})
app.post('/getMap' ,function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getMap From Client');
  engine.update(online_user[ip]);
  engine.getMap(online_user[ip],function(err,map) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      res.end(JSON.stringify(map))
    }
  })
})
app.post('/getMapXY' ,function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getMapXY From Client');
  var x= req.body.x;
  var y= req.body.y;
  console.log('X = '+x+' Y = '+y);
  // engine.update(online_user[ip]);
  engine.getMapXY(x,y,function(err,map) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      res.end(JSON.stringify(map))
    }
  })
})
app.post('/changeName',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var name = req.body.name;
  console.log('Server Recieve changeName From Client name = '+name);
  engine.update(online_user[ip]);
  engine.changeName(online_user[ip],name,function(err,result) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      res.end(JSON.stringify(result))
    }
  })
})
app.post('/sendResourceXY',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var wood = req.body.wood;
  var clay = req.body.clay;
  var iron = req.body.iron;
  var crop = req.body.crop;
  var x = req.body.x;
  var y = req.body.y;
  //console.log('Server Recieve changeName From Client name = '+name);
  //engine.update(online_user[ip]);
  engine.sendResourceXY(online_user[ip],x,y,wood,clay,iron,crop,function(err,result) {
    console.log('err : '+err+" result : "+result);
    if (err) {
      throw err;
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+result);
      res.end(JSON.stringify(result))
    }
  })
})
app.post('/sendResource',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var wood = req.body.wood;
  var clay = req.body.clay;
  var iron = req.body.iron;
  var crop = req.body.crop;
  var des = req.body.name;
  engine.sendResource(online_user[ip],name,wood,clay,iron,crop,function(err,result) {
    console.log('err : '+err+" result : "+result);
    if (err) {
      throw err;
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+result);
      res.end(JSON.stringify(result))
    }
  })

  //console.log('Server Recieve changeName From Client name = '+name);
  //engine.update(online_user[ip]);
  engine.sendResource(online_user[ip],x,y,wood,clay,iron,crop,function(err,result) {
    console.log('err : '+err+" result : "+result);
    if (err) {
      throw err;
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+result);
      res.end(JSON.stringify(result))
    }
  })
})
app.post('/getMarkettask',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  engine.getMarkettask(online_user[ip],function (err,result) {
    console.log('err : '+err+" result : "+result);
    if (err) {
      throw err;
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+result);
      res.end(JSON.stringify(result))
    }
  })
})
app.post('/checkName',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var name = req.body.name;
  engine.checkName(name,function(err,result) {
    if (err) {
      throw err;
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+result);
      res.end(JSON.stringify(result))
    }
  })
})
app.post('/sendMail',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var receiver = req.body.receiver;
  var title = req.body.title;
  var info = req.body.info;
  engine.sendMail(online_user[ip],receiver,title,info,function(err,result) {
    if (err) {
      throw err;
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+result);
      res.end(JSON.stringify(result))
    }
  })
})
app.post('/getPlayerInfo',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  engine.getPlayerInfo(online_user[ip],function (err,result) {
    if (err) {
      throw err;
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+result);
      res.end(JSON.stringify(result))
    }
  })
})
app.listen(5555,function(){
  console.log("Started on PORT 5555");
})
