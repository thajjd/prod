
var helper=require('./helperFunctions.js');

var prod = function (creatorID, targetPos, currentPlayerPosX, currentPlayerPosY, playerColor){
	this.speed = 5;
	this.creator = creatorID;
	this.currentPos= {x:currentPlayerPosX,y:currentPlayerPosY};
	this.targetPos = targetPos; //x and y clicked on map
	this.distance = helper.getDistance(this.targetPos, this.currentPos);
	this.normalized = helper.normalize(this.distance);
	this.width = 30;
	this.height = 30;
	this.color = playerColor;
	this.dmg = 5;
	this.prodId;
	this.knockbackPower = 3;


	this.update = function(deltaTime){
		
		this.currentPos.x += this.normalized.x*deltaTime*this.speed;
		this.currentPos.y += this.normalized.y*deltaTime*this.speed;
	};
};

// function getABSDistance(p1, p2){
// 	return Math.sqrt(Math.pow(Math.abs(p1.x-p2.x),2)+Math.pow(Math.abs(p1.y-p2.y),2));
// }

// function getLength(p){
//   return Math.sqrt(Math.pow(Math.abs(p.x),2)+Math.pow(Math.abs(p.y),2));

// }

// function getDistance(p1, p2){
// 	return {x:p1.x-p2.x,y:p1.y-p2.y};
// }
// function normalize(p){
// 	return {x:p.x/this.getLenght(p),y:p.y/this.getLenght(p)};
// }


module.exports.prod=prod;