
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
		var frame_time = (time - last) / 1000;
		last = time;
		if(func(frame_time) !== false) {
			requestAnimationFrame(frame);
		}
	}
}

var mouse = {x: 0, y: 0},
	click = false,
	escape = false;

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

function draw_entities(entities) {
	var i, len = entities.length,
		hover, m = mouse, c = click;

	for(i = 0; i < len; i++) {
		with(entities[i]) {
			hover = m.x > x && m.y > y &&
					m.x < x + width && m.y < y + height;
			draw(x, y, hover);
			if(hover && c && onclick) {
				onclick(x, y);
			}
		}
	}
}

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

function pixels(n) {
	return n / scale;
}

function depreciate(value) {
	return Math.floor(value * 3 / 4);
}

function element_name(t) {
	if(t === "n")	return "NEUTRAL";
	if(t === "f")	return "FIRE";
	if(t === "a")	return "WATER";
	if(t === "t")	return "EARTH";
}

function element_color(t) {
	if(t === "n")	return "#888888";
	if(t === "f")	return "#ff0000";
	if(t === "a")	return "#0000ff";
	if(t === "t")	return "#00ff00";
}

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

function circle(cx, corner, radius, color) {
	if(color) cx.fillStyle = color;
	cx.beginPath();
	cx.arc((corner[0] + radius) * scale, (corner[1] + radius) * scale,
		   radius * scale, 0, 6.28);
	cx.fill();
}

/*----------  Animaciones lineales para valores  ----------*/

function ease_out_animation(from, to, time) {
	var current = from,
		speed = 2 * (to - from) / time + time / 2,
		acceleration = (1 - speed) / time;
	return function(frame) {
		speed = Math.max(1, speed + acceleration * frame);
		current = (from < to ? Math.min : Math.max)(current + speed * frame, to);
		return current;
	};
}

function delay_animation(initial_value, delay, animation) {
	var time = 0;
	return function(frame) {
		time += frame;
		return time < delay ? initial_value : animation(frame);
	};
}

/*=====  End of CANVAS, MAPA Y FONDO  ======*/


/*====================================================
=            ESTADO Y VARIABLES DE ESTADO            =
====================================================*/


var state,
	menu, 						//state = 0
	instructions,				//state = 1
	game, render, toolbar;	//state = 2


/*=====  End of ESTADO Y VARIABLES DE ESTADO  ======*/


/*======================================
=            MENÚ PRINCIPAL            =
======================================*/

menu = { 
	entities: [],
	show_line: delay_animation(-7, 0.2, ease_out_animation(-7, 0, 2))
};

menu.load = function() {
	state = 0;
	foreground.textAlign = "left";
	foreground.textBaseline = "top";
};

menu.frame = function(frame) {
	clear(foreground);
	clear(fx);
	//
	rect(foreground, [1.5, 2.5], 8, 5, "white");
	text(foreground, "ElementTD", [2, 3], "black", "bold 20");
	line(foreground, [2, 3.75], [3, 3.75], "red", 2);
	line(foreground, [3, 3.75], [6, 3.75], "#00ff00");
	line(foreground, [6, 3.75], [9, 3.75], "#0000ff");
	//gradually show line animation (only first time)
	rect(foreground, [9, 3], menu.show_line(frame), 1, "white");
	//
	draw_entities(menu.entities);
	//circle for difficulty
	circle(foreground, [2.25 - pixels(2), 5 - pixels(2) + .5 * game.difficulty], pixels(2.5), "black");
};

function menu_text_button(string, dest, fontcolor, fontsize, onclick) {
	return {
		x: dest[0], y: dest[1],
		width: text_width(foreground, string, fontsize), height: fontsize / scale,
		draw: function(x, y, hover) {
			text(foreground, string, dest, fontcolor, (hover ? "bold " : "") + fontsize);
		},
		onclick: onclick
	};
}

menu.entities.push(
	menu_text_button("Play", [2, 4.25], "black", 14, function() {
		game.load();
	}),
	menu_text_button("Easy", [2.5, 5 - pixels(4)], "black", 12, function() {
		game.difficulty = 0;
	}),
	menu_text_button("Medium", [2.5, 5.5 - pixels(4)], "black", 12, function() {
		game.difficulty = 1;
	}),
	menu_text_button("Hard", [2.5, 6 - pixels(4)], "black", 12, function() {
		game.difficulty = 2;
	}),
	menu_text_button("Instructions", [2, 6.5], "black", 14, function() {
		instructions.load();
	})
);

