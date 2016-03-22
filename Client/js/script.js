var BASE_URL = '';
var USER = false;
var ROOMS = [];
var OPEN_ROOM = '';

$(document).ready(function() {
	$('input[name="submit-name"]').click(function() {
		USER = $('input[name="name"]').val();

		$('.name-form').hide();
		renderMatchList();

		return false;
	})

	$('.create-room').click(function() {
		var roomName = $('input[name="room-name"]').val();

		if(roomName != '') {
			$.post(BASE_URL + '/rooms', {user: USER, name: roomName}, function(room) {
				renderRoom(room);
			});
		} else {
			$('.matches-msg').text('YOU DIDNT ENTER A GOD DAMN ROOM NAME WHAT THE FUCK IS WRONG WITH YOU');
		}
		
		

		return false;
	})
})

function renderMatchList() {
	$('.match-list').show();

	$.get(BASE_URL + '/rooms', function(data) {
		if(!data.length) {
			$('.matches-msg').text('NO FUCKING GAMES HERE');
		} else {
			$('.matches-msg').text('');
			$.each(data, function(index, room) {
				renderRoomInList(room);
			})
		}
	});
}

function renderRoomInList(room) {
	var exists = $('.room-list').find('#' + room.name);
	var template = $('<p class="room" id="' + room.name + '">' + room.name + ' - ' + room.players.length + '</p>');

	if(exists.length) {
		exists.html(template);
	} else {
		$('.room-list').append(template);

		template.click(function() {
			$.get(BASE_URL + '/room/' + room.name, function(room) {
				renderRoom(room);
			}) 
		})
	}
}

function renderRoom(room) {
	var playerNames = [];

	OPEN_ROOM = room.name;

	$('#open-room .room-name').text(room.name);
	$('#open-room .player-list').html('');

	$.each(room.players, function(index, player) {
		playerNames.push(player.name);
		var readyText = (player.ready) ? ' - FUCKING READY' : ''
		$('#open-room .player-list').append('<p>' + player.name + readyText + '</p>');
	})

	if(playerNames.indexOf(USER) >= 0) {
		$('#open-room .join-room').hide();
		$('#open-room .leave-room').show();
	} else {
		$('#open-room .join-room').show();
		$('#open-room .leave-room').hide();
	}

	$('#open-room .join-room').unbind('click').click(function() {
		joinRoom(room.name);
	})

	$('#open-room .leave-room').unbind('click').click(function() {
		leaveRoom(room.name);
	})

	$('#open-room .ready-room').unbind('click').click(function() {
		readyRoom(room.name);
	})

	$('#open-room').show();
}

function joinRoom(name) {
	$.post(BASE_URL + '/rooms/join', {user: USER, name: name}, function(room) {
		renderMatchList();
		renderRoom(room);
	});
}

function leaveRoom(name) {
	$.post(BASE_URL + '/rooms/leave', {user: USER, name: name}, function(room) {
		renderMatchList();
		renderRoom(room);
	});
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

		if(room.name == OPEN_ROOM) {
			renderRoom(room);
		}
	}
})