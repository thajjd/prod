
var helper=require('./helperFunctions.js');

var meteor = function (creatorID, creatorName, targetPos, playerColor, timeCreated){

	this.creator = creatorID;
	this.creatorName = creatorName;
	this.radius = 50
	this.dmg = 20;
	this.delay = 1500;
	this.timeCreated = timeCreated;
	// targetPos = correctAim(targetPos);
	this.targetPos = {x:targetPos.x,y:targetPos.y}; //x and y clicked on map
	this.color = playerColor;
	
	this.meteorId;
	this.knockbackPower = 16;


	this.update = function(deltaTime){
		if (true) {}
	};
	function correctAim(targetPos){
		return {x:targetPos.x+(this.width/2),y:targetPos.y+(this.height/2)};
	}
};


module.exports.meteor=meteor;