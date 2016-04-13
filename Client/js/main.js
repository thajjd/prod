
var arenaRadius;
var arenaPos = {x: 0, y: 0};
var connectedPlayers = [];
var prods = [];
var meteors = [];
var canvas = document.getElementById('canvas');
var selfName = "";
var mousePos = {x: 0, y: 0};

var inputKey = {left:false,up:false,right:false,down:false,space:false};
var cursorWidth=10;

//Spells
var blinkCooldownTime;
var blinkCooldownUpdated;

var prodCooldownUpdated;
var prodCooldownTime;

var meleeCooldownUpdated;
var meleeCooldownTime;

var meteorCooldownUpdated;
var meteorCooldownTime;

var newTime;
var oldTime;
var lastFrameTime;
var optimalFramerate;
var fpsTime = 0;
var fpsTick = 0;
var deltaTime;

var gameRunning = false;



var wKey = 87;
var aKey = 65;
var sKey = 83;
var dKey = 68;
var spaceKey = 32;
var fKey = 70;
var rKey = 82;

var arenaTexture = new Image();
arenaTexture.src = '/grafx/arena.jpg';

socket.on('assignName', function(myName){
		selfName = myName;
});
socket.on('initRemotePlayers', function(data){
	// $.each(data, function(index, player) {
	// 	var obj = new Player();
	// 	obj.init(player);
	// 	obj.myName = selfName;
	// 	connectedPlayers.push(obj);
	// });
});

socket.on('update', function(data){
	$.each(data.players, function(index, serverPlayer) {
		var playerIsLoaded = false;

		$.each(connectedPlayers, function(lindex, localPlayer) {
			if(serverPlayer.id == localPlayer.id) {
				playerIsLoaded = true;
				localPlayer.load(serverPlayer);
			}
		});

		if(!playerIsLoaded) {
			var obj = new Player();
			obj.init(serverPlayer);
			obj.myName = selfName;
			connectedPlayers.push(obj);
		}
	});


	prods = data.prods;
	meteors = data.meteors;
	arenaRadius = data.arenaRadius;
	arenaPos = data.arenaPos;
});
socket.on('initGame', function(data){
	console.log('Starting Game ...');
	$('#matchmaking').hide();
	$('#game').show();
	$('#scoreboardarea').show();
	gameRunning = true;
	activateMouseInput();
	activateGameInput();
	startLoop();
	updateScoreboard();
});
socket.on('updateScoreboard', function(data){
	updateScoreboard();
});
socket.on('cooldownBlink', function(blinkCooldown){
	blinkCooldownUpdated = Date.now();
	blinkCooldownTime = blinkCooldown;
});
socket.on('cooldownProd', function(prodCooldown){
	prodCooldownUpdated = Date.now();
	prodCooldownTime = prodCooldown;
});
socket.on('cooldownMelee', function(meleeCooldown){
	meleeCooldownUpdated = Date.now();
	meleeCooldownTime = meleeCooldown;
});
socket.on('cooldownMeteor', function(meteorCooldown){
	meteorCooldownUpdated = Date.now();
	meteorCooldownTime = meteorCooldown;
});
socket.on('gameOver', function(lastGameName){
	$('#matchmaking').show();
	$('#game').hide();
	$('#stats').hide();
	$('#scoreboardarea').hide();	
	rematch(lastGameName);

});
socket.on('stopGame', function(){
	gameRunning = false;
	$('#matchmaking').show();
	$('#game').hide();
	$('#stats').hide();
	$('#scoreboardarea').hide();

});

function startLoop(){

	newTime = Date.now();
	lastFrameTime = isNaN(newTime-oldTime)?0:newTime-oldTime;
	oldTime=newTime;
	deltaTime= isNaN(lastFrameTime/optimalFramerate)?1: lastFrameTime/optimalFramerate;

	fpsTime+=lastFrameTime;
	fpsTick++;

	if (newTime - blinkCooldownUpdated < blinkCooldownTime ) {
		$('#blinkcd').html((blinkCooldownUpdated + blinkCooldownTime) - newTime);
	}else{
		if ($('#blinkcd.span').html() !== "REDDY") {
			$('#blinkcd').html("<span style='color:green;'>REDDY</span>");
		}
	}
	if (newTime - prodCooldownUpdated < prodCooldownTime ) {
		$('#prodcd').html((prodCooldownUpdated + prodCooldownTime) - newTime);
	}else{
		if ($('#prodcd.span').html() !== "REDDY") {
			$('#prodcd').html("<span style='color:green;'>REDDY</span>");
		}
	}
	if (newTime - meleeCooldownUpdated < meleeCooldownTime ) {
		$('#meleecd').html((meleeCooldownUpdated + meleeCooldownTime) - newTime);
	}else{
		if ($('#meleecd.span').html() !== "REDDY") {
			$('#meleecd').html("<span style='color:green;'>REDDY</span>");
		}
	}
	if (newTime - meteorCooldownUpdated < meteorCooldownTime ) {
		$('#meteorcd').html((meteorCooldownUpdated + meteorCooldownTime) - newTime);
	}else{
		if ($('#meteorcd.span').html() !== "REDDY") {
			$('#meteorcd').html("<span style='color:green;'>REDDY</span>");
		}
	}

	draw();
	if (gameRunning) {
		window.requestAnimationFrame(startLoop);	
	}
	
}

function mouseClickCanvas(e){
	console.log("klick");
  socket.emit('prod',mousePos);
}

//=========== RENDER ============

