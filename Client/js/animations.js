var ANIMATION_SETS = {
	'medivh': getAnimSetMedivh()
}

function getAnimSetMedivh() {
	var set = {}

	var spriteSheetWalk = new Image();
	spriteSheetWalk.src = '/grafx/anim_medivh_walk.png';
    
	set.walk = {
		'spriteSheet'		: spriteSheetWalk,
		'frames' 			: 53,
		'frameWidth'		: 55,
		'frameHeight'		: 55,
		'frameSpacing'		: 100,
		'offset'			: {x: -20, y: 20},
		'directional'		: true,
		'delay' 			: 0,
	}
	
	var spriteSheetIdle = new Image();
	spriteSheetIdle.src = '/grafx/anim_medivh_idle.png';
    
	set.idle = {
		'spriteSheet'		: spriteSheetIdle,
		'frames' 			: 70,
		'frameWidth'		: 55,
		'frameHeight'		: 55,
		'frameSpacing'		: 100,
		'offset'			: {x: -20, y: 20},
		'directional'		: true,
		'delay' 			: 0,
	}

	var spriteSheetAttack = new Image();
	spriteSheetAttack.src = '/grafx/anim_medivh_attack.png';
    
	set.attack = {
		'spriteSheet'		: spriteSheetAttack,
		'frames' 			: 65,
		'frameWidth'		: 70,
		'frameHeight'		: 55,
		'frameSpacing'		: 100,
		'offset'			: {x: -10, y: 30},
		'directional'		: true,
		'delay' 			: 0,
	}

	var spriteSheetDeath = new Image();
	spriteSheetDeath.src = '/grafx/anim_medivh_death.png';
    
	set.death = {
		'spriteSheet'		: spriteSheetDeath,
		'frames' 			: 100,
		'frameWidth'		: 70,
		'frameHeight'		: 55,
		'frameSpacing'		: 100,
		'offset'			: {x: -10, y: 30},
		'directional'		: true,
		'delay' 			: 0,
	}

	return set;
}