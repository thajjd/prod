var helper=require('./helperFunctions.js');
var now = require("performance-now");


var game = function (io, roomData, id){
	this.gameID = id;
	this.arenaRadius = 400;
	this.arenaPos= {x: 400, y: 400};
	this.players = [];
	this.prods = [];
	this.spawns = {};
	this.io = io;
	this.gameName = roomData.name;
	this.deathCount = 0;
	this.lavaTickdmg = 0.4;
	this.arenaDecrease = 0.2;

	this.physicsLoopIntervall = 1000/66;
	this.serverUpdateLoopIntervall = 1000/22;
	this.newTime;
	this.oldTime;
	this.lastFrameTime;
	this.fpsTime = 0;
	this.fpsTick = 0;
	this.optimalFramerate = 1000/60;
	this.thePhysicsInterval;
	this.theServerInterval;


	this.start = function(){
		//Bind the game instance to the intervall, thus giving the game it's own loop and clock
		this.thePhysicsInterval = setInterval(this.physicsLoop.bind(this), this.physicsLoopIntervall);
		this.theServerInterval = setInterval(this.serverUpdateLoop.bind(this), this.serverUpdateLoopIntervall);

	};

	this.physicsLoop = function(){

		if (this.deathCount >= this.players.length - 1) {
			// io.to(this.gameName).emit('gameOver', this.gameName);
			this.rematch();
		}


		this.newTime = now();
		this.lastFrameTime = isNaN(this.newTime-this.oldTime)?0:this.newTime-this.oldTime;
		this.oldTime=this.newTime;
		var deltaTime= isNaN(this.lastFrameTime/this.optimalFramerate)?1: this.lastFrameTime/this.optimalFramerate;

		this.fpsTime+=this.lastFrameTime;
		this.fpsTick++;



		//Decrease size of arena 
		if (this.arenaRadius >= 100) {
			this.arenaRadius -= this.arenaDecrease * deltaTime;
		}
		

		if ( typeof this.players !== undefined) {
			for (var i = this.players.length - 1; i >= 0; i--) {
				this.players[i].update(deltaTime);
				//Check if player is outside arena
				var a = this.arenaPos;
				var b = this.players[i];
				//d=distance,c=collision
				var distance = helper.getABSDistance(a, b);

						if(this.fpsTime>1000){
							console.log(distance);
							console.log(this.arenaRadius);
							this.fpsTick=0;
							this.fpsTime=0;
						}
				

				if (distance > this.arenaRadius + b.width) {
					b.hp -= this.lavaTickdmg;
				}
				// var dx = a.x - b.x;
				// var dy = a.y - b.y;
				// var d2 = dx * dx + dy * dy;
				// if(d2 <= ((this.arenaRadius + b.width) * (this.arenaRadius + b.width))){
					
					
				// }else{
					
				// }
				if (b.hp <= 0) {
					io.to(roomData.name).emit('playerDeath', this.players[i].name + " bit the dust, fucking noob...");	
					this.players.splice(i, 1);
					this.deathCount ++;
				}

			}
		}
		if (this.prods !== undefined) {

			
			if (typeof this.prods !== undefined && this.prods.length > 0) {
				for (var i = this.prods.length - 1; i >= 0; i--) {
					if (this.prods[i] !== undefined) {
						this.prods[i].update(deltaTime);
					}
					

					
						
					//Dig a prod collide with a prod?
					for (var j = this.prods.length - 1; j >= 0; j--) {
						var a = this.prods[i];
						var b = this.prods[j];
						if (this.prods[j] !== undefined) {
							if(i != j && a.creator != b.creator){
								//d=distance,c=collision
								var dx = a.currentPos.x - b.currentPos.x;
								var dy = a.currentPos.y - b.currentPos.y;
								var d2 = dx * dx + dy * dy;
								if(d2 <= ((a.width + b.width) * (a.width + b.width))){
									// Want shit to bounce of eachother, this is it!
									// var dotProduct = dx * (b.normalized.x - a.normalized.x) + dy * (b.normalized.y - a.normalized.y);
									
									
									// if(dotProduct > 0){
									// 	var cScale = dotProduct / d2;
									// 	var cX = dx * cScale;
									// 	var cY = dy * cScale;
									// 	var massTotal = a.width + b.width;
									// 	var cWeightA = 2 * b.width / massTotal;
									// 	var cWeightB = 2 * a.width / massTotal;
									// 	a.normalized.x += (cWeightA * cX);
									// 	a.normalized.y += (cWeightA * cY);
									// 	b.normalized.x -= (cWeightB * cX);
									// 	b.normalized.y -= (cWeightB * cY);
									// }

									console.log("prod - prod collision");
									this.prods.splice(i, 1);
									this.prods.splice(j, 1);
								}
							}
						}
						
					}

					for (var j = this.players.length - 1; j >= 0; j--) {
						if (this.prods[i] !== undefined) {
							var a = this.prods[i];
							var b = this.players[j];
							if (a.creator !== undefined) {
								if(a.creator != b.id){
									//d=distance,c=collision
									var dx = a.currentPos.x - b.x;
									var dy = a.currentPos.y - b.y;
									var d2 = dx * dx + dy * dy;
									if(d2 <= ((a.width + b.width) * (a.width + b.width))){
										var avatarCenter = {x: b.x + (b.width/2), y: b.y +(b.width/2)};
										var prodCenter = {x: a.currentPos.x + (a.width/2), y: a.currentPos.y + (a.width/2)};
										var distance = helper.getDistance(avatarCenter, prodCenter);
										var normalized = helper.normalize(distance);
										b.currentKnockbackPower = a.knockbackPower;
										b.knockbackDir.x += normalized.x;
										b.knockbackDir.y += normalized.y;
										b.isKnockbacked = true;
											
										// }

										console.log("Player - prod collision");
										this.prods.splice(i, 1);
										b.hp -= a.dmg;
										if (b.hp <= 0) {
											io.to(roomData.name).emit('playerDeath', this.players[j].name + " bit the dust, fucking noob...");	
											this.players.splice(j, 1);
											this.deathCount ++;
										}

									}

								}

							}
							
						}
						
					}
					


					//Check if TTL has passed
					if (this.prods[i] !== undefined) {
						if (now() - this.prods[i].timeCreated > this.prods[i].ttl) {
						
							console.log('prod created: ' + this.prods[i].timeCreated);
							console.log('prod destroyed: ' + now());
							this.prods.splice(i, 1);
						}
						
					}
					
				}
			}
		}
		

		
	};

	this.serverUpdateLoop = function(){
		io.to(this.gameName).emit('update', {players:this.players, prods:this.prods, arenaRadius: this.arenaRadius, arenaPos: this.arenaPos});

	};
	this.rematch = function(){
		this.prods = [];
		this.deathCount = 0;
		this.arenaRadius = 400;

		for (var i = this.players.length - 1; i >= 0; i--) {
			this.players[i].hp = 100;
		}
		clearInterval(this.thePhysicsInterval);
		clearInterval(this.theServerInterval);
		this.start(this);
	};


};

module.exports.game=game;