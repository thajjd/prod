var Player = function() {
	this.animator = new Animator();

	this.init = function(data) {
		this.animator.setAnimationSet('medivh');
		this.forceNoRender = false;
		this.load(data);
	}
 	
	this.load = function(data) {
		var _this = this;

		Object.keys(data).forEach(function(key) {
			var value = data[key];
			_this[key] = value;
		});
	};

	this.render = function(ctx) {
		if(!this.dead) {
			this.forceNoRender = false;
		}
		if(this.forceNoRender) {
			return;
		}

		this.determineHeading();

		if(this.heading != '') {
			this.animator.playAnimation('walk');
		} else {
			this.animator.playAnimation('idle');
		}

		if(this.dead) {
			var _this = this;

			this.animator.playAnimation('death', function() {
				_this.forceNoRender = true;
			})
		}

		this.animator.render(this, ctx);

		ctx.beginPath();
		ctx.rect( this.x - 27, this.y - 42 , 54, 10 );
		ctx.fillStyle = "#000000";
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.rect( this.x - 25, this.y - 40 , 50 - ((100  - this.hp) /2)  , 6 );
		ctx.fillStyle = "#00F900";
		ctx.fill();
		ctx.closePath();
		
	};

	this.determineHeading = function() {
		var _this = this;

		_this.heading = '';

		if(_this.inputData) {
			Object.keys(_this.inputData).forEach(function(key) {
				if(_this.inputData[key]) {
					_this.heading += key;
				}
			})
		}
	}
};

