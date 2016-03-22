var app = require('express')();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
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

//Rooms
var rooms = [];


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
  		var newProd = new prod(id, mousePosition, currentSocketPlayer.x+(currentSocketPlayer.width/2), currentSocketPlayer.y+(currentSocketPlayer.height/2), currentSocketPlayer.color);
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.get('/', function(req, res){
  res.sendFile(__dirname + '/Client/index.html');
});

app.get('/js/:name', function (req, res) {
  res.sendFile(__dirname+"/Client/js/"+req.params.name);
  console.log(req.params.name+" sent");
});

app.get('/rooms', function (req, res) {
	res.json(rooms);
})

app.post('/rooms', function(req, res) {
	rooms.forEach(function(room) {
		var index = 0;

		room.players.forEach(function(player) {
			if(player.name == req.body.user) {
				room.players.splice(index, 1);
				io.emit('update_room', room);
			}

			index++;
		})
	})
	
	var room = {
		name: req.body.name,
		players: [{name: req.body.user}]
	};

	rooms.push(room);

	io.emit('update_room', room);

	res.json(room);
})

app.get('/room/:name', function(req, res) {
	rooms.forEach(function(roomObj) {
		if(roomObj.name == req.params.name) {
			room = roomObj;
		}
	})

	res.json(room);
})

app.post('/rooms/:op(join|leave|ready)', function(req, res) {
	var room = false;

	rooms.forEach(function(roomObj) {
		if(roomObj.name == req.body.name) {
			room = roomObj;
		}
	})

	switch(req.params.op) {
		case 'join':
			rooms.forEach(function(roomObj) {
				var index = 0;
				var roomPlayers = [];

				roomObj.players.forEach(function(player) {
					if(player.name == req.body.user) {
						roomObj.players.splice(index, 1)
						io.emit('update_room', roomObj);
					}

					index++;
				})
			})

			room.players.push({name: req.body.user});

			io.emit('update_room', room);

			break;

		case 'leave':
			var index = 0;

			room.players.forEach(function(player) {
				if(player.name == req.body.user) {
					room.players.splice(index, 1);
				}

				index++;
			})

			io.emit('update_room', room);

			break;

		case 'ready':
			var countReady = 0;

			room.players.forEach(function(player) {
				if(player.name == req.body.user) {
					player.ready = true;
				}

				if(player.ready) {
					countReady++;
				}
			})

			if(countReady == room.players.length) {
				startRoom(room);
			}

			io.emit('update_room', room);

			break;
	}

	res.json(room);
})

function startRoom(room) {
	console.log("FUCKING START THIS SHIT: ", room);
}

server.listen(3000, function(){
  console.log('listening on *:3000');
});