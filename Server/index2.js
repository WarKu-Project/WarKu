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
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.loadResource(online_user[ip],function(err,resource) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on our server :( Try Again~");
    }
    else{
      console.log("Server Recieve From Engine : resource = "+resource);
      //Return resource to client
      res.end(resource);
    }
  })
})
/** loadbuilding **/
app.post('/loadbuilding',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve loadbuilding From Client');
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.loadBuilding(online_user[ip],function (err,building) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on our server :( Try Again~");
    }
    else{
      console.log("Server Recieve From Engine : buidling = "+JSON.stringify(building));
      //Return building to client
      res.end(building);
    }
  })
})
/** loadwall **/
app.post('/loadwall',function (req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log('Server Recieve loadbuilding From Client');
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.loadWall(online_user[ip],function (err,wall) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on our server :( Try Again~");
    }
    else{
      console.log("Server Recieve From Engine : buidling = "+JSON.stringify(wall));
      //Return wall to client
      res.end(wall);
    }
  })
})
app.post('/canUpgradeResource',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var pos = req.body.pos;
  console.log('Server Recieve canUpgradeResource From Client : pos = '+pos);
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.canUpgradeResource(online_user[ip],pos,function (err,status) {
    if(err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(status);
    }
  })
})
app.post('/upgradeResource',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  var pos = req.body.pos;
  console.log('Server Recieve upgradeResource From Client : pos = '+pos);
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.upgradeResource(online_user[ip],pos,function(err,status) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(status);
    }
  })
})
app.post('/getResource',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getResource From Client');
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.getResourceOfVillege(online_user[ip],function(err,resource) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+JSON.stringify(resource));
      res.end(resource);
    }
  })
})
app.post('/canUpgradeBuilding',function(req,res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("\nCurrent IP : "+ip);
    console.log("Current User : "+online_user[ip]);
    var pos = req.body.pos;
    console.log('Server Recieve canUpgradeBuilding From Client : pos = '+pos);
    engine.update(online_user[ip]){
      if (err) console.log("Server Recieve From Engine : "+err.toString());
    }
    engine.canUpgradeBuilding(online_user[ip],pos,function(err,status) {
        if (err) {
          console.log("Server Recieve From Engine : "+err.toString());
          res.end("Something wrong on our server :( Try Again~");
        }else {
          console.log("Server Recieve From Engine : "+status);
          res.end(status);
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
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.canCreateBuilding(online_user[ip],pos,type,function (err,status) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(status);
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
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.createBuilding(online_user[ip],pos,type,function (err,status) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+status);
      res.end(status);
    }
  })
})
app.post('/upgradeBuilding',function(req,res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("\nCurrent IP : "+ip);
    console.log("Current User : "+online_user[ip]);
    var pos = req.body.pos;
    console.log('Server Recieve upgradeBuilding From Client : pos = '+pos);
    engine.update(online_user[ip]){
      if (err) console.log("Server Recieve From Engine : "+err.toString());
    }
    engine.upgradeBuilding(online_user[ip],pos,function(err,status) {
        if (err) {
          console.log("Server Recieve From Engine : "+err.toString());
          res.end("Something wrong on our server :( Try Again~");
        }else {
          console.log("Server Recieve From Engine : "+status);
          res.end(status);
        }
    })
})
app.post('/getCapacity',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getCapacity From Client');
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.getCapacity(online_user[ip],function(err,capacity) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+JSON.stringify(capacity));
      res.end(capacity);
    }
  })
})
app.post('/getStructingTask',function(req,res) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log("\nCurrent IP : "+ip);
  console.log("Current User : "+online_user[ip]);
  console.log('Server Recieve getStructingTask From Client');
  engine.update(online_user[ip]){
    if (err) console.log("Server Recieve From Engine : "+err.toString());
  }
  engine.getStructingTask(online_user[ip],function(err,task) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      res.end("Something wrong on our server :( Try Again~");
    }else {
      console.log("Server Recieve From Engine : "+JSON.stringify(task));
      res.end(task);
    }
  })
})
app.listen(5555,function(){
  console.log("Started on PORT 5555");
})
