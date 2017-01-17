
/*====================================================
=            ANIMACIONES Y EVENT HANDLERS            =
====================================================*/

function animate(func) {
	var last;
	requestAnimationFrame(init);
	
	function init(time) {
		last = time;
		requestAnimationFrame(frame);
	}
	
	function frame(time) {
		var frame_time = time - last;
		last = time;
		if(func(frame_time) !== false) {
			requestAnimationFrame(frame);
		}
	}
}

var mouse = {x: 0, y: 0},
	click = false,
	escape = false;

function trigger_events(listeners) {
	var i = 0, len = listeners.length;
	
	for(i = 0; i < len; i++) {
		with(listeners[i]) {
			if(mouse.x > x && mouse.y > y && mouse.x < x + w && mouse.y < y + h) {
				
				if(!hovered) {
					hovered = true;
					onhover && onhover();
				}
				
				if(click) {
					click = false;
					onclick && onclick();
				}
				
			} else if(hovered) {
				hovered = false;
				onblur && onblur();
			}
		}
	}
}

window.onmousemove = function(event) {
	var rect = background_canvas.getBoundingClientRect();
	mouse.x = (event.clientX - rect.left) / scale;
	mouse.y = (event.clientY - rect.top) / scale;
};

window.onmousedown = function() {
	click = true;
};

window.onkeydown = function(event) {
	if(event.keyCode === 13) {
		escape = true;
	}
};

/*=====  End of ANIMACIONES Y EVENT HANDLERS  ======*/


/*============================================
=            CANVAS, MAPA Y FONDO            =
============================================*/

var background_canvas = document.querySelector("#background"),
	foreground_canvas = document.querySelector("#foreground"),
	fx_canvas = document.querySelector("#fx");

var background = background_canvas.getContext("2d"),
	foreground = foreground_canvas.getContext("2d"),
	fx = fx_canvas.getContext("2d");

var scale = 32;

var map_plan = ["^^^^^^^^^^^----",
				"           ----",
				"####  #### ----",
				"   ####  # ----",
				"         # ----",
				"   ####  # ----",
				" ###  #### ----",
				" #         ....",
				" ###  #### c...",
				"   ####  # ....",
				"         ##....",
				"           ....",
				"vvvvvvvvvvvvvvv"],
	map_width = map_plan[0].length,
	map_height = map_plan.length,
	path = [[-1,2],[3,2],[3,3],[6,3],[6,2],[9,2],[9,6],
			[6,6],[6,5],[3,5],[3,6],[1,6],[1,8],[3,8],
			[3,9],[6,9],[6,8],[9,8],[9,10],[10,10]];

background_canvas.width = foreground_canvas.width = fx_canvas.width = map_width * scale;
background_canvas.height = foreground_canvas.height = fx_canvas.height = map_height * scale;

var tileset = document.createElement("img");
tileset.onload = draw_background;
tileset.src = "tileset.png";
tileset.onerror = function() { alert("Error loading image. Reload the page."); };
if(tileset.complete) { draw_background(); }

function draw_background() {
	var castle;
	
	map_plan.forEach(function(line, y) {
		line.split("").forEach(function(block, x) {
			if("^vc. ".indexOf(block) > -1) {
				tile(background, [0,0], [x,y]);
			}
			
			if(block === "#") {
				tile(background, [1,0], [x,y]);
			} else if(block === "^") {
				tile(background, [10, 4], [x, y]);
			} else if(block === "v") {
				tile(background, [10, 3], [x, y]);
			} else if(block === "c") {
				castle = [x, y];
			} else if(block === "-") {
				rect(background, [x, y], 1, 1, "white");
			}
		});
	});
	//El castillo tiene que dibujarse después para no ser tapado por el pasto
	tile(background, [0, 1], castle, 4, 4);
}

/*----------  Ayudantes para dibujar en los canvas  ----------*/

function tile(cx, orig, dest, width, height) {
	width = (width||1) * scale;
	height = (height||1) * scale;
	
	cx.drawImage(tileset,
	             orig[0] * scale, orig[1] * scale,
	             width, height,
	             dest[0] * scale, dest[1] * scale,
	             width, height);
}

function icon(cx, offset, dest) {
	//iconsize: 8
	cx.drawImage(tileset,
	             7 * scale + offset[0] * 8, scale + offset[1] * 8,
	             8, 8,
	             dest[0] * scale, dest[1] * scale,
	             8, 8);
}

