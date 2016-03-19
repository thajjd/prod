

var localPlayer = function(){
	this.id;
	this.color;
	this.x;
	this.y;
	this.xvel=0;
  	this.yvel=0;
	this.inputData;
	this.width = 40;
	this.height = 40;


	this.init = function(data){
		this.id = data.player.id;
		this.color = data.player.color;
		this.x = data.player.x;
		this.y = data.player.y;
	};
	this.update = function(data){
		this.x = data.x;
		this.y = data.y;
	};

};

