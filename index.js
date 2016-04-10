var app = require('express')();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var now = require("performance-now");
var ID = require('./js/id.js');

//resources
var player=require('./js/player.js').player;
var game=require('./js/game.js').game;
var prod=require('./js/prod.js').prod;
var helper=require('./js/helperFunctions.js');

//Server variables
var games = [];
var connectedPlayers = [];
// var prods = [];

// var physicsLoopIntervall = 1000/66;
// var serverUpdateLoopIntervall = 1000/22;
// var newTime;
// var oldTime;
// var lastFrameTime;
// var fpsTime = 0;
// var fpsTick = 0;
// var optimalFramerate = 1000/60;

//Rooms
var rooms = [];


io.on('connection', function(socket){
	var id=ID.id();
  	console.log('a '+id+' connected ');
  	var thisplr;

  	socket.on('checkUsername', function(newUsername){
  		console.log(newUsername);
  		var ignAvailable = true;
  		for (var i = connectedPlayers.length - 1; i >= 0; i--) {
  			if (connectedPlayers[i].name == newUsername ) {
  				ignAvailable = false;
  				console.log(newUsername + " was taken...");
  			}
  		}
  		socket.emit('checkUsernameAnswer', ignAvailable);
  		if (ignAvailable) {
  			thisplr = new player(id, newUsername);
  			connectedPlayers.push(thisplr);
  		}

  	});

  	socket.on('joinGame', function(data){
  		

  		socket.join(data.roomName);

  		socket.on('leaveGame', function(data){
	  		socket.leave(data.roomName);
	  	});

	  	
	  	
		socket.emit('initRemotePlayers', connectedPlayers);

	  	socket.on('input', function(inputData){
	  		thisplr.inputData = inputData;

	  		
	  	});
	  	socket.on('castBlink', function(mousePosData){
	  		var wasCast = thisplr.castBlink(mousePosData);
	  		if (wasCast) {
	  			socket.emit('cooldownBlink', thisplr.blinkCooldown);
	  		}
	  		wasCast = false;
	  	});

	  	//Attack
	  	socket.on('prod', function(mousePosition){
	  		if (now() - thisplr.lastCastProd >= thisplr.prodCooldown && thisplr.dead === false) {
				var newProd = new prod(id, thisplr.name, mousePosition, thisplr.x+(thisplr.width/2), thisplr.y+(thisplr.height/2), thisplr.color, now());
				thisplr.lastCastProd = now();
				for (var i = games.length - 1; i >= 0; i--) {
					if (games[i].gameID == thisplr.currentGame) {
						games[i].prods.push(newProd);
					}
				}
				
				console.log("prod created");
				socket.emit('cooldownProd',thisplr.prodCooldown);
	  		}
	  	});
	  	socket.on('castMelee', function(){
	  		var wasCast;
	  		for (var i = games.length - 1; i >= 0; i--) {
	  			if (games[i].gameID == thisplr.currentGame) {
					wasCast = thisplr.castMelee(games[i]);
				}
	  		}
	  		if (wasCast) {
	  			socket.emit('cooldownMelee', thisplr.meleeCooldown);
	  		}
	  		wasCast = false;
	  	});
  	});

  // 	socket.on('rematch', function(data){
  // 		socket.leave(data.roomName);
  // 		socket.join(data.roomName);

  // 		socket.on('leaveGame', function(data){
	 //  		socket.leave(data.roomName);
	 //  	});

	  	
	  	
		// socket.emit('initRemotePlayers', connectedPlayers);

	 //  	socket.on('input', function(inputData){
	 //  		thisplr.inputData = inputData;
	 //  	});

  // 	});

  	socket.on('disconnect', function(){
		console.log(id + ' disconnected');
		for (var i = rooms.length - 1; i >= 0; i--) {
			for (var j = rooms[i].players.length - 1; j >= 0; j--) {
				if (rooms[i] !==undefined && thisplr !== undefined) {
					if (thisplr.name == rooms[i].players[j].name) {
						rooms[i].players.splice(j, 1);
						io.emit('update_room', rooms[i]);

						if (rooms[i].players.length < 2) {
							rooms.splice(i,1);

						}
					}
				}
				
			}
		}
		for (var k = connectedPlayers.length - 1; k >= 0; k--) {
			if (connectedPlayers[k].id == id) {
				for (var i = games.length - 1; i >= 0; i--) {
					for (var j = games[i].players.length - 1; j >= 0; j--) {
						if (games[i].players[j].id == id) {
							//Remove player from current if any
							games[i].players.splice(j, 1);
						}
					}
				}
				//Remove player from global onlinelist
				connectedPlayers.splice(k,1);
			}
		}
		io.emit(id + ' disconnected');
		

	});
  	
});


