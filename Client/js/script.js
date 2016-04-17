
var BASE_URL = ''; 
var USER = false;
var ROOMS = [];
var OPEN_ROOM = '';

$(document).ready(function() {
	$('input[name="submit-name"]').click(function() {
		USER = $('input[name="name"]').val();
		var usernameisokay = checkUsernamevalidity(USER);
		if (usernameisokay) {
			socket.emit('checkUsername', USER);
		}else{
			$('.errorMsg').show();
			$('.errorMsg').html("FUCK! only the characters a-z and the numbers 0-9 are allowed dude...");
		}
		
		socket.on('checkUsernameAnswer', function(ignAvailable){
			if (ignAvailable === true) {
				$('.name-form').hide();
				$('.errorMsg').hide();
				renderMatchList();
			}else{
				$('.errorMsg').show();
				$('.errorMsg').html("FUCK! " + USER + " is allrädy taken!");
			}
		});

		

		return false;
	});


	$('.create-room').click(function() {
		var roomName = $('input[name="room-name"]').val();
		if(roomName !== '') {
			$.post(BASE_URL + '/rooms', {user: USER, name: roomName}, function(room) {
				renderRoom(room);
			});
			socket.emit('joinGame', {roomName: roomName,playerName: USER});
		} else {
			$('.matches-msg').text('YOU DIDNT ENTER A GOD DAMN ROOM NAME WHAT THE FUCK IS WRONG WITH YOU');
		}
		
		

		return false;
	});
});

function checkUsernamevalidity(username){
	var re = /^[a-z0-9]+$/i;
	var OK = re.exec(username);
	if (!OK) {
		console.log('Weird characters...');
		return false;
	}
	return true;
}
function renderMatchList() {
	$('.match-list').show();

	$.get(BASE_URL + '/rooms', function(data) {
		if(!data.length) {
			$('.matches-msg').text('NO FUCKING GAMES HERE');
		} else {
			$('.matches-msg').text('');
			$('.room-list').html("");
			$.each(data, function(index, room) {
				renderRoomInList(room);
			});
		}
	});
}

function renderRoomInList(room) {
	var exists = $('.room-list').find('#' + room.name);
	var template = $('<p class="room" id="' + room.name + '">Room name: ' + room.name + '<br>Players: ' + room.players.length + '<br>Room Status: ' + room.status + '</p>');

	if(exists.length) {
		$('.room-list').html(template);
	} else {
		$('.room-list').append(template);

		$('.room').click(function() {
			var clickedRoom = $(this).attr('id');
			$.get(BASE_URL + '/room/' + clickedRoom, function(room) {
				renderRoom(room);
			}) ;
		});
	}
}

function renderRoom(room) {
	var playerNames = [];

	OPEN_ROOM = room.name;

	$('#open-room .room-name').html("<h2>" + room.name + "</h2>");
	$('#open-room .player-list').html('<p>PLAYERZ</p>');

	$.each(room.players, function(index, player) {
		playerNames.push(player.name);
		var readyText = (player.ready) ? ' - FUCKING READY' : '';
		$('#open-room .player-list').append('<p>' + player.name + readyText + '</p>');
	});

	if(playerNames.indexOf(USER) >= 0) {
		$('#open-room .join-room').hide();
		$('#open-room .leave-room').show();
	} else {
		$('#open-room .join-room').show();
		$('#open-room .leave-room').hide();
	}
	if (room.status == "Running") {
		$('.room-controls').hide();
	}else{
		$('.room-controls').show();
	}

	$('#open-room .join-room').unbind('click').click(function() {
		joinRoom(room.name);
	});

	$('#open-room .leave-room').unbind('click').click(function() {
		leaveRoom(room.name);
	});

	$('#open-room .ready-room').unbind('click').click(function() {
		readyRoom(room.name);
	});

	$('#open-room').show();
}

function joinRoom(name) {
	$.post(BASE_URL + '/rooms/join', {user: USER, name: name}, function(room) {
		renderMatchList();
		renderRoom(room);
		
	});
	socket.emit('joinGame', {roomName: name,playerName: USER});
	
}
function rematch(name) {
	$.post(BASE_URL + '/rooms/rematch', {user: USER, name: name}, function(room) {
		renderMatchList();
		renderRoom(room);
		
	});
	socket.emit('rematch', {roomName: name,playerName: USER});
}
function leaveRoom(name) {
	$.post(BASE_URL + '/rooms/leave', {user: USER, name: name}, function(room) {
		renderMatchList();
		renderRoom(room);
		
	});
	socket.emit('leaveGame', {roomName: name,playerName: USER});
	
}

function readyRoom(name) {
	$.post(BASE_URL + '/rooms/ready', {user: USER, name: name}, function(room) {
		renderMatchList();
		renderRoom(room);
	});
}

socket.on('update_room', function(room) {
	if(USER) {
		renderMatchList();
		if (room !== undefined) {
			if(room.name == OPEN_ROOM) {
				renderRoom(room);
			}
		}
	}
});