function text(cx, string, dest, color, font) {
	if(color) cx.fillStyle = color;
	if(font) cx.font = font + "px 'Roboto Mono', monospace";
	cx.fillText(string, dest[0] * scale, dest[1] * scale);
}

function icon_text(cx, icon_offset, string, dest, color, font) {
	icon(cx, icon_offset, dest);
	dest[0] += .25;
	text(cx, string, dest, color, font);
}

function clear(cx) {
	cx.clearRect(0, 0, map_width * scale, map_height * scale);
}

function rect(cx, dest, width, height, color) {
	if(color) cx.fillStyle = color;
	cx.fillRect(dest[0] * scale, dest[1] * scale, width * scale, height * scale);
}

function round_rect(cx, dest, width, height, round, color) {
	if(color) cx.fillStyle = color;
	var x = dest[0] * scale,
		y = dest[1] * scale,
		line_w = width * scale - round,
		line_h = height * scale - round;
	width = width * scale;
	height = height * scale;
	
	cx.beginPath();
	cx.moveTo(x + round, y);
	cx.lineTo(x + line_w, y);
	cx.quadraticCurveTo(x + width, y, x + width, y + round);
	cx.lineTo(x + width, y + line_h);
	cx.quadraticCurveTo(x + width, y + height, x + line_w, y + height);
	cx.lineTo(x + round, y + height);
	cx.quadraticCurveTo(x, y + height, x, y + line_h);
	cx.lineTo(x, y + round);
	cx.quadraticCurveTo(x, y, x + round, y);
	cx.fill();
}

function text_width(cx, text, font) {
	if(font) cx.font = font + "px 'Roboto Mono', monospace";
	return cx.measureText(text).width / scale;
}

function line(cx, start, end, color, line) {
	if(color) cx.strokeStyle = color;
	if(line) cx.lineWidth = line;
	cx.beginPath();
	cx.moveTo(start[0] * scale, start[1] * scale);
	cx.lineTo(end[0] * scale, end[1] * scale);
	cx.stroke();
}

function arrow(cx, direction, dest, size, color, line) {
	if(color) cx.strokeStyle = color;
	if(line) cx.lineWidth = line;
	
	//direction is 1 or -1
	var x_point = dest[0] * scale + (direction === 1 ? size : 0),
		x_back = dest[0] * scale + (direction === 1 ? 0 : size),
		x_middle = dest[0] * scale + size / 2,
		y_middle = dest[1] * scale + size / 2;
	
	cx.beginPath();
	cx.moveTo(x_point, y_middle);
	cx.lineTo(x_back, y_middle);
	
	cx.moveTo(x_middle, dest[1] * scale);
	cx.lineTo(x_point, y_middle);
	cx.lineTo(x_middle , dest[1] * scale + size);
	cx.stroke();
}

/*=====  End of CANVAS, MAPA Y FONDO  ======*/


/*====================================================
=            ESTADO Y VARIABLES DE ESTADO            =
====================================================*/

var state,
	menu, 			//state = 0
	instructions,	//state = 1
	game, toolbar;	//state = 2

/*=====  End of ESTADO Y VARIABLES DE ESTADO  ======*/


/*======================================
=            MENÚ PRINCIPAL            =
======================================*/

menu = { listeners: [] };

menu.load = function() {
	state = 0;
	clear(foreground);
	clear(fx);
	rect(foreground, [1.5, 2.5], 8, 5, "white");
	foreground.textAlign = "left";
	foreground.textBaseline = "top";
	text(foreground, "ElementTD", [2, 3], "black", "bold 20");
	line(foreground, [2, 3.75], [3, 3.75], "red", 2);
	line(foreground, [3, 3.75], [6, 3.75], "#00ff00");
	line(foreground, [6, 3.75], [9, 3.75], "#0000ff");
	
	//trigger all onblur events to draw all texts
	menu.listeners.forEach(function(listener) {
		listener.hovered = true;
	});
	
	dot_marker(game.difficulty);
};

menu.frame = function() {
	trigger_events(menu.listeners);	
};

function embolden_text(string, position, height, onclick) {
	return {
		x: position[0], y: position[1],
		w: text_width(foreground, string, height), h: height / scale,
		
		hovered: true, //trigger onblur event to draw text
		
		onhover: function() {
			rect(foreground, [this.x, this.y], this.w, this.h, "white");
			text(foreground, string, [this.x, this.y], "black", "bold " + height);
		},
		onblur: function() {
			rect(foreground, [this.x, this.y], this.w, this.h, "white");
			text(foreground, string, [this.x, this.y], "black", height);
		},
		onclick: onclick
	};
}

