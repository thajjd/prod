var speed = 2;


var player = function (id, name){
	this.id = id;
	this.color = randomColor();
	this.x = 30;
	this.y = 30;
	this.name = name;

	this.hp=100;
	this.prodCooldown = 1000;
	this.acceleration = 1;
	this.xvel=0;
  	this.yvel=0;
	this.inputData={left:false,up:false,right:false,down:false};
	this.width = 40;
	this.height = 40;

	this.update = function(deltaTime){
		//TODO VELOCITY MOVEMENT
		// if (Math.abs(this.xvel)>=groundSlow*multiplicator){
		// 	this.xvel-=(this.xvel/Math.abs(this.xvel)*groundSlow*multiplicator);

		// }else{
		//     this.xvel=0;

		// }

		// if (this.inputData.left&&this.xvel>-this.maxXspeed)this.xvel-=(this.acceleration*deltaTime);
  // 		if (this.inputData.right&&this.xvel<this.maxXspeed)this.xvel+=(this.acceleration*deltaTime);

		if (this.inputData.left === true) {
			this.x -= speed * deltaTime; 
		}
		if (this.inputData.right === true) {
			this.x += speed * deltaTime;
		}
		if (this.inputData.up === true) {
			this.y -= speed * deltaTime;
		}
		if (this.inputData.down === true) {
			this.y += speed * deltaTime;
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