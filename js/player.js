var now = require("performance-now");

var speed = 2;
var spawnradius = 250;

var player = function (id, name){
	this.id = id;
	this.width = 20;
	this.height = 20;
	this.hp=100;
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
	this.currentGame;
	this.dead = false;

	//scores
	this.score = 0;
	this.kills = 0;
	this.lastAttackedBy = "";

	//SPELLS
	//prod
	this.prodCooldown = 2000;
	this.lastCastProd = this.prodCooldown;

	//blink
	this.blinkCooldown = 5000;
	this.lastCastBlink = this.blinkCooldown;
	this.blinkRange = 200;

	//Melee
	this.meleeCooldown = 3000;
	this.lastCastMelee = this.meleeCooldown;
	
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
			for (var i = game.players.length - 1; i >= 0; i--) {
				//TODO VAD HÄNDER OM SPELARE ÄR TILLRÄCKLIGT NÄRA??
			}

			this.lastCastMelee = now();
			console.log("Melee bror");
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