function dot_marker(difficulty) {
	rect(foreground, [2, 5.75], 1, 1.5, "white");
	rect(foreground, [3 - .2, 5.75 + .5 * difficulty + .1], .1, .1, "black");
}

menu.listeners.push(
	embolden_text("Instructions", [2, 4.25], 14, function() {
		instructions.load();
	}),
	embolden_text("Play", [2, 5], 14, function() {
		game.load();
	}),
	embolden_text("Easy", [3, 5.75], 12, function() {
		dot_marker(0);
		game.difficulty = 0;
	}),
	embolden_text("Medium", [3, 6.25], 12, function() {
		dot_marker(1);
		game.difficulty = 1;
	}),
	embolden_text("Hard", [3, 6.75], 12, function() {
		dot_marker(2);
		game.difficulty = 2;
	})
);

/*=====  End of MENÚ PRINCIPAL  ======*/


/*=================================================
=            PANTALLA DE INSTRUCCIONES            =
=================================================*/

instructions = { listeners: [] };

instructions.load = function() {
	state = 1;
	clear(foreground);
	clear(fx);
	rect(foreground, [1.5, 2.5], 8, 7.1, "white");
	foreground.textAlign = "left";
	foreground.textBaseline = "top";
	//arrow(foreground, -1, [2.15, 3.05], 16, "black", 2);
	text(foreground, "Instructions", [3, 3], "black", "bold 20");
	line(foreground, [2, 3.75], [3, 3.75], "red");
	line(foreground, [3, 3.75], [6, 3.75], "#00ff00");
	line(foreground, [6, 3.75], [9, 3.75], "#0000ff");
	text(foreground, "1. Buy towers to defend the cas_", [2, 4.25], undefined, 12);
	text(foreground, "tle from your enemies.", [2, 4.75]);
	text(foreground, "2. Upgrade a tower to fire ele_", [2, 5.5]);
	text(foreground, "ment in order to defeat fire ene_", [2, 6]);
	text(foreground, "mies, etc.", [2, 6.5]);
	text(foreground, "3. The order matters! A fire-neu_", [2, 7.25]);
	text(foreground, "tral enemy is not the same as a", [2, 7.75]);
	text(foreground, "neutral-fire enemy. Watch the ", [2, 8.25]);
	text(foreground, "placement of your towers!", [2, 8.75]);
};

instructions.frame = function() {
	trigger_events(instructions.listeners);
};

function navigation_arrow(direction, position, width, onclick) {
	return {
		//BACK TO MENU ARROW
		x: position[0], y: position[1], w: width / scale, h: width / scale,
		hovered: true, //we want to trigger the onblur event to draw it
		
		onhover: function() {
			foreground.beginPath();
			foreground.arc((this.x + this.w / 2) * scale, (this.y + this.h / 2) * scale,
			               this.w * scale / 1.8, 0, 6.28);
			foreground.fillStyle = "#BDBDFF";
			foreground.fill();
			arrow(foreground, direction, [this.x, this.y], this.w * scale, "black", 2);
		},
		onblur: function() {
			rect(foreground, [this.x - 0.1, this.y - 0.1], this.w + 0.2, this.h + 0.2, "white");
			arrow(foreground, direction, [this.x, this.y], this.w * scale, "black", 2);
		},
		onclick: onclick
	};
}

instructions.listeners.push(navigation_arrow(-1, [2.15, 3.05], 16, menu.load));

/*=====  End of PANTALLA DE INSTRUCCIONES  ======*/

/*===============================
=            INICIAR            =
===============================*/

window.onload = function() {
	
	function start() {
		menu.load();
		
		animate(function(time) {
			
			if(state === 0) {
				menu.frame(time);
			} else if(state === 1) {
				instructions.frame(time);
			} else if(state === 2) {
				game.frame(time);
				toolbar.frame(time);
			}
			
			click = escape = false;
		});
	}
	
	if(window.Promise && document.fonts) {
		Promise.all([
			document.fonts.load("20px 'Roboto mono'"),
			document.fonts.load("bold 20px 'Roboto mono'"),
			document.fonts.load("italic 20px 'Roboto mono'"),
			document.fonts.load("bold italic 20px 'Roboto mono'")
		]).then(start).catch(alert);
	} else {
		setTimeout(function() {
			alert("It is possible that your browser hasn't loaded the game fonts correctly.\n"+
			      "If so, try reloading the page or switch to a different browser.");
			start();
		}, 7000);
	}
};