/*=====  End of MENÚ PRINCIPAL  ======*/


/*=================================================
=            PANTALLA DE INSTRUCCIONES            =
=================================================*/

instructions = { entities: [] };

instructions.load = function() {
	state = 1;
	foreground.textAlign = "left";
	foreground.textBaseline = "top";
};

instructions.frame = function() {
	clear(foreground);
	clear(fx);
	//
	rect(foreground, [1.5, 2.5], 8, 7.1, "white");
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
	//
	draw_entities(instructions.entities);
};

function circular_button_entity(draw_content, dest, size, onclick) {
	return {
		x: dest[0], y: dest[1],
		width: pixels(size), height: pixels(size),
		draw: function(x, y, hover) {
			if(hover) {
				circle(foreground, [x, y], pixels(size / 2), "#bdbdff");
			}
			draw_content(x, y, hover);
		},
		onclick: onclick
	};
}

instructions.entities.push(
	circular_button_entity(function(x, y) {
		arrow(foreground, -1, [x, y], 16, "black", 2);
	}, [2.15, 3.05], 16, menu.load)
);

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
				render.frame(time);
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
			      "If so, try reloading the page or switch to a different browser.\n"+
			      "Otherwise ignore this alert.");
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
	tower_map: [],
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
	//(Re)set game defaults
	with(game) {
		gold_multiplier = 2 - difficulty * 0.5;
		time = 0;
		level = LEVELS[0];
		level_number = 0;
		gold = 30;
		lives = 10 - difficulty * 5;
		tower_map = [];
		enemies = [];
		explosions = [];
		floating_texts = [];
		beams = [];
		speed = 1;
		state = 0;
		selected_tower = undefined;
		
		for(var y = 0; y < map_height; y++) {
			tower_map.push([]);
			for(var x = 0; x < map_width; x++) {
				if(map_plan[y][x] === " ") {
					tower_map[y][x] = false;
				} else {
					//terrain not available for tower
					tower_map[y][x] = undefined;
				}
			}
		}
	}
	
	toolbar.load();
};

game.frame = function(frame) {
	game.time += frame * game.speed;
	
	var x = Math.floor(mouse.x),
		y = Math.floor(mouse.y),
		tower;
	
	/*----------  Buy a tower  ----------*/
	
	if(toolbar.buying_tower !== undefined && click) {
		tower = TOWERS[toolbar.buying_tower];
		
		if(x > 10 && y < 7) {
			//Clicking on toolbar or castle while buying a tower
			toolbar.buying_tower = undefined;
			
		} else if(game.gold >= tower.price && game.tower_map[y] &&
		          game.tower_map[y][x] === false) {
			
			game.gold -= tower.price;
			toolbar.buying_tower = undefined;
			
			tower = Object.create(tower);
			tower.x = x;
			tower.y = y;
			tower.price = depreciate(tower.price);
			tower.load_progress = 0;
			
			game.tower_map[y][x] = game.selected_tower = tower;
		}
	} else if (click) {
	
	/*----------  Select a tower  ----------*/
		
		if(game.tower_map[y] && game.tower_map[y][x]) {
			game.selected_tower = game.tower_map[y][x];
		} else if(x < 11 || y > 6) {
			game.selected_tower = undefined;
		}
	}
	
	/*----------  Make towers fire proyectiles  ----------*/
	
	for(y = 0; y < game.tower_map.length; y++) {
		var line = game.tower_map[y];
		for(x = 0; x < line.length; x++) {
			tower = line[x];
			if(tower) {
				tower.load_progress = Math.min(tower.load_time, tower.load_progress + frame);
			}
		}
	}
};

game.sell_tower = function() {
	var tower = game.selected_tower;
	
	game.tower_map[tower.y][tower.x] = false;
	game.gold += tower.price;
	game.selected_tower = undefined;
};

game.upgrade_tower = function() {
	var tower = game.selected_tower;
	
	if(game.gold >= tower.upgrade_price && tower.level < 4) {
		game.gold -= tower.upgrade_price;
		tower.price += depreciate(tower.upgrade_price);
		tower.upgrade_price *= 2;
		tower.level += 1;
		tower.load_time /= 2;
	}
};

game.buy_element = function(t) {
	var tower = game.selected_tower;
	
	if(game.gold >= 20) {
		game.gold -= 20;
		tower.type = t;
		tower.load_progress = Math.min(tower.load_time / 2, tower.load_progress);
		tower.price += depreciate(20);
	}
};

