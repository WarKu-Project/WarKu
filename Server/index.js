/** Initialize Module & port
* express
* body-parser
* cors
**/
/** initialize express **/
var app = require('express')();
/** initialize port to 5555 **/
var port = process.env.PORT || 5555;
/** initialize body-parser **/
var bp = require('body-parser');
/** initialize cors **/
var cors = require('cors');

/** Let app use Module
* body-parser
* cors
**/
/** use body-parser which parse app/json **/
app.use(bp.json());
app.use(bp.urlencoded({
    extended: true
}));

/** use cors for prevent different access origin problem **/
app.use(cors());

/** set up server **/
var server = app.listen(port,function() {
  console.log('Start Node.js Server at PORT '+port);
})

/** initialize socket.io **/
var io = require('socket.io').listen(server);

/** Intitlize Project Module
* engine.js
*/
/** Initialize GameEngine Module **/
var engine = require('./gameengine');

/**
* Server variable
* online_user
*/
/** online_user **/
var online_user = {};

/** connect socket with io **/
io.on('connection',function(socket){
  //get client ip
  var address = socket.request.connection.remoteAddress;
  //notice client has connected
  console.log('Client IP = '+address+' is connected.');

  /**
  * Received function
  **/
  /** Fuction to regist new player **/
  socket.on('register',function(info) {
    // log what info is
    console.log('Info : '+JSON.stringify(info));
    engine.exist(info,function(err,result) {
      if (err) throw err;
      if (result) socket.emit('register-status',false);
      else {
        engine.createPlayer(info);
        socket.emit('register-status',true);
      }
    });
  });
  /** Function to login **/
  socket.on('login',function(info) {
    //Log what info is
    console.log('Info : '+JSON.stringify(info));
    engine.verify(info,function(err,result) {
      if (err) throw err;
      if (result) {
        //add player to online list
        online_user[socket.request.connection.remoteAddress] = info["username"];
        engine.loadResource(info["username"],function (err,result) {
          if (err) throw err;
          socket.emit('resource-data',result);
        })
        socket.emit('login-status',true);
      }else{
        socket.emit('login-status',false);
      }
    });
  });

});
