var speed = 2;

var spawnradius = 150;



var player = function (id, name){
	this.id = id;
	this.width = 20;
	this.height = 20;
	this.color = randomColor();

	var spawnx = Math.random() * 2 * spawnradius - spawnradius;
	var ylim = Math.sqrt(spawnradius * spawnradius - spawnx * spawnx);
	var spawny = Math.random() * 2 * ylim - ylim;

	// Offset so that the circle is all on the screen   
	spawnx += 400;
	spawny += 400;
	this.x = spawnx;
	this.y = spawny;
	this.name = name;

	this.hp=100;
	this.prodCooldown = 1000;
	this.acceleration = 1;
	this.xvel=0;
  	this.yvel=0;
	this.inputData={left:false,up:false,right:false,down:false};
	

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