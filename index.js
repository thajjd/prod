var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');

var ID = require('./js/id.js');

//resources
var player=require('./js/player.js').player;


var connectedPlayers = [];
var clientFps = 1000/60;
var serverFps;

io.on('connection', function(socket){
	var id=ID.id();
  	console.log('a '+id+' connected ');


  	var thePlayer = new player(id);
	connectedPlayers.push(thePlayer);

  	socket.on('input', function(inputData){
  		thePlayer.inputData = inputData;
  	});

	io.emit('thecolor', thePlayer.color);

});

io.on('disconnection', function(socket){
	console.log(id + 'disconnected');
	io.sockets.emit(id + 'disconnected');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/Client/index.html');
});

app.get('/js/:name', function (req, res) {
  res.sendFile(__dirname+"/Client/js/"+req.params.name);
  console.log(req.params.name+" sent");
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});