/*=====  End of INICIAR  ======*/


/*===============================================
=            JUEGO PROPIAMENTE DICHO            =
===============================================*/

game = {
	difficulty: 0,
	gold_multiplier: 0,
	time: 0,
	level: undefined,
	level_number: 0,
	gold: 0,
	lives: 0,
	towers: [],
	enemies: [],
	explosions: [],
	floating_texts: [],
	beams: [], //proyectiles from towers
	speed: 0,
	state: 0,
	selected_tower: undefined
};

game.load = function() {
	state = 2;
	clear(foreground);
	clear(fx);
	//(Re)set game defaults
	with(game) {
		gold_multiplier = 2 - difficulty * 0.5;
		time = 0;
		level = levels[0];
		level_number = 0;
		gold = 30;
		lives = 10 - difficulty * 5;
		towers = [];
		enemies = [];
		explosions = [];
		floating_texts = [];
		beams = [];
		speed = 1;
		state = 0;
		selected_tower = undefined;
		
		for(var y = 0; y < map_height; y++) {
			towers.push([]);
			for(var x = 0; x < map_width; x++) {
				if(map_plan[y][x] === " ") {
					towers[y][x] = undefined;
				} else {
					towers[y][x] = false; //terrain not available for tower
				}
			}
		}
	}
	
	
	toolbar.load();
};

game.frame = function(frame_time) {
	game.time += frame_time * game.speed;
	
	game.animate(game, frame_time);
	game.render(game, frame_time);
};

game.animate = function(game, frame_time) {
	
};

game.render = function(game, frame_time) {
		//we do not clear the toolbar
	foreground.clearRect(0, 0, 11 * scale, map_height * scale);
	clear(fx);
	
	var y, x, tower;
	for(y = 0; y < map_height; y++) {
		for(x = 0; x < map_width; x++) {
			if((tower = game.towers[y][x])) {
				tile(foreground, [4 + tower.index, 1], [x, y - 1], 1, 2);
			}
		}
	}
}

/*=====  End of JUEGO PROPIAMENTE DICHO  ======*/

/*=======================================================
=            BARRA DE HERRAMIENTAS DEL JUEGO            =
=======================================================*/

toolbar = {
	listeners: [],
	buying_tower: undefined,
	tower_info_hover: false, //used to clear buy-tower info display
	tower_info_blur: false,
	load_menu: false //used to delay the call to menu.load() to the end of the frame
};

toolbar.load = function() {
	//Ensure to trigger all toolbar onblur events
	toolbar.listeners.forEach(function(listener) {
		listener.hovered = true;
	});
	toolbar.load_menu = toolbar.tower_info_hover = toolbar.tower_info_blur = false;
	toolbar.buying_tower = undefined;
	//Divisor line
	line(foreground, [11, 0.8125], [11.5, 0.8125], "red");
	line(foreground, [11.5, 0.8125], [13, 0.8125], "#00ff00");
	line(foreground, [12.5, 0.8125], [15, 0.8125], "#0000ff");
};

toolbar.frame = function() {
	
	rect(foreground, [13, .15], 2, .5, "white");//clear
	icon_text(foreground, [2, 0], game.lives, [13, .25], "black", "bold 10");
	icon_text(foreground, [1, 0], game.gold, [14, .25]);
	
	trigger_events(toolbar.listeners);
	
	var x = Math.floor(mouse.x),
		y = Math.floor(mouse.y);
	
	with(toolbar) {
		//clear tower info display (it is done this way to fix a bug):
		if(tower_info_blur && !tower_info_hover) {
			rect(foreground, [14, 1], 1, 2, "white");
		} else {
			tower_info_hover = tower_info_blur = false;
		}
		
		//buy tower
		if(buying_tower !== undefined) {
			if(game.towers[y] && game.towers[y][x] === undefined) {
				//terrain available for towers
				var range = towers[buying_tower].range;
				fx.beginPath();
				fx.arc((x + .5) * scale, (y + .5) * scale, (range + .5) * scale, 0, 6.28);
				fx.fillStyle = "rgba(125,125,255,.2)";
				fx.fill();
				tile(fx, [4 + buying_tower, 1], [x, y - 1], 1, 2);
				
				if(click) {
					//buy that tower, mr
					var tower = Object.create(towers[buying_tower]);
					game.gold -= tower.price;
					game.towers[y][x] = tower;
					buying_tower = undefined;
				}
			} else {
				tile(fx, [4 + buying_tower, 1], [mouse.x - .5, mouse.y - 1.5], 1, 2);
				if(click) {
					buying_tower = undefined;
				}
			}
		}
	}
	
	//select tower
	if(click) {
		if(game.towers[y] && game.towers[y][x]) {
			game.selected_tower = [x, y];
		} else {
			game.selected_tower = undefined;
		}
	}
	
	if(toolbar.load_menu) {
		menu.load();
	}
};

