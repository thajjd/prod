var speed = 3;


var player = function (id){
	this.id = id;
	this.color = randomColor();
	this.x = 30;
	this.y = 30;
	this.xvel=0;
  	this.yvel=0;
	this.inputData={left:false,up:false,right:false,down:false};
	this.width = 40;
	this.height = 40;

	this.update = function(){
		if (this.inputData.left === true) {
			this.x -= speed; 
		}
		if (this.inputData.right === true) {
			this.x += speed;
		}
		if (this.inputData.up === true) {
			this.y -= speed;
		}
		if (this.inputData.down === true) {
			this.y += speed;
		}
	};


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