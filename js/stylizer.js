(function(){
	var palette, backup; // Stores the current colour palette and a backup copy in case we want to reset
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
		// Add colours to palette
		for(var ii = 0; ii < p[0].colors.length; ii++){
			palette.push(new Colour(p[0].colors[ii]));
			backup.push(new Colour(p[0].colors[ii]));
		}
		// Add black and white to all palettes
		palette.push(new Colour("ffffff"));
		palette.push(new Colour("000000"));
		// Force re-rendering layout with new palette
		updateColours();
	}
	// Apply updated styles using the current palette
	var updateColours = function(){
		// Apply styles
		document.body.style.background = palette[0].stringify("rgb");
		$(".navbar-inner").css("background-color", palette[2].stringify("rgb"));
		var anchors = document.getElementsByTagName("a");
		$(".navbar-inner a").css("color", palette[3].stringify("rgb"));
		$(".brand").css("color", palette[1].stringify("rgb"));
		// Update onscreen palette
		$("#colours").html("");
		for(var ii = 0; ii < palette.length; ii++){
			var el = $("<div class=\"colour\"></div>");
			el.css("background", palette[ii].stringify("rgb"));
			el.css("color", palette[ii].inverse().stringify("rgb"));
			$("#colours").append(el);
		}
		setFormat(format);
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
	// Reset palette
	var reset = function(){
		palette = [];
		for(var ii = 0; ii < backup.length; ii++){
			palette[ii] = new Colour(backup[ii].stringify("rgb"));
		}
		updateColours();
	}
	// Set colour format
	var format = "rgb";
	var setFormat = function(f){
		$("#palette button").removeClass("active");
		$("#" + f).addClass("active");
		format = f;
		for(var ii = 0; ii < palette.length; ii++){
			$($("#colours div")[ii]).html((format == "hex" ? "#" : "") + palette[ii].stringify(format));
		}
	}
	window.onload = function(){
		// fetchPalette(); // Fetch initial palette
		// Initial palette
		// A little hacky as we're simulating some colourlovers json
		setPalette({0:{
			colors: [
				"ddd",
				"fff",
				"666",
				"eee"
			]
		}});
		// Tool event handlers
		$("#random").click(fetchPalette);
		$("#shuffle").click(shuffleColours);
		$("#hue-add").click(hueIncrease);
		$("#hue-subtract").click(hueDecrease);
		$("#saturation-add").click(saturate);
		$("#saturation-subtract").click(desaturate);
		$("#lightness-add").click(lighten);
		$("#lightness-subtract").click(darken);
		$("#reset").click(reset);
		$("#hex").click(function(){ setFormat("hex") });
		$("#rgb").click(function(){ setFormat("rgb") });
		$("#hsl").click(function(){ setFormat("hsl") });
	}
})();