


var prod = function (creatorID, targetPos, currentPlayerPosX, currentPlayerPosY, playerColor){
	this.speed = 1;
	this.creator = creatorID;
	this.x = currentPlayerPosX;
	this.y = currentPlayerPosY;
	this.direction; //TODO
	this.targetPos = targetPos; //x and y clicked on map
	this.width = 30;
	this.height = 30;
	this.color = playerColor;
	this.dmg = 5;
	this.prodId;
	this.knockbackPower = 3;


	this.update = function(){
		this.x += this.speed;
	};
};



module.exports.prod=prod;