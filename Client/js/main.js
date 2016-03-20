var socket = io();

var connectedPlayers = [];
var prods = [];
var canvas = document.getElementById('canvas');

var mousePos = {x: 0, y: 0};

var inputKey = {left:false,up:false,right:false,down:false};
var me = new localPlayer();
var cursorWidth=15;





$(function(){

canvas.onclick = mouseClickCanvas;

var canvasOffsetx = getOffset( canvas ).left; 
var canvasOffsety = getOffset( canvas ).top;  
	$('#canvas').mousemove(function(e){
	    mousePos={
	        x: ((e.clientX)) - canvasOffsetx,
			y: ((e.clientY)) - canvasOffsety
	    };
	    console.log(mousePos);
	});

});

socket.on('initRemotePlayers', function(data){
	connectedPlayers = data;
	startLoop();
	
});

socket.on('update', function(data){
	connectedPlayers = data.players;
	prods = data.prods;
});

function startLoop(){

	draw();

	window.requestAnimationFrame(startLoop);
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
	ctx.beginPath();
  	ctx.arc(400, 400, 300, 0, 2 * Math.PI);
  	ctx.lineWidth = 5;
  	ctx.strokeStyle = '#000000';
  	ctx.stroke();
  	ctx.closePath();

	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		ctx.fillStyle = connectedPlayers[i].color;
		ctx.fillRect(connectedPlayers[i].x, connectedPlayers[i].y, connectedPlayers[i].width, connectedPlayers[i].height);
	}

	if (typeof prods !== 'undefined' && prods.length > 0) {
		for (var i = prods.length - 1; i >= 0; i--) {
			ctx.fillStyle = prods[i].color;
			ctx.fillRect(prods[i].x, prods[i].y, prods[i].width, prods[i].height);
		}
	}
	

	
	ctx.beginPath();
	ctx.fillStyle = "#000000";
  	ctx.arc(mousePos.x - cursorWidth/2,mousePos.y - cursorWidth/2,cursorWidth/2, 0, 2 * Math.PI);
  	ctx.fill();
  	ctx.closePath();

  	

	

}


//=========== end of RENDER ============

//=========== INPUT =============
window.addEventListener("keydown", function(e) {
    // space and wasd keys

    if([83, 87, 65, 68, 32].indexOf(e.keyCode) > -1) {
        e.preventDefault();
        keydown(e);
    }
}, false);

window.addEventListener("keyup", function(e) {
    // space and wasd keys

    if([83, 87, 65, 68, 32].indexOf(e.keyCode) > -1) {
        e.preventDefault();
        keyup(e);
    }
}, false);

function keydown(e){
if (e.keyCode==65)
  inputKey.left=true;
else if (e.keyCode==87)
  inputKey.up=true;
else if (e.keyCode==68)
  inputKey.right=true;
else if (e.keyCode==83)
  inputKey.down=true;
socket.emit('input',inputKey);
}

function keyup(e){
if (e.keyCode==65)
  inputKey.left=false;
else if (e.keyCode==87)
  inputKey.up=false;
else if (e.keyCode==68)
  inputKey.right=false;
else if (e.keyCode==83)
  inputKey.down=false;
socket.emit('input',inputKey);
}
//=========== End of INPUT =========

socket.on('thecolor', function(data){
	console.log(data);
});