/*=====  End of JUEGO PROPIAMENTE DICHO  ======*/


/*==============================================
=            RENDERIZADOR DEL JUEGO            =
==============================================*/

render = {};

render.frame = function(frame_time) {
	clear(foreground);
	clear(fx);
	
	var x = Math.floor(mouse.x), //mouse x and y
		y = Math.floor(mouse.y),
		tower, i, j;
	
	/*----------  Draw selected tower range  ----------*/
	
	if(game.selected_tower) {
		tower = game.selected_tower;
		render.tower_radius(foreground, tower, [tower.x, tower.y], ".15");
		rect(foreground, [tower.x, tower.y], 1, 1, "rgba(125,125,255,.3)");
	}
	
	/*----------  Shadow when hovering a tower  ----------*/
	
	if(game.tower_map[y] && game.tower_map[y][x] && game.tower_map[y][x] !== game.selected_tower) {
		rect(foreground, [x, y], 1, 1, "rgba(125,125,255,.2)");
	}
	
	/*----------  Draw all towers  ----------*/
	
	var mx, my; //map x and y
	for(my = 1; my < map_height - 1; my++) {
		for(mx = 0; mx < 11; mx++) {
			tower = game.tower_map[my][mx];
			if(tower) {
				render.tower(foreground, tower, [mx, my]);
			}
		}
	}
		
	/*----------  Draw the tower that you are buying  ----------*/
	
	if(toolbar.buying_tower !== undefined) {
		tower = TOWERS[toolbar.buying_tower];
		
		if(game.tower_map[y] && game.tower_map[y][x] === false) {
			//Terrain is available for buying a tower
			render.tower_radius(fx, tower, [x, y], ".2");
			render.tower(fx, tower, [x, y]);
		} else {
			//Terrain is not available for buying a tower
			render.tower(fx, tower, [mouse.x - .5, mouse.y - .5]);
		}
	}
}

render.tower = function(cx, tower, dest) {
	tile(cx, [4 + tower.index, 1], [dest[0], dest[1] - 1], 1, 2);
	
	if(tower.load_progress) {
		var progress = Math.min(1, tower.load_progress / tower.load_time),
			region = tower.load_region;
		
		rect(cx, [dest[0] + pixels(region[0]), dest[1] - 1 + pixels(region[1])],
		     pixels(region[2]) * progress, pixels(region[3]), element_color(tower.type));
	}
	
	var offset = tower.upgrade_offset;
	
	for(var i = 0; i < tower.level; i++) {
		icon(cx, [3, 1],
		     [dest[0] + pixels(offset[0]), dest[1] - 1 + pixels(offset[1]) + pixels(9 * i)]);
	}
}

render.tower_radius = function(cx, tower, dest, opacity) {
	circle(cx, [dest[0] - tower.range, dest[1] - tower.range],
	       tower.range + .5, "rgba(125,125,255," + opacity + ")");
}


/*=====  End of RENDERIZADOR DEL JUEGO  ======*/


/*=======================================================
=            BARRA DE HERRAMIENTAS DEL JUEGO            =
=======================================================*/

toolbar = {
	buttons: [],
	selected_buttons: [],
	buying_tower: undefined
};

toolbar.load = function() {
	toolbar.buying_tower = undefined;
};

