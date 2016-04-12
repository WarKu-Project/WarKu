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
