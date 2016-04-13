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
* player.js
*/
var player = require('./player');

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
    console.log('Info : '+info);
    if (!player.authorize(info)) {
      player.createPlayer(info);
      socket.emit('register-status',true);
    } else {
      socket.emit('register-status',false);
    }
  });
  /** Function to login **/
  socket.on('login',function(info) {
    //Log what info is
    console.log('Info : '+info.toString());
    if (player.authorize(info)){
      //add player to online list
      online_user[socket.request.connection.remoteAddress] = info["username"];
      socket.emit('login-status',true);
    }else {
      socket.emit('login-status',false);
    }
  });

});