function startRoom(roomData) {
	console.log("FUCKING START THIS SHIT: ", roomData);
	var gameid = ID.id();
	var newGame = new game(io, roomData, gameid);
	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		for (var j = roomData.players.length - 1; j >= 0; j--) {
			if (roomData.players[j].name == connectedPlayers[i].name) {
				newGame.players.push(connectedPlayers[i]);
			}		
		}
	}
	for (var i = newGame.players.length - 1; i >= 0; i--) {
		
		newGame.players[i].currentGame = gameid;
	}
	games.push(newGame);
	
	newGame.start();
	io.to(roomData.name).emit('initGame', roomData);
}

//INITIATE MOTHER FUCKER


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.get('/', function(req, res){
  res.sendFile(__dirname + '/Client/index.html');
});

// app.get('/:name', function (req, res, next) {

//   var options = {
//     root: __dirname + '/',
//     dotfiles: 'allow',
//     headers: {
//         'x-timestamp': Date.now(),
//         'x-sent': true
//     }
//   };

//   var fileName = req.params.name;
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       console.log(err);
//       res.status(err.status).end();
//     }
//     else {
//       console.log('Sent:', fileName);
//     }
//   });

// });

app.get('/js/:name', function (req, res) {
  res.sendFile(__dirname+"/Client/js/"+req.params.name);
  console.log(req.params.name+" sent");
});

app.get('/grafx/:name', function (req, res) {
  res.sendFile(__dirname+"/grafx/"+req.params.name);
  console.log(req.params.name+" sent");
});

app.get('/rooms', function (req, res) {
	res.json(rooms);
});

app.post('/rooms', function(req, res) {
	var roomTaken = false;
	for (var i = rooms.length - 1; i >= 0; i--) {
		if (rooms[i].name == req.body.name) {
			roomTaken = true;
		}
	}
	if (roomTaken === false) {
		rooms.forEach(function(room) {
			var index = 0;

			room.players.forEach(function(player) {
				if(player.name == req.body.user) {
					room.players.splice(index, 1);
					io.emit('update_room', room);
				}

				index++;
			});
		});
		
		var room = {
			name: req.body.name,
			players: [{name: req.body.user}],
			status: "Waiting"
		};

		rooms.push(room);

		io.emit('update_room', room);

		res.json(room);
	}
	for (var i = rooms.length - 1; i >= 0; i--) {
		if(rooms[i].players.length === 0){
			rooms.splice(i,1);

		}			
	}
	
});

app.get('/room/:name', function(req, res) {
	rooms.forEach(function(roomObj) {
		if(roomObj.name == req.params.name) {
			room = roomObj;
		}
	});

	res.json(room);
});

app.post('/rooms/:op(join|leave|ready|rematch)', function(req, res) {
	var room = false;

	rooms.forEach(function(roomObj) {
		if(roomObj.name == req.body.name) {
			room = roomObj;
		}
	});

	switch(req.params.op) {
		case 'join':
			if (room.status !== 'Running') {
				rooms.forEach(function(roomObj) {
					var index = 0;
					var roomPlayers = [];

					roomObj.players.forEach(function(player) {
						if(player.name == req.body.user) {
							roomObj.players.splice(index, 1);
							console.log(player);
							io.emit('update_room', roomObj);
						}

						index++;
					});
				});

				room.players.push({name: req.body.user});

				io.emit('update_room', room);
			}
			break;
		case 'rematch':
			room.status = "Waiting";
			room.players.shift({name: req.body.user});
			rooms.forEach(function(roomObj) {
				var index = 0;
				var roomPlayers = [];

				roomObj.players.forEach(function(player) {
					if(player.name == req.body.user) {
						roomObj.players.splice(index, 1);
						console.log(player);
						io.emit('update_room', roomObj);
					}

					index++;
				});
			});
			
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
			});

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
			});

			if(countReady == room.players.length && room.players.length > 1) {
				room.status = 'Running';
				startRoom(room);
			}

			io.emit('update_room', room);

			break;
	}
	for (var i = rooms.length - 1; i >= 0; i--) {
		if(rooms[i].players.length === 0){
			rooms.splice(i,1);

		}			
	}
	io.emit('update_room');
	res.json(room);
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});