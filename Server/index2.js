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
            res.end("Something wrong on out server :( Try Again~");
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
  console.log('Server Recieve loadresource From Client');
  engine.loadResource(online_user[ip],function(err,resource) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on out server :( Try Again~");
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
  console.log('Server Recieve loadbuilding From Client');
  engine.loadBuilding(online_user[ip],function (err,building) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on out server :( Try Again~");
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
  engine.loadWall(online_user[ip],function (err,wall) {
    if (err) {
      console.log("Server Recieve From Engine : "+err.toString());
      //Return error message to client
      res.end("Something wrong on out server :( Try Again~");
    }
    else{
      console.log("Server Recieve From Engine : buidling = "+JSON.stringify(wall));
      //Return wall to client
      res.end(wall);
    }
  })
})
app.listen(5555,function(){
  console.log("Started on PORT 5555");
})