function draw(){
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//Draw Arena

	ctx.save();
	ctx.beginPath();
  	ctx.arc(arenaPos.x, arenaPos.y, arenaRadius, 0, 2 * Math.PI);
  	ctx.lineWidth = 5;
  	ctx.strokeStyle = '#000000';
  	ctx.stroke();
  	ctx.closePath();
  	ctx.clip();
  	//Lava-arena
  	// ctx.drawImage(arenaTexture, 0, 0);

  	ctx.beginPath();
    ctx.arc(0, 0, arenaRadius, 0, 2 * Math.PI);
    ctx.clip();
    ctx.closePath();
    ctx.restore();

	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		if (connectedPlayers[i].dead === false) {
			ctx.beginPath();
			ctx.fillStyle = connectedPlayers[i].color;
			ctx.arc(connectedPlayers[i].x, connectedPlayers[i].y, connectedPlayers[i].width, 0, 2 * Math.PI);
			ctx.fill();
			ctx.closePath();
		}
		
		connectedPlayers[i].render(ctx);
	}

	if (typeof prods !== 'undefined' && prods.length > 0) {
		for (var i = prods.length - 1; i >= 0; i--) {
			ctx.beginPath();
			ctx.fillStyle = prods[i].color;
			ctx.arc(prods[i].currentPos.x, prods[i].currentPos.y, prods[i].width, 0, 2*Math.PI);
			ctx.fill();
			ctx.closePath();
		}
	}
	if (typeof meteors !== 'undefined' && meteors.length > 0) {
		for (var i = meteors.length - 1; i >= 0; i--) {
			
			if (meteors[i].triggered === false) {
				ctx.beginPath();
				ctx.strokeStyle = meteors[i].color;
				ctx.arc(meteors[i].targetPos.x, meteors[i].targetPos.y, meteors[i].radius, 0, 2*Math.PI);
				ctx.stroke();
				ctx.closePath();

				ctx.beginPath();
				ctx.fillStyle = meteors[i].color;
				ctx.arc(meteors[i].targetPos.x, meteors[i].targetPos.y, ((meteors[i].lastTick/(meteors[i].timeCreated + meteors[i].delay)) * meteors[i].radius), 0, 2*Math.PI);
				console.log(((meteors[i].lastTick/(meteors[i].timeCreated + meteors[i].delay)) * meteors[i].radius));
				ctx.fill();
				ctx.closePath();
			}
		}
	}
	

	ctx.beginPath();
	ctx.fillStyle = "#ffffff";
  	ctx.arc(mousePos.x - (cursorWidth + 4)/2,mousePos.y - (cursorWidth + 4)/2,(cursorWidth + 4)/2, 0, 2 * Math.PI);
  	ctx.fill();
  	ctx.closePath();
	ctx.beginPath();
	ctx.fillStyle = "#000000";
  	ctx.arc(mousePos.x - cursorWidth/2,mousePos.y - cursorWidth/2,cursorWidth/2, 0, 2 * Math.PI);
  	ctx.fill();
  	ctx.closePath();
  	

}

function updateScoreboard(){
	var output = "";
	connectedPlayers.sort(compare);
	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		output += "<tr>";
		output += "<td>" + connectedPlayers[i].name + "</td><td>" + connectedPlayers[i].score + "</td>";
		output += "</tr>";
	}
	$('#scoreboard').html(output);
	

}
//sort scoreboard
function compare(a,b) {
  if (a.score < b.score)
    return -1;
  else if (a.score > b.score)
    return 1;
  else 
    return 0;
}


//=========== end of RENDER ============
function activateMouseInput(){
	$(function(){

	canvas.onclick = mouseClickCanvas;

	var canvasOffsetx = getOffset( canvas ).left; 
	var canvasOffsety = getOffset( canvas ).top;  
		$('#canvas').mousemove(function(e){
		    mousePos={
		        x: ((e.clientX)+(cursorWidth/2)) - canvasOffsetx,
				y: ((e.clientY)+(cursorWidth/2)) - canvasOffsety
		    };
		    // console.log(mousePos);
		});

	});
}

//=========== INPUT =============
function activateGameInput(){
	window.addEventListener("keydown", function(e) {
	    // space and wasd keys

	    if([wKey, aKey, sKey, dKey, spaceKey, fKey, rKey].indexOf(e.keyCode) > -1) {
	        e.preventDefault();
	        keydown(e);
	    }
	}, false);

	window.addEventListener("keyup", function(e) {
	    // space and wasd keys

	    if([wKey, aKey, sKey, dKey, spaceKey, fKey, rKey].indexOf(e.keyCode) > -1) {
	        e.preventDefault();
	        keyup(e);
	    }
	}, false);
}


function keydown(e){
if (e.keyCode==aKey)
	inputKey.left=true;
else if (e.keyCode==wKey)
	inputKey.up=true;
else if (e.keyCode==dKey)
	inputKey.right=true;
else if (e.keyCode==sKey)
	inputKey.down=true;
else if (e.keyCode==spaceKey){
	socket.emit('castBlink', mousePos);
}
else if (e.keyCode==fKey){
	socket.emit('castMelee');
}
else if (e.keyCode==rKey){
	socket.emit('castMeteor', mousePos);
}
socket.emit('input',inputKey);
}

function keyup(e){
if (e.keyCode==aKey)
	inputKey.left=false;
else if (e.keyCode==wKey)
	inputKey.up=false;
else if (e.keyCode==dKey)
	inputKey.right=false;
else if (e.keyCode==sKey)
	inputKey.down=false;
 
socket.emit('input',inputKey);
}
//=========== End of INPUT =========
