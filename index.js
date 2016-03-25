var app = require('express')();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var now = require("performance-now");
var ID = require('./js/id.js');

//resources
var player=require('./js/player.js').player;
var prod=require('./js/prod.js').prod;
var helper=require('./js/helperFunctions.js');

//Server variables
var connectedPlayers = [];
var prods = [];

var physicsLoopIntervall = 1000/66;
var serverUpdateLoopIntervall = 1000/22;
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

  	socket.on('joinGame', function(data){
  		var thisplr = new player(id, data.playerName);

  		connectedPlayers.push(thisplr);

  		socket.join(data.roomName);

  		socket.on('leaveGame', function(data){
	  		socket.leave(data.roomName);
	  	});

	  	
	  	
		socket.emit('initRemotePlayers', connectedPlayers);

	  	socket.on('input', function(inputData){
	  		thisplr.inputData = inputData;
	  	});

	  	//Attack
	  	socket.on('prod', function(mousePosition){
	  		if (now() - thisplr.lastCastProd >= thisplr.prodCooldown ) {
				var newProd = new prod(id, mousePosition, thisplr.x+(thisplr.width/2), thisplr.y+(thisplr.height/2), thisplr.color, now());
				thisplr.lastCastProd = now();
				prods.push(newProd);
				console.log("prod created");
	  		}
	  		

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
  	
});



function start(roomData){
	setInterval(physicsLoop, physicsLoopIntervall, roomData);
	setInterval(serverUpdateLoop, serverUpdateLoopIntervall, roomData);
}

function physicsLoop(roomData){

	newTime = now();
	lastFrameTime = isNaN(newTime-oldTime)?0:newTime-oldTime;
	oldTime=newTime;
	var deltaTime= isNaN(lastFrameTime/optimalFramerate)?1: lastFrameTime/optimalFramerate;

	fpsTime+=lastFrameTime;
	fpsTick++;

	if(fpsTime>1000){
		// console.log( 'Server had '+ fpsTick +' frames last second.');
		fpsTick=0;
		fpsTime=0;
	}

	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		connectedPlayers[i].update(deltaTime);

	}
	if (typeof prods !== 'undefined' && prods.length > 0) {
		for (var i = prods.length - 1; i >= 0; i--) {
			prods[i].update(deltaTime);

			
				
			//Dig a prod collide with a prod?
			for (var j = prods.length - 1; j >= 0; j--) {
				var a = prods[i];
				var b = prods[j];
				if (prod[j] != undefined) {
					if(i != j && a.creator != b.creator){
						//d=distance,c=collision
						var dx = a.currentPos.x - b.currentPos.x;
						var dy = a.currentPos.y - b.currentPos.y;
						var d2 = dx * dx + dy * dy;
						if(d2 <= ((a.width + b.width) * (a.width + b.width))){
							var dotProduct = dx * (b.normalized.x - a.normalized.x) + dy * (b.normalized.y - a.normalized.y);
							
							//Want shit to bounce of eachother, this is it!
							// if(dotProduct > 0){
							// 	var cScale = dotProduct / d2;
							// 	var cX = dx * cScale;
							// 	var cY = dy * cScale;
							// 	var massTotal = a.width + b.width;
							// 	var cWeightA = 2 * b.width / massTotal;
							// 	var cWeightB = 2 * a.width / massTotal;
							// 	a.normalized.x += (cWeightA * cX);
							// 	a.normalized.y += (cWeightA * cY);
							// 	b.normalized.x -= (cWeightB * cX);
							// 	b.normalized.y -= (cWeightB * cY);
							// }

							console.log("prod - prod collision");
							prods.splice(i, 1);
							prods.splice(j, 1);
						}
					}
				}
				
			}

			for (var j = connectedPlayers.length - 1; j >= 0; j--) {
				if (prods[i] != undefined) {
					var a = prods[i];
					var b = connectedPlayers[j];
					if (a.creator != undefined) {
						if(a.creator != b.id){
							//d=distance,c=collision
							var dx = a.currentPos.x - b.x;
							var dy = a.currentPos.y - b.y;
							var d2 = dx * dx + dy * dy;
							if(d2 <= ((a.width + b.width) * (a.width + b.width))){
								//TODO What happens when prod collides with player
								// var dotProduct = dx * (0 - a.normalized.x) + dy * (0 - a.normalized.y);
								// if(dotProduct > 0){
									// var cScale = dotProduct / d2;
									// var cX = dx * cScale;
									// var cY = dy * cScale;
									// var massTotal = a.width + b.width;
									// var cWeightA = 2 * b.width / massTotal;
									// var cWeightB = 2 * a.width / massTotal;
									var avatarCenter = {x: b.x + (b.width/2), y: b.y +(b.width/2)};
									var prodCenter = {x: a.currentPos.x + (a.width/2), y: a.currentPos.y + (a.width/2)};
									var distance = helper.getDistance(avatarCenter, prodCenter);
									var normalized = helper.normalize(distance);
									b.currentKnockbackPower = a.knockbackPower;
									b.knockbackDir.x += normalized.x;
									b.knockbackDir.y += normalized.y;
									b.isKnockbacked = true;
									
								// }

								console.log("Player - prod collision");
								prods.splice(i, 1);
								b.hp -= a.dmg;
								if (b.hp <= 0) {
									io.to(roomData.name).emit('playerDeath', connectedPlayers[j].name + " bit the dust, fucking noob...");	
									connectedPlayers.splice(j, 1);
								}

							}

						}

					}
					
				}
				
			}
			

			//Check if TTL has passed
			if (prods[i] != undefined) {
				if (now() - prods[i].timeCreated > prods[i].ttl) {
				
					console.log('prod created: ' + prods[i].timeCreated);
					console.log('prod destroyed: ' + now());
					prods.splice(i, 1);
				}
				
			}
			
		}
	}
	

	
}
function serverUpdateLoop(roomData){
	io.to(roomData.name).emit('update', {players:connectedPlayers, prods:prods});

}

function startRoom(roomData) {
	console.log("FUCKING START THIS SHIT: ", roomData);
	io.to(roomData.name).emit('initGame', roomData);
	start(roomData);
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

app.get('/rooms', function (req, res) {
	res.json(rooms);
});

app.post('/rooms', function(req, res) {
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
		players: [{name: req.body.user}]
	};

	rooms.push(room);

	io.emit('update_room', room);

	res.json(room);
});

app.get('/room/:name', function(req, res) {
	rooms.forEach(function(roomObj) {
		if(roomObj.name == req.params.name) {
			room = roomObj;
		}
	});

	res.json(room);
});

app.post('/rooms/:op(join|leave|ready)', function(req, res) {
	var room = false;

	rooms.forEach(function(roomObj) {
		if(roomObj.name == req.body.name) {
			room = roomObj;
		}
	});

	switch(req.params.op) {
		case 'join':
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

			if(countReady == room.players.length) {
				startRoom(room);
			}

			io.emit('update_room', room);

			break;
	}

	res.json(room);
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});