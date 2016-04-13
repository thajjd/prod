var now = require("performance-now");
var helper=require('./helperFunctions.js');

var meteor = function (creatorID, creatorName, targetPos, playerColor, timeCreated){

	this.creator = creatorID;
	this.creatorName = creatorName;
	this.radius = 50
	this.dmg = 20;
	this.delay = 1500;
	this.timeCreated = timeCreated;
	this.triggered = false;
	// targetPos = correctAim(targetPos);
	this.targetPos = {x:targetPos.x,y:targetPos.y}; //x and y clicked on map
	this.color = playerColor;
	this.knockbackPower = 16;
	this.lastTick = timeCreated;


	this.update = function(deltaTime){
		this.lastTick = now();
		if (this.timeCreated + this.delay >= now()) {
			this.triggered = true;
		}
	};
	function correctAim(targetPos){
		return {x:targetPos.x+(this.width/2),y:targetPos.y+(this.height/2)};
	}
};


module.exports.meteor=meteor;