function rounded_button(dest, width, height, draw, onclick) {
	return {
		x: dest[0], y: dest[1], w: width, h: height,
		hovered: true,
		onhover: function() {
			round_rect(foreground, [this.x, this.y], this.w, this.h, 6, "#BDBDFF");
			draw(this.x, this.y, true);
		},
		onblur: function() {
			rect(foreground, [this.x - .015, this.y - .015], this.w + .03, this.h + .03, "white");
			draw(this.x, this.y, false);
		},
		onclick: onclick
	};
}

function rect_button(dest, width, height, draw, onclick) {
	return {
		x: dest[0], y: dest[1], w: width, h: height,
		hovered: true,
		onhover: function() {
			rect(foreground, [this.x, this.y], this.w, this.h, "#BDBDFF");
			draw(this.x, this.y, true);
		},
		onblur: function() {
			rect(foreground, [this.x - .015, this.y - .015], this.w + .03, this.h + .03, "white");
			draw(this.x, this.y, false);
		},
		onclick: onclick
	};
}

toolbar.listeners.push(
	//Back to menú
	rounded_button([11.2, 0.125], 1.4, .5, function(x, y) {
		arrow(foreground, -1, [x + .1, y + .1], 10, "black", 1.5);
		text(foreground, "QUIT", [x + .535, y + .135], "black", 10);
	}, function() {
		toolbar.load_menu = true; //we delay the call to menu.load()
								  //until we're done with this frame
	}),
	//Buy towers
	rect_button([11, 1], 1, 2, function(x, y, hover) {
		tile(foreground, [4, 1], [x, y], 1, 2);
		tower_info(0, hover);
	}, function() {
		toolbar.buy_tower(0);
	}),
	rect_button([12, 1], 1, 2, function(x, y, hover) {
		tile(foreground, [5, 1], [x, y], 1, 2);
		tower_info(1, hover);
	}, function() {
		toolbar.buy_tower(1);
	}),
	rect_button([13, 1], 1, 2, function(x, y, hover) {
		tile(foreground, [6, 1], [x, y], 1, 2);
		tower_info(2, hover);
	}, function() {
		toolbar.buy_tower(2);
	})
);

toolbar.buy_tower = function(n) {
	var tower = towers[n];
	if(game.gold >= tower.price) {
		toolbar.buying_tower = n;
	} else {
		toolbar.buying_tower = undefined;
	}
};

function tower_info(n, hover) {
	if(hover) {
		toolbar.tower_info_hover = true;
		rect(foreground, [14, 1], 1, 2, "white");
		var tower = towers[n];
		icon_text(foreground, [1, 0], tower.price, [14.0625, 1.25], "black");
		icon_text(foreground, [0, 0], tower.load_time, [14.0625, 1.75]);
		icon_text(foreground, [3, 0], tower.range, [14.0625, 2.25]);
	} else {
		toolbar.tower_info_blur = true;
	}
}

/*=====  End of BARRA DE HERRAMIENTAS DEL JUEGO  ======*/

/*========================================================
=            DEFINICIÓN DE ENEMIGOS Y NIVELES            =
========================================================*/

var enemies, towers, levels = [];

towers = [
	{
		index: 0,
		type: "n",
		price: 20,
		load_time: 4,
		range: 2,
		level: 0,
		projectile_offset: [16, 21],
		load_region: [10, 18, 12, 9],
		upgrade_offset: [21, 12]
	},
	{
		index: 1,
		type: "n",
		price: 35,
		load_time: 2,
		range: 1,
		level: 0,
		projectile_offset: [16, 18],
		load_region: [12, 16, 8, 6],
		upgrade_offset: [21, 8]
	},
	{
		index: 2,
		type: "n",
		price: 50,
		load_time: 3,
		range: 4,
		level: 0,
		projectile_offset: [16, 6],
		load_region: [13, 11, 6, 3],
		upgrade_offset: [20, 4]
	}
];

/*=====  End of DEFINICIÓN DE ENEMIGOS Y NIVELES  ======*/

