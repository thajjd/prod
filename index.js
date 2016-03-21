var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var now = require("performance-now");

var physicsLoopIntervall = 1000/66;
var serverUpdateLoopIntervall = 1000/22;
var ID = require('./js/id.js');

//resources
var player=require('./js/player.js').player;
var prod=require('./js/prod.js').prod;
var helper=require('./js/helperFunctions.js');

//Server variables
var connectedPlayers = [];
var prods = [];
var lastPlayerStates = [];
var currentPlayersStates = [];

var newTime;
var oldTime;
var lastFrameTime;
var fpsTime = 0;
var fpsTick = 0;
var optimalFramerate = 1000/60;


io.on('connection', function(socket){
	var id=ID.id();
  	console.log('a '+id+' connected ');

  	var currentSocketPlayer = new player(id);
  	connectedPlayers.push(currentSocketPlayer);
	socket.emit('initRemotePlayers', connectedPlayers);

  	socket.on('input', function(inputData){
  		currentSocketPlayer.inputData = inputData;
  	});

  	//Attack
  	socket.on('prod', function(mousePosition){
  		//TODO PROD CREATION
  		var newProd = new prod(id, mousePosition, currentSocketPlayer.x, currentSocketPlayer.y, currentSocketPlayer.color);
  		prods.push(newProd);
  		console.log("prod created");

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

	//TODO Delta shit
	newTime = now();
	lastFrameTime = isNaN(newTime-oldTime)?0:newTime-oldTime;
	oldTime=newTime;
	var deltaTime= isNaN(lastFrameTime/optimalFramerate)?1: lastFrameTime/optimalFramerate;

	fpsTime+=lastFrameTime;
	fpsTick++;

	if(fpsTime>1000){
		console.log( 'Server had '+ fpsTick +' frames last second.');
		fpsTick=0;
		fpsTime=0;
	}

	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		connectedPlayers[i].update();

	}
	if (typeof prods !== 'undefined' && prods.length > 0) {
		for (var i2 = prods.length - 1; i2 >= 0; i2--) {
			prods[i2].update(deltaTime);
		}
	}
	

	
}
function serverUpdateLoop(){
	io.emit('update', {players:connectedPlayers, prods:prods});

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