var IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

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
	if(event.keyCode === 27) {
		escape = true;
	} else if(event.keyCode === 48) {
		game.speed = 0;
	} else if(event.keyCode === 49) {
		game.speed = 1;
	} else if(event.keyCode === 50) {
		game.speed = 2;
	} else if(event.keyCode === 51) {
		game.speed = 3;
	} else if(event.keyCode === 52) {
		game.speed = 4;
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

var map_plan = ["^^^^^^^^^^^^^^^",
				"           ....",
				"####  #### ....",
				"   ####  # ....",
				"         # ....",
				"   ####  # ....",
				" ###  #### ....",
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
tileset.src = "tileset.png";
if(tileset.complete) {
	draw_background();
} else {
	tileset.addEventListener("load", draw_background);
	tileset.addEventListener("error", function(err) {
		alert("Error loading tileset. Please reload the page.\n" + err);
	});
}

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
	if(t === "w")	return "WATER";
	if(t === "e")	return "EARTH";
}

function element_color(t) {
	if(t === "n")	return "#888888";
	if(t === "f")	return "#ff0000";
	if(t === "w")	return "#0000ff";
	if(t === "e")	return "#00ff00";
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

function image(cx, image, orig, dest) {
	cx.drawImage(image,
	             orig[0] * scale, orig[1] * scale,
	             scale, scale,
	             dest[0] * scale, dest[1] * scale,
	             scale, scale);
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

	//https://bugzilla.mozilla.org/show_bug.cgi?id=737852
	var y = dest[1];
	if(!IS_FIREFOX) {
		y -= pixels(2);
	}

	cx.fillText(string, dest[0] * scale, y * scale);
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

function round_rect(cx, dest, width, height, radius, color) {
	if(color) cx.fillStyle = color;
	cx.beginPath();
	cx.arc((dest[0] + radius) * scale, (dest[1] + radius) * scale,
	       radius * scale, Math.PI, 3 * Math.PI / 2);
	cx.arc((dest[0] + width - radius) * scale, (dest[1] + radius) * scale,
	       radius * scale, 3 * Math.PI / 2, 2 * Math.PI);
	cx.arc((dest[0] + width - radius) * scale, (dest[1] + height - radius) * scale,
	       radius * scale, 0, Math.PI / 2);
	cx.arc((dest[0] + radius) * scale, (dest[1] + height - radius) * scale,
	       radius * scale, Math.PI / 2, Math.PI);
	cx.fill();
}

function frame_text(cx, string, dest, height, bgcolor, textcolor, font) {
	var width = text_width(cx, string, font),
		padding = pixels(4);
	
	round_rect(cx, dest, width + padding * 2, height + padding * 2, padding, bgcolor || "white");
	text(cx, string, [dest[0] + padding, dest[1] + padding], textcolor || "black");
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
	game, render, toolbar;		//state = 2


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
	game.difficulty = Number(localStorage.getItem("difficulty"));
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
	//gradually show line animation (only one time)
	rect(foreground, [9, 3], menu.show_line(frame), 1, "white");
	//
	draw_entities(menu.entities);
	//circle for difficulty
	circle(foreground, [2.25 - pixels(2), 5 - pixels(2) + .5 * game.difficulty], pixels(2.5), "black");
};

menu.change_difficulty = function(set) {
	game.difficulty = set;
	localStorage.setItem("difficulty", set);
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
		menu.show_line = function() { return 0; };
		game.load();
	}),
	menu_text_button("Easy", [2.5, 5 - pixels(4)], "black", 12, function() {
		menu.change_difficulty(0);
	}),
	menu_text_button("Medium", [2.5, 5.5 - pixels(4)], "black", 12, function() {
		menu.change_difficulty(1);
	}),
	menu_text_button("Hard", [2.5, 6 - pixels(4)], "black", 12, function() {
		menu.change_difficulty(2);
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

instructions.frame = function(frame) {
	clear(foreground);
	clear(fx);
	//
	rect(foreground, [1.5, 2.5], 8, 7.1, "white");
	text(foreground, "Instructions", [3, 3], "black", "bold 20");
	line(foreground, [2, 3.75], [3, 3.75], "red");
	line(foreground, [3, 3.75], [6, 3.75], "#00ff00");
	line(foreground, [6, 3.75], [9, 3.75], "#0000ff");
	//gradually show line animation (one time only)
	rect(foreground, [9, 3], menu.show_line(frame), 1, "white");

	text(foreground, "1. Buy towers to defend the cas_", [2, 4.25], "black", 12);
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
	level_time: 0,
	level_events: [],
	level_finished: false,
	gold: 0,
	lives: 0,
	tower_map: [],
	enemies: [],
	explosions: [],
	floating_texts: [],
	entities: [],
	beams: [], //projectiles from towers
	speed: 0,
	state: 0,
	selected_tower: undefined
};

game.load = function() {
	state = 2;
	//reset game defaults
	with(game) {
		gold_multiplier		=	1.5 - difficulty * .25;
		time				=	0;
		gold				=	30;
		lives				=	10 - difficulty * 5;
		tower_map			=	[];
		enemies				=	[];
		explosions			=	[];
		floating_texts		=	[];
		entities 			=	[];
		beams				=	[];
		speed				=	1;
		state				=	0;
		selected_tower		=	undefined;
		
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
	
	game.load_level(0);
	toolbar.load();
};

game.frame = function(frame) {
	var x 			= Math.floor(mouse.x),
		y 			= Math.floor(mouse.y),
		game_frame	= frame * game.speed,
		explosion, tower, line, enemy, beam,
		destination, step, event, i, distance,
		element, floating_text;
	
	/*----------  Time  ----------*/
	
	game.time 		+= game_frame;
	game.level_time += game_frame;
	
	/*----------  On level finished  ----------*/
	
	if(game.level_finished && !game.enemies.length && !game.explosions.length) {
		game.load_level(game.level_number + 1);
	}

	/*----------  Buy and select towers  ----------*/
	
	if(click) {
		
		// Buy
		if(toolbar.buying_tower !== undefined) {
			tower = TOWERS[toolbar.buying_tower];
			
			if(game.gold >= tower.price && game.tower_map[y] &&
			          game.tower_map[y][x] === false) {
				
				game.gold -= tower.price;
				toolbar.buying_tower = undefined;
				toolbar.hide_elements_timer = 0;
				
				tower = Object.create(tower);
				tower.x = x;
				tower.y = y;
				tower.price = depreciate(tower.price);
				tower.load_progress = 0;
				
				game.tower_map[y][x] = game.selected_tower = tower;
			} else if(x < 11 || y > 3.25) {
				toolbar.buying_tower = undefined;
			}
			
		//Select
		} else {
			if(game.tower_map[y] && game.tower_map[y][x]) {
				game.selected_tower = game.tower_map[y][x];
				toolbar.hide_elements_timer = 0;
			} else if(x < 11) {
				game.selected_tower = undefined;
			}
		}
	}
	
	if(escape) {
		toolbar.buying_tower = game.selected_tower = undefined;
	}
	
	if(game.speed) {
	
	/*----------  Trigger level events  ----------*/
		
		if(game.level_events[0] && game.level_events[0].time <= game.level_time) {
			event = game.level_events.shift();
			event.action.apply(game, event.arguments);
		}

	/*----------  Make enemies move  ----------*/
		
		for(i = 0; i < game.enemies.length; i += 1) {
			enemy = game.enemies[i],
			destination = path[enemy.going_to],
			step = pixels(enemy.speed * game_frame);
			
			["x", "y"].forEach(function(axis, n) {
				if(enemy[axis] !== destination[n]) {
					if(Math.abs(enemy[axis] - destination[n]) <= step) {
						enemy[axis] = destination[n];
						enemy.going_to += 1;
						game.set_enemy_facing(enemy);
					} else {
						enemy[axis] += (enemy[axis] < destination[n] ? 1 : -1) * step;
					}
				}
			});
			
			if(enemy.going_to === path.length) {
				//Enemy crashes in the castle and explodes
				game.enemies.splice(i, 1);
				i -= 1;
				
				game.explosions.push({
					x: enemy.x,
					y: enemy.y,
					time: 0
				});
				
				game.lose_live();
			}
			
	/*----------  Enemy time  ----------*/
			
			enemy.time += game_frame;
			enemy.frame = Math.floor(enemy.time * enemy.fps) % enemy.frames.length;
	
		}
	
	/*----------  Make towers fire beams  ----------*/
	
		for(y = 0; y < game.tower_map.length; y += 1) {
			line = game.tower_map[y];
			for(x = 0; x < line.length; x++) {
				tower = line[x];
				if(tower) {
					tower.load_progress = Math.min(tower.load_time, tower.load_progress + game_frame);
					
					if(tower.load_progress === tower.load_time) {
						for(i = 0; i < game.enemies.length; i += 1) {
							enemy = game.enemies[i];
							element = enemy.life[enemy.life.length - 1];
							
							if(tower.element === element) {
								//distance squared
								distance = Math.pow(x - enemy.x, 2) + Math.pow(y - enemy.y, 2);
								
								if(distance <= Math.pow(tower.range + .5, 2)) {
									//Fire
									tower.load_progress = 0;
									enemy.life = enemy.life.slice(0, -1);
									
									game.beams.push({
										x: tower.x + pixels(tower.beam_origin[0]),
										y: tower.y - 1 + pixels(tower.beam_origin[1]),
										time: 0,
										element: element,
										target: enemy,
										display_life: enemy.life
									});
									break; //breaks the enemy loop
								}
							}
						}
					}
				}
			}
		}
		
	/*----------  Explosions grow and die  ----------*/
		
		for(i = 0; i < game.explosions.length; i += 1) {
			explosion = game.explosions[i];
			
			explosion.time += game_frame;
			
			if(explosion.time > 0.5) {
				game.explosions.splice(i, 1);
				i -= 1;
			}
		}
		
	/*----------  Beams hit their target  ----------*/
		
		for(i = 0; i < game.beams.length; i += 1) {
			beam = game.beams[i];
			
			beam.time += game_frame;
			
			if(beam.time > 0.3) {
				game.beams.splice(i, 1);
				i -= 1;
				
				enemy = beam.target;
				enemy.display_life = beam.display_life;
				
				if(!enemy.display_life) {
					//Enemy is killed
					game.enemies.splice(game.enemies.indexOf(enemy), 1);
					
					game.explosions.push({
						x: enemy.x,
						y: enemy.y,
						time: 0
					});
					
					game.floating_texts.push({
						x: enemy.x + Math.floor(Math.random() * .5),
						y: enemy.y + Math.floor(Math.random() * .25),
						string: String(Math.floor(enemy.gold * game.gold_multiplier)),
						time: 0
					});
					
					game.gold += Math.floor(enemy.gold * game.gold_multiplier);
				}
			}
		}
		
	/*----------  Floating texts rise up and dissapear  ----------*/
		
		for(i = 0; i < game.floating_texts.length; i += 1) {
			floating_text = game.floating_texts[i];
			
			floating_text.time += game_frame;
			
			if(floating_text.time > 1) {
				game.floating_texts.splice(i, 1);
				i -= 1;
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
		tower.element = t;
		tower.load_progress = Math.min(tower.load_time / 2, tower.load_progress);
		tower.price += depreciate(20);
	}
};

game.load_level = function(n) {

	with(game) {
		level 		 	= LEVELS[n];
		level_number 	= n;
		level_time 	 	= 0;
		level_events 	= [];
		level_finished	= false;
	}
	
	if(!game.level) {
		return game.win();
	}
	
	//Level events
	
	var current_time = game.level.start_time;
	
	game.level.waves.forEach(function(wave) {
		if(typeof wave === "number") {
			current_time += wave;
		} else {
			
			var amount	= wave[0],
				enemy 	= wave[1],
				delay	= wave[2];
			
			for(var i = 0; i < amount; i++) {
				game.level_events.push({
					time: current_time,
					action: game.create_enemy,
					arguments: [enemy]
				});
				
				current_time += delay;
			}
		}
	});
	
	game.level_events.push({
		time: current_time,
		action: function() {
			game.level_finished = true;
		},
		arguments: []
	});
};

game.create_enemy = function(enemy) {
	game.enemies.push(extend(enemy, {
		x: 				path[0][0],
		y: 				path[0][1],
		going_to: 		1,			//going to path[1]
		time: 			0,
		frame: 			0,			//current frame
		facing: 		0,			//0 is right, 1 is left
		display_life: 	enemy.life,
		beam_count: 	0			//beams that are currently hitting the enemy
	}));
};

game.set_enemy_facing = function(enemy) {
	var new_destination = path[enemy.going_to];
	
	if(new_destination) {
		if(enemy.x === new_destination[0] && path[enemy.going_to + 1]) {
			enemy.facing = enemy.x < path[enemy.going_to + 1][0] ? 0 : 1;
		} else {
			enemy.facing = enemy.x < new_destination[0] ? 0 : 1;
		}
	}
};

game.lose_live = function() {
	game.lives -= 1;
	if(game.lives === -1) {
		game.lose();
	}
};

game.lose = function() {};

game.win = function() {};

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
		tower, i, j, my, mx;
	
	/*----------  Draw selected tower range  ----------*/
	
	if(game.selected_tower) {
		tower = game.selected_tower;
		render.tower_radius(foreground, tower, [tower.x, tower.y], "rgba(125,125,255,.15)");
		rect(foreground, [tower.x, tower.y], 1, 1, "rgba(125,125,255,.3)");
	}
	
	/*----------  Shadow when hovering a tower  ----------*/
	
	if(game.tower_map[y] && game.tower_map[y][x] && game.tower_map[y][x] !== game.selected_tower) {
		rect(foreground, [x, y], 1, 1, "rgba(125,125,255,.2)");
	}
	
	/*----------  Draw enemies  ----------*/
	
	for(i = 0; i < game.enemies.length; i++) {
		render.enemy(foreground, game.enemies[i]);
	}
	
	/*----------  Draw explosions  ----------*/
	
	for(i = 0; i < game.explosions.length; i++) {
		var explosion = game.explosions[i];
		tile(foreground, [6 + Math.floor(explosion.time * 8), 0], [explosion.x, explosion.y]);
	}
	
	/*----------  Draw all towers  ----------*/
	
	for(my = 1; my < map_height - 1; my++) {
		for(mx = 0; mx < 11; mx++) {
			tower = game.tower_map[my][mx];
			if(tower) {
				render.tower(foreground, tower, [mx, my]);
			}
		}
	}
	
	/*----------  Draw enemy's life  ----------*/
	
	for(i = 0; i < game.enemies.length; i++) {
		var enemy = game.enemies[i];
		render.life(foreground, enemy.display_life, [enemy.x, enemy.y]);
	}
	
	/*----------  Draw floating texts  ----------*/
	
	for(i = 0; i < game.floating_texts.length; i++) {
		var text = game.floating_texts[i];
		
		foreground.globalAlpha = (1 - text.time).toFixed(2);
		
		icon_text(foreground, [3, 2], text.string, [text.x, text.y - text.time], "black", "bold 10");
	}
	foreground.globalAlpha = 1;
	
	/*----------  Draw beams  ----------*/
	
	for(i = 0; i < game.beams.length; i++) {
		var beam = game.beams[i];
		
		line(fx, [beam.x, beam.y], [beam.target.x + .5, beam.target.y + .5],
		     element_color(beam.element), Math.sin(beam.time * Math.PI / 0.3) * 2);
	}
	
	/*----------  Draw the tower that you are buying  ----------*/
	
	if(toolbar.buying_tower !== undefined) {
		tower = TOWERS[toolbar.buying_tower];

		if(game.tower_map[y] && game.tower_map[y][x] === false) {
			render.tower_radius(fx, tower, [mouse.x - .5, mouse.y - .5], "rgba(125,125,255,.2)");
		}
		render.tower(fx, tower, [mouse.x - .5, mouse.y - .5]);
	}
}

render.tower = function(cx, tower, dest) {
	tile(cx, [4 + tower.index, 1], [dest[0], dest[1] - 1], 1, 2);
	
	if(tower.load_progress) {
		var progress = Math.min(1, tower.load_progress / tower.load_time),
			region = tower.load_region;
		
		rect(cx, [dest[0] + pixels(region[0]), dest[1] - 1 + pixels(region[1])],
		     pixels(region[2]) * progress, pixels(region[3]), element_color(tower.element));
	}
	
	var offset = tower.upgrade_offset;
	
	for(var i = 0; i < tower.level; i++) {
		icon(cx, [3, 1],
		     [dest[0] + pixels(offset[0]), dest[1] - 1 + pixels(offset[1]) + pixels(9 * i)]);
	}
};

render.tower_radius = function(cx, tower, dest, color) {
	circle(cx, [dest[0] - tower.range, dest[1] - tower.range],
	       tower.range + .5, color);
};

render.enemy = function(cx, enemy) {
	image(cx, enemy.canvas, [enemy.frame, enemy.facing], [enemy.x, enemy.y]);
};

render.life = function(cx, life, dest) {
	/* Life size: 3 + 1px margin, Max lifes per row: 8 */
	var rows = Math.floor(life.length / 8),
		height = pixels(rows * 4),
		last_row = life.length % 8,
		i, j;
	
	if(rows) {
		rect(cx, [dest[0] - pixels(1), dest[1] - height - pixels(1)],
		     1 + pixels(1), height + pixels(1), "black");
		for(i = 0; i < rows; i += 1) {
			for(j = 0; j < 8; j++) {
				rect(cx, [dest[0] + pixels(j * 4), dest[1] - pixels(i * 4 + 4)],
				     pixels(3), pixels(3), element_color(life[i * 8 + j]));
			}
		}
	}
	if(last_row) {
		rect(cx, [dest[0] - pixels(1), dest[1] - height - pixels(5)],
		     pixels(4 * last_row + 1), pixels(5), "black");
		for(j = 0; j < last_row; j += 1) {
			rect(cx, [dest[0] + pixels(j * 4), dest[1] - height - pixels(4)],
			     pixels(3), pixels(3), element_color(life[rows * 8 + j]));
		}
	}
};

/*=====  End of RENDERIZADOR DEL JUEGO  ======*/


/*=======================================================
=            BARRA DE HERRAMIENTAS DEL JUEGO            =
=======================================================*/

toolbar = {
	buttons: [],
	selected_buttons: [],
	buying_tower: undefined,
	hide_elements_timer: 0
};

toolbar.load = function() {
	toolbar.buying_tower = undefined;
};

toolbar.frame = function(frame) {
	
	/*----------  Boring UI stuff  ----------*/
	
	var tower;
	//white rect
	rect(foreground, [11, 0], 4, 3 + pixels(7), "white");
	//lives and gold
	icon_text(foreground, [2, 0], game.lives, [13, .25], "black", "bold 10");
	icon_text(foreground, [1, 0], game.gold, [14, .25]);
	//Divisor line
	line(foreground, [11, 0.5 + pixels(9)], [11.5, 0.5 + pixels(9)], "red", 2);
	line(foreground, [11.5, 0.5 + pixels(9)], [12.5, 0.5 + pixels(9)], "#00ff00");
	line(foreground, [12.5, 0.5 + pixels(9)], [15, 0.5 + pixels(9)], "#0000ff");
	//Buy towers, speed control
	draw_entities(toolbar.buttons);
	//Divisor line
	line(foreground, [11, 3 + pixels(5)], [11.5, 3 + pixels(5)], "red", 2);
	line(foreground, [11.5, 3 + pixels(5)], [12.5, 3 + pixels(5)], "#00ff00");
	line(foreground, [12.5, 3 + pixels(5)], [15, 3 + pixels(5)], "#0000ff");
	
	/*----------  With a tower selected  ----------*/
	
	if(game.selected_tower) {

		//white rect
		rect(foreground, [11, 3 + pixels(6)], 4, 4 - pixels(6), "white");
		
		/*----------  Draw tower and tower info  ----------*/
		
		tower = game.selected_tower;
		tile(foreground, [2, 0], [11.25, 4.75]);
		render.tower(foreground, tower, [11.25, 4.75]);
		toolbar.draw_tower_info(foreground, tower, [12.25, 3.5]);
		
		var name = element_name(tower.element),
			name_width = text_width(foreground, name + " ", "bold 10");
		
		text(foreground, name, [11.25, 3.5], element_color(tower.element));
		text(foreground, tower.material, [11.25 + name_width, 3.5], "black");
		
		/*----------  Sell, upgrade and element  ----------*/
		
		if(tower.level < 4) {
			draw_entities(toolbar.upgrade_button);
		}
		if(tower.element === "n") {
			if(toolbar.hide_elements_timer > 0) {
				draw_entities(toolbar.element_buttons);
			}
			draw_entities(toolbar.buy_element_button);
			toolbar.hide_elements_timer -= frame;
		} else {
			text(foreground, "This tower will only", [11 + pixels(4), 6 + pixels(4)], "gray");
			text(foreground, "attack ", [11 + pixels(4), 6.5 + pixels(4)]);
			text(foreground, element_name(tower.element).toLowerCase(),
			     [11 + pixels(4) + text_width(foreground, "attack "), 6.5 + pixels(4)],
			     element_color(tower.element));
			text(foreground, " enemies",
			     [11 + pixels(4) + text_width(foreground, "attack " + element_name(tower.element)), 6.5 + pixels(4)],
			     "gray");
		}
		draw_entities(toolbar.sell_button);
	}
	
	/*----------  Level info  ----------*/
	
	if(game.level) {
		
		var global_alpha = Math.min(1, Math.max(0.7, 1 + (mouse.y - 12.5) / 4));
		
		var end = toolbar.draw_level_info(game.level, game.level_time, 0.25, 10.75, 12.5, global_alpha);
		
		if(end < 8 && LEVELS[game.level_number + 1]) {
			toolbar.draw_level_info(LEVELS[game.level_number + 1], 0,
			                        Math.max(0.25, end + 2), 10.75, 12.5, global_alpha, true);
		}
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

toolbar.draw_level_info = function(level, level_time, start, end, y, global_alpha, next) {
	
	foreground.globalAlpha = global_alpha;
	
	var time = level.start_time,
		height = undefined,
		name_width = text_width(foreground, level.name) + pixels(8),
		i, j, wave, amount, enemy, delay, x, radius, first, length,
		first = true, final_x;
	
	wave_loop:
	for(i = 0; i < level.waves.length; i += 1) {
		wave = level.waves[i];
		
		if(typeof wave === "number") {
			time += wave;
			continue;
		}
		
		amount = wave[0];
		enemy = wave[1];
		delay = wave[2];
		
		for(j = 0; j < amount; j += 1) {
			x = (time - level_time) * 0.3;
			
			if(x > end - start) {
				break wave_loop;
			}
			
			if(x > 0) {
				radius = pixels(j === 0 ? 3 : 2);
				circle(foreground, [start + x - radius, y - radius],
				       radius, "black");
				
				if(j === 0 || first) {
					render.life(foreground, enemy.life,
					            [j === 0 ? start + x : start, y - .25]);
					
					if(first) {
						length = enemy.life.length;
						height = pixels( Math.floor(length / 8) * 4 + (length % 8 ? 4 : 0) );
					}
					first = false;
				}
				
			} else if(x > -1 && j === amount - 1) {
				foreground.globalAlpha = ((1 + x) * global_alpha).toFixed(2);
				render.life(foreground, enemy.life, [start, y - .25]);
				foreground.globalAlpha = 1 * global_alpha;
			}
			time += delay;
		}
	}
	
	final_x = (time - level_time) * 0.3
	
	if(height === undefined) {
		length = enemy.life.length;
		height = pixels( Math.floor(length / 8) * 4 + (length % 8 ? 4 : 0) );
	}
	
	foreground.globalAlpha = (x < 0 ? (x > -1 ? 1 + x : 0) : 1) * global_alpha;
	
	line(foreground, [start, y], [Math.max(start, Math.min(start + final_x, end)), y], "black", 2);
	frame_text(foreground, level.name, [start, y - height - 1], pixels(10), "black", "white", "10");
	
	if(next || level_time < 1) {
		foreground.globalAlpha = (1 - level_time) * global_alpha;
		frame_text(foreground, "NEXT", [start, y - height - 1 - pixels(16)], pixels(8), "red", "white", "bold 8");
	}
	
	foreground.globalAlpha = 1;
	
	return start + final_x;
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
				toolbar.draw_tower_info(foreground, tower, [14, y],
				                   game.gold < tower.price ? "#770000" : undefined);
				
				text(foreground, tower.material, [14 + pixels(1), y + pixels(6)], "black", "bold 10");
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
		text(foreground, "SELL", [x + .5, y + pixels(4)], hover ? "black" : "gray", 10);
		if(hover) {
			icon_text(foreground, [3, 2], game.selected_tower.price,
			          [x - 1 + pixels(6), y + pixels(4)], "black");
		}
	}, [13 + pixels(4), 4], 1.75, .5, game.sell_tower)
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
			
			rect(foreground, [x - 1 + pixels(4), y], 1 - pixels(4), .5, "white");
			icon_text(foreground, [2, 2], load_time, [x - 1 + pixels(6), y + pixels(4)], "#070");
		}
	}, [13 + pixels(4), 4.5], 1.75, 1, game.upgrade_tower)
];

//Buy element
toolbar.buy_element_button = [
	rectangular_button(function(x, y, hover) {

		if(toolbar.hide_elements_timer > 0) {
			var alpha = Math.min(toolbar.hide_elements_timer, 0.1) * 10;
			rect(foreground, [x, y], 1.75, 1, "rgba(230, 230, 230, " + alpha.toFixed(2) + ")");
		}

		var is_selected = hover || toolbar.hide_elements_timer > 0;

		text(foreground, "ELEMENT", [x + pixels(8), y + pixels(5)], is_selected ? "black" : "gray");
		text(foreground, "for ", [x + pixels(6), y + .5 + pixels(2)]);
		icon_text(foreground, [1, 0], "20", [x + .75 + pixels(2), y + .5 + pixels(2)],
		          game.gold < 20 && is_selected ? "#700" : undefined);
		
	}, [13 + pixels(4), 5.5], 1.75, 1, function() {
		if(game.gold >= 20 && toolbar.hide_elements_timer < 0) {
			toolbar.hide_elements_timer = 2;
		}
	})
];

function buy_element_button(x, element, blur_color) {
	return rectangular_button(function(x, y, hover) {
		if(toolbar.hide_elements_timer > 1.9) {
			y -= (toolbar.hide_elements_timer - 1.9) / .1 * .5
		} else if(toolbar.hide_elements_timer < .1) {
			y -= (.1 - toolbar.hide_elements_timer) / .1 * .5;
		}
		
		rect(foreground, [x + pixels(4), y + pixels(4)], pixels(8), pixels(8),
		     hover ? element_color(element) : blur_color);

		if(hover) {
			toolbar.hide_elements_timer = 1.9;
		}
	}, [x, 6.5], .5, .5, function() {
		game.buy_element(element);
	});
}

toolbar.element_buttons = [
	buy_element_button(13 + pixels(4), "f", "#faa"),
	buy_element_button(13.625 + pixels(4), "e", "#afa"),
	buy_element_button(14.25 + pixels(4), "w", "#aaf")
];

/*----------  Speed control buttons  ----------*/

function speed_control_button(n) {
	return {
		x: 12.5 + n * .75, y: 12.25,
		width: .5, height: .5,
		draw: function(x, y, hover) {
			round_rect(foreground, [x, y], .5, .5, pixels(4),
			           hover || game.speed === n ? "#bdbdff" : "white");
			tile(foreground, [3 + n%2 * .5, n === 2 ? .5 : 0], [x, y], .5, .5);
		},
		onclick: function() {
			game.speed = n;
		}
	};
}

toolbar.buttons.push(
	speed_control_button(0),
	speed_control_button(1),
	speed_control_button(2)
);

/*=====  End of BARRA DE HERRAMIENTAS DEL JUEGO  ======*/



















/*========================================================
=            DEFINICIÓN DE ENEMIGOS Y NIVELES            =
========================================================*/

var ENEMIES = {}, TOWERS = [], LEVELS = [];

/*----------  TOWERS  ----------*/

TOWERS.push(
	{
		index: 0,
		element: "n",
		material: "WOOD",
		price: 20,
		upgrade_price: 35,
		load_time: 4,
		range: 2,
		level: 0,
		beam_origin: [16, 21],
		load_region: [10, 18, 12, 9],
		upgrade_offset: [21, 12]
	},
	{
		index: 1,
		element: "n",
		material: "STONE",
		price: 35,
		upgrade_price: 60,
		load_time: 2,
		range: 1,
		level: 0,
		beam_origin: [16, 18],
		load_region: [12, 16, 8, 6],
		upgrade_offset: [21, 8]
	},
	{
		index: 2,
		element: "n",
		material: "STEEL",
		price: 50,
		upgrade_price: 90,
		load_time: 3,
		range: 4,
		level: 0,
		beam_origin: [16, 6],
		load_region: [13, 11, 6, 3],
		upgrade_offset: [20, 4]
	}
);

/*----------  ENEMIES  ----------*/

function extend(proto, obj) {
	return Object.assign(Object.create(proto), obj);
}

	/*----------  01 Beatles  ----------*/

ENEMIES.beatle = {
	//movement speed
	speed: 40,
	//reward
	gold: 4,
	//life
	life: "n",
	//animation fps
	fps: 3.75,
	//frames coordinates in tileset
	frames: [[4, 0], [5, 0]]
};

ENEMIES.beatle_2 = extend(ENEMIES.beatle, { life: "nn", gold: 6 });

ENEMIES.fire_beatle = extend(ENEMIES.beatle, { life: "nf", gold: 8, frames: [[4, 4], [5, 4]] });

ENEMIES.fire_beatle_2 = extend(ENEMIES.fire_beatle, { life: "nnff", gold: 9 });

	/*----------  02 Turtles  ----------*/

ENEMIES.turtle = {
	speed: 20,
	gold: 10,
	life: "ennn",
	fps: 1.5,
	frames: [[6, 4], [7, 4]]
};

ENEMIES.turtle_2 = extend(ENEMIES.turtle, { life: "eennn", gold: 12 });

ENEMIES.turtle_3 = extend(ENEMIES.turtle, { life: "ennne", gold: 12 });

	/*----------  03 Pigeons  ----------*/

ENEMIES.pigeon = {
	speed: 130,
	gold: 5,
	life: "n",
	fps: 5,
	frames: [[7, 2], [8, 2]]
};

ENEMIES.fire_pigeon = extend(ENEMIES.pigeon, { life: "f", gold: 6, frames: [[7, 3], [8, 3]] });

ENEMIES.pigeon_2 = extend(ENEMIES.pigeon, { life: "nn", gold: 10 });

	/*----------  04 Fishes  ----------*/

ENEMIES.fish = {
	speed: 55,
	gold: 10,
	life: "wnnnnnn",
	fps: 8,
	frames: [[8, 1], [9, 1], [10, 1], [10, 0]]
};

ENEMIES.fish_2 = extend(ENEMIES.fish, { life: "wwnnnnnn", gold: 12 });

ENEMIES.earth_fish = extend(ENEMIES.fish, {
	life: "wweennnn",
	gold: 12,
	frames: [[8, 4], [9, 4], [9, 3], [9, 2]]
});

ENEMIES.earth_fish_2 = extend(ENEMIES.earth_fish, { life: "wwweeennnn", gold: 14 });

ENEMIES.fire_fish = extend(ENEMIES.fish, {
	life: "wwwfffnnnn",
	gold: 14,
	frames: [[0, 5], [1, 5], [2, 5], [3, 5]]
});

ENEMIES.fire_fish_2 = extend(ENEMIES.fish, { life: "wfnwfnwfn" });

ENEMIES.boss_fish = {
	speed: 15,
	gold: 70,
	life: "wwwwffffeeeennnnwwwfffeeennn",
	fps: 3,
	frames: [[4, 5], [5, 5], [6, 5], [7, 5]]
};

	/*----------  05 Mosquitoes  ----------*/

ENEMIES.mosquito = {
	speed: 170,
	gold: 3,
	life: "n",
	fps: 15,
	frames: [[8, 5], [9, 5], [10, 5], [9, 5]]
};

ENEMIES.mosquito_2 = extend(ENEMIES.mosquito, { speed: 230, gold: 4 });

ENEMIES.mosquito_3 = extend(ENEMIES.mosquito, { speed: 290, gold: 5 });

ENEMIES.mosquito_4 = extend(ENEMIES.mosquito, { speed: 320, gold: 5 });

ENEMIES.water_mosquito = extend(ENEMIES.mosquito, { life: "w", gold: 4 });

ENEMIES.earth_mosquito = extend(ENEMIES.mosquito, { life: "e", gold: 4 });

ENEMIES.fire_mosquito = extend(ENEMIES.mosquito, { life: "f", gold: 4 });

	/*----------  06 Slugs  ----------*/

ENEMIES.slug_proto = { speed: 35, gold: 16, fps: 3.4 };

ENEMIES.fire_earth_slug = extend(ENEMIES.slug_proto, {
	life: "nnnneeefffeeefffnnnn",
	frames: [[0, 6], [1, 6]]
});

ENEMIES.water_earth_slug = extend(ENEMIES.slug_proto, {
	life: "nnnneeewwweeewwwnnnn",
	frames: [[2, 6], [3, 6]]
});

ENEMIES.water_fire_slug = extend(ENEMIES.slug_proto, {
	life: "nnnnfffwwwfffwwwnnnn",
	frames: [[4, 6], [5, 6]]
});

ENEMIES.earth_fire_slug = extend(ENEMIES.slug_proto, {
	life: "nnnnfffeeefffeeennnn",
	frames: [[6, 6], [7, 6]]
});

ENEMIES.earth_water_slug = extend(ENEMIES.slug_proto, {
	life: "nnnnwwweeewwweeennnn",
	frames: [[8, 6], [9, 6]]
});

ENEMIES.fire_water_slug = extend(ENEMIES.slug_proto, {
	life: "nnnnwwwfffwwwfffnnnn",
	frames: [[10, 6], [11, 6]]
});

ENEMIES.hibrid_fire_slug = extend(ENEMIES.slug_proto, {
	life: "nnnnwwwfffeeefffwwwfffnnnn",
	frames: [[11, 0], [11, 1]]
});

ENEMIES.hibrid_water_slug = extend(ENEMIES.slug_proto, {
	life: "nnnneeewwwfffwwweeewwwnnnn",
	frames: [[11, 2], [11, 3]]
});

ENEMIES.hibrid_earth_slug = extend(ENEMIES.slug_proto, {
	life: "nnnnfffeeewwweeefffnnnn",
	frames: [[11, 4], [11, 5]]
});

ENEMIES.boss_slug = {
	speed: 30,
	gold: 100,
	life: "nnnnnnnnwefwefwwwefwefwwwefwefeewefwefeewefwefffwefwefff",
	fps: 8,
	frames: [[11, 0], [11, 2], [11, 4], [11, 1], [11, 3], [11, 5]]
};

function create_animation_of(enemy) {
	var cx, i;
	
	if(enemy.hasOwnProperty("frames")) {
		enemy.canvas = document.createElement("canvas");
		cx = enemy.canvas.getContext("2d");
		
		enemy.canvas.width = enemy.frames.length * scale;
		enemy.canvas.height = 2 * scale;
		
		//Facing right
		for(i = 0; i < enemy.frames.length; i++) {
			tile(cx, enemy.frames[i], [i, 0]);
		}
		//Facing left
		cx.scale(-1, 1);
		for(i = 0; i < enemy.frames.length; i++) {
			tile(cx, enemy.frames[i], [-i - 1, 1]);
		}
	}
};

function draw_enemies_animation() {
	for(var key in ENEMIES) {
		if(ENEMIES.hasOwnProperty(key)) {
			create_animation_of(ENEMIES[key]);
		}
	}
}

if(tileset.complete) {
	draw_enemies_animation();
} else {
	tileset.addEventListener("load", draw_enemies_animation);
}

/*----------  LEVELS  ----------*/

LEVELS.push(
	{
		number: 1,
		name: "Beatles",
		start_time: 8,
		end_time: 2,
		waves: [
			[4,		ENEMIES.beatle,		3.6], //4 beatles; one every 3.6 seconds
			[6,		ENEMIES.beatle_2,	3.8]
		]
	},
	{
		number: 2,
		name: "Fire beatles",
		start_time: 4,
		end_time: 2,
		waves: [
			[4,		ENEMIES.fire_beatle,	3.8	],
			[5,		ENEMIES.beatle_2,		3.4	],
			[4,		ENEMIES.fire_beatle_2,	3.4	]
		]
	},
	{
		number: 3,
		name: "Turtles",
		start_time: 4,
		end_time: 2,
		waves: [
			[6,		ENEMIES.turtle,		4.3	],
			[5,		ENEMIES.turtle_2,	4	],
			[4,		ENEMIES.turtle_3,	3.7	]
		]
	},
	{
		number: 4,
		name: "Pigeons",
		start_time: 6,
		end_time: 2,
		waves: [
			[10,	ENEMIES.pigeon,			0.7	],
			[10,	ENEMIES.fire_pigeon,	1	],
			[10,	ENEMIES.pigeon,			0.3	],
			[5,		ENEMIES.pigeon_2,		0.6	]
		]
	},
	{
		number: 5,
		name: "Fishes",
		start_time: 6,
		end_time: 4,
		waves: [
			[4,		ENEMIES.fish,			3.8	],
			[3,		ENEMIES.fish_2,			3.8	],
			[2,		ENEMIES.earth_fish,		3.8	],
			[2,		ENEMIES.fish_2,			3.8	],
			[2,		ENEMIES.earth_fish_2,	3.8	],
			[2,		ENEMIES.fire_fish,		3.8	],
			[2,		ENEMIES.earth_fish_2,	3.8	],
			[2,		ENEMIES.fire_fish_2,	3.8	], 10, //wait 10 seconds
			[1, 	ENEMIES.boss_fish,		3.8 ]
		]
	},
	{
		number: 6,
		name: "Mosquitoes",
		start_time: 4,
		end_time: 2,
		waves: [
			[20,	ENEMIES.mosquito,		0.3	], 4,
			[10,	ENEMIES.fire_mosquito,	0.3	], 4,
			[20,	ENEMIES.mosquito_2,		0.26], 4,
			[10,	ENEMIES.earth_mosquito,	0.3	], 4,
			[20,	ENEMIES.mosquito_3,		0.22], 4,
			[10,	ENEMIES.water_mosquito,	0.3	], 4,
			[10,	ENEMIES.mosquito_4,		0.2	], 2,
			[15,	ENEMIES.mosquito_4,		0.2	]
		]
	},
	{
		number: 7,
		name: "Slugs",
		start_time: 6,
		end_time: 0,
		waves: [
			[4,		ENEMIES.fire_earth_slug,	3.2	],
			[4,		ENEMIES.water_earth_slug,	3.2	],
			[4,		ENEMIES.water_fire_slug,	3.2	],
			[4,		ENEMIES.earth_water_slug,	3.2	],
			[4,		ENEMIES.fire_water_slug,	3.2	], 2,
			[4,		ENEMIES.hibrid_fire_slug,	3.2	], 2,
			[4,		ENEMIES.hibrid_water_slug,	3.2	], 2,
			[4,		ENEMIES.hibrid_earth_slug,	3.2	], 10,
			[1,		ENEMIES.boss_slug,			1	]
		]
	}
);

/*=====  End of DEFINICIÓN DE ENEMIGOS Y NIVELES  ======*/

