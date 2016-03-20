var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');

var physicsLoopIntervall = 1000/66;
var serverUpdateLoopIntervall = 1000/22;
var ID = require('./js/id.js');

//resources
var player=require('./js/player.js').player;
var connectedPlayers = [];
var prods = [];

io.on('connection', function(socket){
	var id=ID.id();
  	console.log('a '+id+' connected ');

  	var currentSocketPlayer = new player(id);
  	connectedPlayers.push(currentSocketPlayer);
	socket.emit('initRemotePlayers', connectedPlayers);

  	socket.on('input', function(inputData){
  		currentSocketPlayer.inputData = inputData;
  	});

  	socket.on('prod', function(mousePosition){
  		//TODO PROD CREATION
  		var prod = new prod(id, mousePosition);

  	});

	socket.on('disconnect', function(){
		console.log(id + 'disconnected');
		for (var i = connectedPlayers.length - 1; i >= 0; i--) {
			if (connectedPlayers[i].id == id) {
				connectedPlayers.splice(i,1);
			}
			
		}
		io.sockets.emit(id + ' disconnected');
	});
});



function start(){
	setInterval(physicsLoop, physicsLoopIntervall);
	setInterval(serverUpdateLoop, serverUpdateLoopIntervall);
}

function physicsLoop(){
	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		connectedPlayers[i].update();
	}
}
function serverUpdateLoop(){
	io.emit('update', connectedPlayers);

}

//INITIATE MOTHER FUCKER
start();

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