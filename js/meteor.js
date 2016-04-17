var now = require("performance-now");
var helper=require('./helperFunctions.js');

var meteor = function (creatorID, creatorName, targetPos, playerColor, timeCreated){

	this.id;
	this.creator = creatorID;
	this.creatorName = creatorName;
	this.radius = 70;
	this.dmg = 20;
	this.delay = 1500;
	this.timeCreated = timeCreated;
	this.triggered = false;
	// targetPos = correctAim(targetPos);
	this.targetPos = {x:targetPos.x,y:targetPos.y}; //x and y clicked on map
	this.color = playerColor;
	this.knockbackPower = 16;
	this.lastTick = timeCreated;

	this.destroythis = false;


	this.update = function(deltaTime){

		this.lastTick = now();
		if (this.timeCreated + this.delay <= now()) {
			this.triggered = true;
			for (var i = games.length - 1; i >= 0; i--) {
				for (var j = games[i].players.length - 1; j >= 0; j--) {
					if (games[i].players[j].id == this.creator) {
						for (var k = games[i].players.length - 1; k >= 0; k--) {

							var target = games[i].players[k];

							if (target.dead === false && target.id !== this.id) {

								var ABSDistance = helper.getABSDistance(target, this.targetPos);
								if(ABSDistance <= this.radius){
									var targetCenter = {x: target.x + (target.width/2), y: target.y +(target.width/2)};
									var thisCenter = {x: this.targetPos.x, y: this.targetPos.y };
									var distance = helper.getDistance(targetCenter, thisCenter);
									var normalized = helper.normalize(distance);
									target.isKnockbacked = true;
									target.currentKnockbackPower = this.knockbackPower;
									target.knockbackDir.x = normalized.x;
									target.knockbackDir.y = normalized.y;
									target.hp -= this.dmg;
									target.lastAttackedBy = this.creatorName;
									console.log(target.name + " was hit by a meteor bror");
									this.destroythis = true;
									if (target.hp <= 0) {
										target.kill();
										for (var l = games[i].players.length - 1; l >= 0; l--) {
											if (games[i].players[l].id == this.creator) {
												games[i].players[l].score += 1;
											}
										}
									}
								}
								

							}
						}
						if (this.destroythis == true) {
							for (var m = games[i].meteors.length - 1; m >= 0; m--) {
								if (games[i].meteors[m].id == this.id) {
									games[i].meteors.splice(m,1);
								}
							}
						}
					}
				}
			}
			for (var i = games.length - 1; i >= 0; i--) {
				for (var j = games[i].players.length - 1; j >= 0; j--) {
					if (games[i].players[j].id == this.creator) {
						for (var k = games[i].meteors.length - 1; k >= 0; k--) {
							if (games[i].meteors[k].id == this.id) {
								games[i].meteors.splice(k, 1);
							}
						}
					}
				}
			}
		}
	};
	function correctAim(targetPos){
		return {x:targetPos.x+(this.width/2),y:targetPos.y+(this.height/2)};
	}
};


module.exports.meteor=meteor;