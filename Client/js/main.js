var socket = io();

var connectedPlayers = [];
var ctx = document.getElementById('canvas');
var inputKey = {left:false,up:false,right:false,down:false};


$(function(){

 
	$('#canvas').mousemove(function(e){
	    mousePos={
	        x: ((e.clientX)),
			y: ((e.clientY))
	    };
	});
});

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