toolbar.frame = function(frame) {
	
	/*----------  Boring UI stuff  ----------*/
	
	var tower;
	//white rect
	rect(foreground, [11, 0], 4, 7, "white");
	//lives and gold
	icon_text(foreground, [2, 0], game.lives, [13, .25], "black", "bold 10");
	icon_text(foreground, [1, 0], game.gold, [14, .25]);
	//Divisor line
	line(foreground, [11, 0.8125], [11.5, 0.8125], "red");
	line(foreground, [11.5, 0.8125], [13, 0.8125], "#00ff00");
	line(foreground, [12.5, 0.8125], [15, 0.8125], "#0000ff");
	//Buy towers, speed control
	draw_entities(toolbar.buttons);
	//Divisor line
	line(foreground, [11, 3.1875], [11.5, 3.1875], "red");
	line(foreground, [11.5, 3.1875], [13, 3.1875], "#00ff00");
	line(foreground, [12.5, 3.1875], [15, 3.1875], "#0000ff");
	
	/*----------  With a tower selected  ----------*/
	
	if(game.selected_tower) {
		
		/*----------  Draw tower and tower info  ----------*/
		
		tower = game.selected_tower;
		tile(foreground, [2, 0], [11 + pixels(4), 4.25]);
		render.tower(foreground, tower, [11 + pixels(4), 4.25]);
		toolbar.draw_tower_info(foreground, tower, [12 + pixels(4), 3.25]);
		
		var name = element_name(tower.type),
			name_width = text_width(foreground, name + " ", "bold 10");
		
		text(foreground, name, [12 + pixels(4), 3.25 + pixels(6)], element_color(tower.type));
		text(foreground, tower.material, [12 + pixels(4) + name_width, 3.25 + pixels(6)], "black");
		
		/*----------  Sell, upgrade and element info  ----------*/
		
		if(tower.level < 4) {
			draw_entities(toolbar.upgrade_button);
		}
		if(tower.type === "n") {
			draw_entities(toolbar.buy_element_button);
			if(toolbar.hide_elements_timer > 0) {
				draw_entities(toolbar.element_buttons);
				toolbar.hide_elements_timer -= frame;
			}
		} else {
			text(foreground, "This tower will only", [11 + pixels(4), 6 + pixels(4)], "gray");
			text(foreground, "attack ", [11 + pixels(4), 6.5 + pixels(4)]);
			text(foreground, element_name(tower.type).toLowerCase(),
			     [11 + pixels(4) + text_width(foreground, "attack "), 6.5 + pixels(4)],
			     element_color(tower.type));
			text(foreground, " enemies",
			     [11 + pixels(4) + text_width(foreground, "attack " + element_name(tower.type)), 6.5 + pixels(4)],
			     "gray");
		}
		draw_entities(toolbar.sell_button);
	}
};

function rectangular_button(draw_content, dest, width, height, onclick) {
	return {
		x: dest[0], y: dest[1], width: width, height: height,
		draw: function(x, y, hover) {
			if(hover) {
				rect(foreground, [x, y], width, height, "#bdbdff");
			} else {
				foreground.lineWidth = 1;
				foreground.strokeStyle = "#bdbdff";
				foreground.setLineDash([2,2]);
				foreground.strokeRect(x * scale + 1.5, y * scale + 1.5,
				                      width * scale - 3, height * scale - 3);
				foreground.setLineDash([]);
			}
			draw_content(x, y, hover);
		},
		onclick: onclick
	};
}

/*----------  Helpers  ----------*/

toolbar.draw_tower_info = function(cx, tower, dest, gold_color) {
	var x = dest[0] + pixels(2),
		y = dest[1] + pixels(4);
	
	icon_text(cx, [1, 0], tower.price, [x, y + .5], gold_color || "gray", "10");
	icon_text(cx, [0, 0], toolbar.format_load_time(tower.load_time), [x, y + 1], "gray");
	icon_text(cx, [3, 0], tower.range, [x, y + 1.5]);
};

toolbar.format_load_time = function(load_time) {
	load_time = String(load_time);
	if(load_time[0] === "0") {
		load_time = load_time.substr(1);
	}
	if(load_time.length > 3) {
		load_time = load_time.slice(0, 3);
	}
	return load_time;
};

toolbar.select_tower = function(n) {
	var tower = TOWERS[n];
	if(toolbar.buying_tower === n) {
		toolbar.buying_tower = undefined;
	} else if(game.gold >= tower.price) {
		toolbar.buying_tower = n;
		game.selected_tower = undefined;
	} else {
		toolbar.buying_tower = undefined;
	}
};

/*----------  Quit and buy tower buttons  ----------*/

//Quit
toolbar.buttons.push({
	x: 11.2, y: 0.125, width: 1.4, height: .5,
	draw: function(x, y, hover) {
		arrow(foreground, -1, [x + .1, y + .1], 10, "black", hover ? 2 : 1.5);
		text(foreground, "QUIT", [x + .535, y + .135], "black", (hover ? "bold " : "") + "10");
	},
	onclick: menu.load
});

//Buy towers
[0,1,2].forEach(function(n) {
	toolbar.buttons.push(
		rectangular_button(function(x, y, hover) {
			//displays tower info
			if(hover) {
				var tower = TOWERS[n];
				toolbar.draw_tower_info(foreground, tower, [14, 1],
				                   game.gold < tower.price ? "#770000" : undefined);
				
				text(foreground, tower.material, [14 + pixels(1), 1 + pixels(6)], "black", "bold 10");
			}
			//draws tower
			tile(foreground, [4 + n, 1], [x, y], 1, 2);
		}, [11 + n, 1], 1, 2, function() {
			toolbar.select_tower(n);
		})
	);
});

