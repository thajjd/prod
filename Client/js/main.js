var socket = io();

var connectedPlayers = [];
var canvas = document.getElementById('canvas');
console.log(canvas);
var ctx = canvas.getContext("2d");
var inputKey = {left:false,up:false,right:false,down:false};
var me = new localPlayer();



$(function(){

 
	$('#canvas').mousemove(function(e){
	    mousePos={
	        x: ((e.clientX)),
			y: ((e.clientY))
	    };
	});

});
socket.on('initRemotePlayers', function(data){
	connectedPlayers = data;
	startLoop();
	
});
// socket.on('initSocketSelf', function(data){
// 	me.init(data);
	
// });

//TODO lägg till fler spelare
// socket.on('addPlayer', function(data){

// });

//TODO lägg till server update
socket.on('update', function(data){
	connectedPlayers = data;
});

function startLoop(){

	draw();

	window.requestAnimationFrame(startLoop);
}

//=========== RENDER ============

function draw(){

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = connectedPlayers.length - 1; i >= 0; i--) {
		ctx.beginPath();
		ctx.rect(connectedPlayers[i].x, connectedPlayers[i].y, connectedPlayers[i].width, connectedPlayers[i].height);
		ctx.fillStyle = connectedPlayers[i].color;
		ctx.fill();
		ctx.closePath();
	}

	

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