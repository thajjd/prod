var now = require("performance-now");
var helper=require('./helperFunctions.js');
var meteor=require('./meteor.js').meteor;
var speed = 2;
var spawnradius = 250;

var player = function (id, name){
	this.id = id;
	this.width = 20;
	this.height = 20;
	this.hp=100;
	this.color = randomColor();

	
	this.x = 0;
	this.y = 0;
	this.name = name;
	this.currentGame;
	this.dead = false;
	this.isCasting = false;

	//scores
	this.score = 0;
	this.kills = 0;
	this.lastAttackedBy = "";

	//SPELLS

	
	//prod
	this.prodCooldown = 2000;
	this.lastCastProd = this.prodCooldown;

	//meteor
	this.meteorCooldown = 10000;
	this.lastCastMeteor = this.meteorCooldown;
	this.startCastingMeteor;
	this.meteorCastTime = 1000;
	this.meteorRange;

	//blink
	this.blinkCooldown = 5000;
	this.lastCastBlink = this.blinkCooldown;
	this.blinkRange = 200;

	//Melee
	this.meleeCooldown = 5000;
	this.lastCastMelee = this.meleeCooldown;
	this.startCastingMelee;
	this.meleeCastTime = 1000;
	this.meleeDmg = 10;
	this.meleeRange = 80;
	this.meleeKnockbackPower = 10;
	
	this.currentGame;
	this.acceleration = 1;
	this.knockbackDir = {x: 0, y: 0};
	this.originalKnockbackDir;
	this.isKnockbacked = false;
	this.currentKnockbackPower;
	this.knockbackRecovery = 0.5;
	this.inputData={left:false,up:false,right:false,down:false};
	

	this.update = function(deltaTime){

		if (this.dead === false) {
			//Spelarna kan inte åka utanför world walls
			if (this.x + this.width >= 1000) {
				this.inputData.right = false;
				this.x = 1000 - this.width;
			}
			if (this.x - this.width <= 0) {
				this.inputData.left = false;
				this.x = 0 + this.width;
			}
			if (this.y + this.width >= 800) {
				this.inputData.down = false;
				this.y = 800 - this.width;
			}
			if (this.y - this.width <= 0) {
				this.inputData.up = false;
				this.y = 0 + this.width;
			}

			//TODO CASTING TIME
			// if (this.isCasting) {
			// 	if (true) {}
			// }
			//Öhh ah, input
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

			//Men du vet, knockback
			if (this.isKnockbacked == true) {
	  			this.y += (this.knockbackDir.y * this.currentKnockbackPower ) * deltaTime;
	  			this.x += (this.knockbackDir.x * this.currentKnockbackPower ) * deltaTime;
	  			this.currentKnockbackPower -= this.knockbackRecovery * deltaTime;

	  			if (this.currentKnockbackPower <= 1) {
	  				this.isKnockbacked = false;
	  				this.knockbackDir.x = 0;
	  				this.knockbackDir.y = 0;
	  			}
	  		}

		}

		
		
	};

	this.kill = function(){
		this.dead = true;
		console.log(this.name + " died.");
	};
	this.castBlink = function(mousePosData){
		if (now() - this.lastCastBlink >= this.blinkCooldown && this.dead === false) {
			this.x = mousePosData.x;
			this.y = mousePosData.y;
			this.lastCastBlink = now();
			console.log("blink bror");
			return true;
  		}
  		return false;
	};
	this.castMelee = function(game){
		if (now() - this.lastCastMelee >= this.meleeCooldown && this.dead === false) {
			//Stand still while casting
			this.isCasting = true;
			this.startCastingMelee = now();

			for (var i = game.players.length - 1; i >= 0; i--) {

				var target = game.players[i];

				if (target.dead === false && target.id !== this.id) {

					var ABSDistance = helper.getABSDistance(target, this);
					// var dx = this.x - target.x;
					// var dy = this.y - target.y;
					// var d2 = dx * dx + dy * dy;
					if(ABSDistance <= this.meleeRange){
						var targetCenter = {x: target.x + (target.width/2), y: target.y +(target.width/2)};
						var thisCenter = {x: this.x + (this.width/2), y: this.y + (this.width/2)};
						var distance = helper.getDistance(targetCenter, thisCenter);
						var normalized = helper.normalize(distance);
						target.isKnockbacked = true;
						target.currentKnockbackPower = this.meleeKnockbackPower;
						target.knockbackDir.x += normalized.x;
						target.knockbackDir.y += normalized.y;
						target.hp -= this.meleeDmg;
						target.lastAttackedBy = this.name;

						if (target.hp <= 0) {
							target.kill();
							this.score += 1;
						}
					}
					

				}
			}

			this.lastCastMelee = now();
			console.log("Melee bror");
			return true;
  		}
  		return false;
	};

	this.castMeteor = function(thisplr, game, mousePosData){
		console.log('körs');
		if (now() - this.lastCastMeteor >= this.meteorCooldown && this.dead === false) {
			//Stand still while casting
			this.isCasting = true;
			this.startCastingMeteor = now();
			var meteor = new meteor(thisplr.id, thisplr.name, mousePosData, thisplr.color, now());
			game.meteors.push(meteor);

			this.lastCastMeteor = now();
			console.log("Meteor bror");
			return true;
  		}
  		return false;
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