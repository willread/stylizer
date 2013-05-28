(function(){
	var palette, backup; // Stores the current colour palette and a backup copy so we can retain saturation
	// Fetch a new random palette from colourlovers
	var fetchPalette = function(){
		fetchJSONP("http://www.colourlovers.com/api/palettes/random?format=json&jsonCallback=setPalette");
	}
	// Fetch JSONP from colourlovers
	var fetchJSONP = function(s){
		var script = document.createElement("script");
		script.src = s;
		document.body.appendChild(script);
	}
	// Handle a new colourlovers palette
	setPalette = function(p){ // Global so the JSONP callback can find it
		palette = [], backup = [];
		// Add colors to palette
		for(var ii = 0; ii < p[0].colors.length; ii++){
			palette.push(new Colour(p[0].colors[ii]));
		}
		// Add black and white to all palettes
		palette.push(new Colour("ffffff"));
		palette.push(new Colour("000000"));
		// Force re-rendering layout with new palette
		updateColours();
	}
	// Apply updated styles using the current palette
	var updateColours = function(){
		document.body.style.background = palette[0].stringify("rgb");
		document.getElementById("header").style.color = palette[1].stringify("rgb");
		document.getElementById("header-input").style.color = palette[1].stringify("rgb");
		document.getElementById("menu").style.background = palette[2].stringify("rgb");
		var anchors = document.getElementsByTagName("a");
		for(var a = 0; a < anchors.length; a++){
			anchors[a].style.color = palette[3].stringify("rgb");
		}
	}
	// Randomly shuffle the current palette
	var shuffleColours = function(){
		palette.sort(function(){ return 0.5 - Math.random(); });
		updateColours();
	}
	// Lighten all colours
	var lighten = function(){
		for(var p in palette){
			var l = palette[p].l();
			palette[p].l(l+0.1);
		}
		updateColours();
	}
	// Darken all colours
	var darken = function(){
		for(var p in palette){
			var l = palette[p].l();
			palette[p].l(l-0.1);
		}
		updateColours();
	}
	// Increase saturation of all colours
	var saturate = function(){
		for(var p in palette){
			var s = palette[p].s();
			palette[p].s(s+0.1);
		}
		updateColours();
	}
	// Decrease saturation of all colours
	var desaturate = function(){
		for(var p in palette){
			var s = palette[p].s();
			palette[p].s(s-0.1);
		}
		updateColours();
	}
	// Shift hue of all colours forward
	var hueIncrease = function(){
		for(var p in palette){
			var h = palette[p].h();
			palette[p].h(h+10);
		}
		updateColours();
	}
	// Shift hue of all colours backward
	var hueDecrease = function(){
		for(var p in palette){
			var h = palette[p].h();
			palette[p].h(h-10);
		}
		updateColours();
	}
	window.onload = function(){
		fetchPalette(); // Fetch initial palette
		// Generate menu
		var tools = document.getElementById("tools");
		var buttons = {
			"Random Palette": fetchPalette,
			"Shuffle Colours": shuffleColours,
			"Lighten": lighten,
			"Darken": darken,
			"Saturate": saturate,
			"Desaturate": desaturate,
			"Increase Hue": hueIncrease,
			"Decrease Hue": hueDecrease
		}
		for(var key in buttons){
			var el = document.createElement("button");
			el.onclick = buttons[key];
			el.innerHTML = key;
			tools.appendChild(el);
		}
	}
})();