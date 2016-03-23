
var helper=require('./helperFunctions.js');

var prod = function (creatorID, targetPos, currentPlayerPosX, currentPlayerPosY, playerColor){

	
	this.speed = 5;
	this.creator = creatorID;
	this.width = 15;
	this.height = 15;
	// targetPos = correctAim(targetPos);
	this.currentPos= {x:currentPlayerPosX-(this.width/2),y:currentPlayerPosY-(this.width/2)};
	this.targetPos = {x:targetPos.x-(this.width/2),y:targetPos.y-(this.height/2)}; //x and y clicked on map
	this.distance = helper.getDistance(this.targetPos, this.currentPos);
	this.normalized = helper.normalize(this.distance);
	
	this.color = playerColor;
	this.dmg = 5;
	this.prodId;
	this.knockbackPower = 3;


	this.update = function(deltaTime){
		
		this.currentPos.x += this.normalized.x*deltaTime*this.speed;
		this.currentPos.y += this.normalized.y*deltaTime*this.speed;
	};
	function correctAim(targetPos){
		return {x:targetPos.x+(this.width/2),y:targetPos.y+(this.height/2)};
	}
};


module.exports.prod=prod;