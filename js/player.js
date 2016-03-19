var speed = 5;


var player = function (id){
	this.id = id;
	this.color = randomColor();
	this.x = 30;
	this.y = 30;
	this.inputData;
	this.width = 40;
	this.height = 40;


};

function randomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

module.exports.player=player;