/*----------  Selected tower buttons  ----------*/

//Sell	
toolbar.sell_button = [
	rectangular_button(function(x, y, hover) {
		text(foreground, "SELL", [x + .5, y + pixels(4)], hover ? "#700" : "gray", 10);
		if(hover) {
			icon_text(foreground, [3, 2], game.selected_tower.price,
			          [12 + pixels(6), 3.75 + pixels(4)], hover ? "black" : "gray");
		}
	}, [13, 3.75], 1.75, .5, game.sell_tower)
];

//Upgrade
toolbar.upgrade_button = [
	rectangular_button(function(x, y, hover) {
		var tower = game.selected_tower;
		
		text(foreground, "UPGRADE", [x + pixels(8), y + pixels(5)], hover ? "black" : "gray", 10);
		text(foreground, "for", [x + pixels(4), y + .5 + pixels(2)]);
		icon_text(foreground, [1,0], tower.upgrade_price, [x + .75, y + .5 + pixels(2)],
		          game.gold < tower.upgrade_price && hover ? "#700" : undefined);
		
		if(hover) {
			var load_time = toolbar.format_load_time(tower.load_time / 2);
			
			rect(foreground, [12 + pixels(4), 4.25], .5, .5, "white");
			icon_text(foreground, [0, 0], load_time, [12 + pixels(6), 4.25 + pixels(4)], "#070");
		}
	}, [13, 4.25], 1.75, 1, game.upgrade_tower)
];

//Buy element
toolbar.buy_element_button = [
	rectangular_button(function(x, y, hover) {
		text(foreground, "ELEMENT", [x + pixels(8), y + pixels(5)], hover ? "black" : "gray");
		text(foreground, "for ", [x + pixels(6), y + .5 + pixels(2)]);
		icon_text(foreground, [1, 0], "20", [x + .75 + pixels(2), y + .5 + pixels(2)],
		          game.gold < 20 && hover ? "#700" : undefined);
		
	}, [13, 5.25], 1.75, 1, function() {
		toolbar.hide_elements_timer = 3;
	})
];

toolbar.element_buttons = [
	
	{
		x: 11 + pixels(6), y: 6, width: text_width(foreground, "FIRE", 10), height: .5,
		draw: function(x, y, hover) {
			text(foreground, "FIRE", [x, y],
			     toolbar.hovering_elements ? "red" : "gray",
			     (hover ? "bold " : "") + "10");
			if(hover)
				toolbar.hide_elements_timer = 3;
		},
		onclick: function() {
			game.buy_element("f");
		}
	},
	{
		x: 11 + pixels(6) + text_width(foreground, "FIRE "), y: 6,
		width: text_width(foreground, "WATER"), height: .5,
		draw: function(x, y, hover) {
			text(foreground, "WATER", [x, y],
			     toolbar.hovering_elements ? "blue" : "gray",
			     (hover ? "bold " : "") + "10");
			if(hover)
				toolbar.hide_elements_timer = 3;
		},
		onclick: function() {
			game.buy_element("a");
		}
	},
	{
		x: 11 + pixels(6) + text_width(foreground, "FIRE WATER "), y: 6,
		width: text_width(foreground, "EARTH"), height: .5,
		draw: function(x, y, hover) {
			text(foreground, "EARTH", [x, y],
			     toolbar.hovering_elements ? "#0f0" : "gray",
			     (hover ? "bold " : "") + "10");
			if(hover)
				toolbar.hide_elements_timer = 3;
		},
		onclick: function() {
			game.buy_element("t");
		}
	}
	
];

/*----------  Speed control buttons  ----------*/

toolbar.buttons.push(
	
);

/*=====  End of BARRA DE HERRAMIENTAS DEL JUEGO  ======*/


/*========================================================
=            DEFINICIÓN DE ENEMIGOS Y NIVELES            =
========================================================*/

var ENEMIES, TOWERS, LEVELS = [];

TOWERS = [
	{
		index: 0,
		type: "n",
		material: "WOOD",
		price: 20,
		upgrade_price: 35,
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
		material: "STONE",
		price: 35,
		upgrade_price: 60,
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
		material: "STEEL",
		price: 50,
		upgrade_price: 90,
		load_time: 3,
		range: 4,
		level: 0,
		projectile_offset: [16, 6],
		load_region: [13, 11, 6, 3],
		upgrade_offset: [20, 4]
	}
];

/*=====  End of DEFINICIÓN DE ENEMIGOS Y NIVELES  ======*/

