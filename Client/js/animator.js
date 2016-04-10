var Animator = function() {

	this.setAnimationSet = function(name) {
		this.frame = 0;
		this.lastFrameRendered = 0;
		this.currentCycle = 0;
		this.heading = '';
		this.animationSet = ANIMATION_SETS[name];
	};

	this.playAnimation = function(name, callback) {
		this.currentAnimation = name;
		this.currentAnimationCallback = callback;
	};

	this.render = function(object, ctx){
		this.frame++;

		if(this.currentAnimation) {
			var animation = this.animationSet[this.currentAnimation];
			ctx.save();

			if(this.frame >= (this.lastFrameRendered + animation.delay)) {
				this.lastFrameRendered = this.frame;
				this.currentCycle++;
			}

			if(this.currentCycle > animation.frames) {
				this.currentCycle = 0;

				if(this.currentAnimationCallback) {
					this.currentAnimationCallback();
				}
			}

			if(animation.directional) {
				this.adjustToHeading(object, animation, ctx);
			}
			
			ctx.drawImage(
				animation.spriteSheet, 
				(this.currentCycle * animation.frameSpacing) - animation.offset.x, 
				animation.offset.y,
				animation.frameWidth,
				animation.frameHeight,
				(animation.directional) ? animation.frameWidth / -2 : object.x,
				(animation.directional) ? animation.frameHeight / -2 : object.y,
				animation.frameWidth,
				animation.frameHeight
			);

			ctx.restore();
		}
	};

	this.adjustToHeading = function(object, animation, ctx) {
		if(object.heading != this.heading && object.heading != '') {
			this.heading = object.heading;
		}

		ctx.translate(object.x, object.y);

		if(this.heading == 'up') {
			ctx.rotate(180 * (Math.PI / 180));
		}

		if(this.heading == 'leftup') {
			ctx.rotate(135 * (Math.PI / 180));
		}

		if(this.heading == 'upright') {
			ctx.rotate(225 * (Math.PI / 180));
		}

		if(this.heading == 'left') {
			ctx.rotate(90 * (Math.PI / 180));
		}

		if(this.heading == 'leftdown') {
			ctx.rotate(45 * (Math.PI / 180));
		}

		if(this.heading == 'rightdown') {
			ctx.rotate(315 * (Math.PI / 180));
		}

		if(this.heading == 'right') {
			ctx.rotate(270 * (Math.PI / 180));
		}
	};
};

