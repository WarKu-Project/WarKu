var express        =         require("express");
var bodyParser     =         require("body-parser");
var app            =         express();
/** initialize cors **/
var cors = require('cors');
/** use cors for prevent different access origin problem **/
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.get('/',function(req,res){
//   res.sendfile("index.html");
// });
app.post('/login',function(req,res){
  var user_name=req.body.user;
  var password=req.body.password;
  console.log("User name = "+user_name+", password is "+password);
  res.end("done");
});
app.listen(3000,function(){
  console.log("Started on PORT 3000");
})
