/*
 * Basic class to convert colour values in various forms to a generic object
 * with some handy utility methods.
 *
 * wb@collectivecognition.com
 * http://github.com/collectivecognition/colour.js
 *
 */
(function(){
	// Some handy, dandy regular expressions for various colour processing tasks
	var regex = {
		hex: 		/^[#]?(([\da-f]{3}){1,2})$/i,
		rgb: 		/^[\s]*rgb\([\s]*([\d]+[%]?)[\s]*,[\s]*([\d]+[%]?)[\s]*,[\s]*([\d]+[%]?)[\s]*\)[\s]*$/i,
		rgba: 		/^[\s]*rgba\([\s]*([\d]+[%]?)[\s]*,[\s]*([\d]+[%]?)[\s]*,[\s]*([\d]+[%]?)[\s]*,[\s]*([\d]*[.]?[\d]+)[\s]*\)[\s]*$/i,
		hsl:		/^[\s]*hsl\([\s]*([\d]{1,3})[\s]*,[\s]*([\d]{1,3}%)[\s]*,[\s]*([\d]{1,3}%)[\s]*\)[\s]*$/i,
		hsla:		/^[\s]*hsla\([\s]*([\d]{1,3})[\s]*,[\s]*([\d]{1,3}%)[\s]*,[\s]*([\d]{1,3}%)[\s]*,[\s]*([\d]*[.]?[\d]+)[\s]*\)[\s]*$/i,
		base10: 	/^[\d]+$/,
		float: 		/^[\d]*[.]?[\d]+$/,
		percent: 	/^[\d]+%$/,
		hexDigit: 	/[\da-f]{1,2}/i
	};
	// Process a hex string and return a nice standardized object
	var parseHex = function(hex){
		if(regex.hex.test(hex)){
			hex = regex.hex.exec(hex)[1];
		}else{
			hex = "000000";
		}
		if(hex.length === 3){
			var pad = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			hex = pad;
		}
		return {
			r: parseInt(hex.slice(0, 2), 16),
			g: parseInt(hex.slice(2, 4), 16),
			b: parseInt(hex.slice(4, 6), 16),
			a: 1.0
		};
	}
	// Process an RGBA string and return a nice standardized object
	var parseRGBA = function(rgba){
		// Parse string into an array if it's a valid RGB or RGBA string, or just initialized with a zeroed out array
		if(regex.rgba.test(rgba)){
			rgba = regex.rgba.exec(rgba).slice(1, 5);
		}else if(regex.rgb.test(rgba)){
			rgba = regex.rgb.exec(rgba).slice(1, 4);
			rgba.push(1.0); // Add default alpha value to array
		}else{
			rgba = [0, 0, 0, 1.0];
		}
		// Return a pretty object
		return {
			r: parseAny(rgba[0]),
			g: parseAny(rgba[1]),
			b: parseAny(rgba[2]),
			a: parseNumber(rgba[3], 1)
		}
	};
	// Process an HSLA string and return a nice standardized object
	var parseHSLA = function(hsla){
		// Parse string into an array if it's a valid HSL or HSLA string, or just initialize with a zeroed out array
		// There's some redundancy with the regex tests but it makes the code cleaner
		if(regex.hsla.test(hsla)){
			hsla = regex.hsla.exec(hsla).slice(1, 5);
		}else if(regex.hsl.test(hsla)){
			hsla = regex.hsl.exec(hsla).slice(1, 4);
			hsla.push(1.0); // Add default alpha value to array
		}else{
			hsla = [0, 0, 0, 1.0];
		}
		// Return a pretty object
		return {
			h: parseNumber(hsla[0], 360),
			s: parsePercent(hsla[1]),
			l: parsePercent(hsla[2]),
			a: parseNumber(hsla[3], 1)
		}
	}
	// Misc value parsing functions
	var parseHexDigit = function(hexDigit){
		hexDigit += "";
		if(!regex.hexDigit.test(hexDigit)) hexDigit = "00";
		if(hexDigit.length == 1) hexDigit += hexDigit;
		return parseInt(hexDigit, 16);
	}
	var parseNumber = function(number, max){
		if(!(regex.base10.test(number) || regex.float.test(number))) number = 0; // Only allow base 10 numbers and floats, default to 0
		return Math.min(parseFloat(number), max);
	}
	var parsePercent = function(percent){
		if(!regex.percent.test(percent)) percent = 0; // Only allow valid percent values, default to 0
		return Math.min(parseFloat(percent), 100) / 100;
	}
	var parseAny = function(val){ // Parses a value that is either a hex digit, a number or a percentage
		return regex.percent.test(val) ? parsePercent(val) : (regex.base10.test(val) || regex.float.test(val)) ? parseNumber(val, 255) : regex.hexDigit.test(val) ? parseHex(val) : 0;
	}
	// Convert an RGBA object to HSLA
	// Reimplementation of http://www.cs.rit.edu/~ncs/color/t_convert.html
	var rgbaToHSLA = function(rgba){
		var r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255, a = rgba.a;
		var min = Math.min(r, g, b), max = Math.max(r, g, b);
		var h, s, l = max;
		var delta = max - min;
		if(max != 0){
			s = delta / max;
			if(r == max){
				h = (g - b) / delta;
			}else if(g == max){
				h = 2 + (b - r) / delta;
			}else{
				h = 4 + (r - g) / delta;
			}
			h *= 60;
			if(h < 0) h += 360;
		}else{
			h = -1;
			s = 0;
		}
		return {h: h, s: s, l: l, a: rgba.a};
	};
	// Convert an HSLA object to RGBA
	// Reimplementation of http://www.cs.rit.edu/~ncs/color/t_convert.html
	var hslaToRGBA = function(hsla){
		var h = hsla.h, s = hsla.s, l = hsla.l;
		var i, f, p, q, t, r, g, b;
		if(s === 0){
			r = g = b = l;
		}else{
			h /= 60;
			i = Math.floor(h);
			f = h - i;
			p = l * (1 - s);
			q = l * (1 - s * f);
			t = l * (1 - s * (1 - f));
			switch(i){
				case 0:
					r = l;
					g = t;
					b = p;
					break;
				case 1:
					r = q;
					g = l;
					b = p;
					break;
				case 2:
					r = p;
					g = l;
					b = t;
					break;
				case 3:
					r = p;
					g = q;
					b = l;
					break;
				case 4:
					r = t;
					g = p;
					b = l;
					break;
				default:
					r = l;
					g = p;
					b = q;
					break;
			}
		}
		return {r: Math.floor(r * 256), g: Math.floor(g * 256), b: Math.floor(b * 256), a: hsla.a};
	}
	// Contructor
	Colour = function(colour){
		// Private variables to store color values
		var rgba = {r:0,g:0,b:0,a:1.0};
		var hsla = {h:0.0,s:0.0,l:0.0,a:1.0};
		// Private methods for updating the various colour values when something changes
		var updatedRGBA = function(){
			hsla = rgbaToHSLA(rgba);
		}
		var updatedHSLA = function(){
			rgba = hslaToRGBA(hsla);
		}
		// Determine what sort of colour value we're dealing with and parse it into an RGBA
		if(regex.hex.test(colour)){
			var hex = regex.hex.exec(colour)[1]; // Strips hash symbol if present
			rgba = parseHex(hex);
			updatedRGBA();
		}else if(regex.rgb.test(colour)){
			rgba = parseRGBA(colour);
			updatedRGBA();
		}else if(regex.rgba.test(colour)){
			rgba = parseRGBA(colour);
			updatedRGBA();
		}else if(regex.hsl.test(colour)){
			hsla = parseHSLA(colour);
			updatedHSLA();
		}else if(regex.hsla.test(colour)){
			hsla = parseHSLA(colour);
			updatedHSLA();
		}else{
			// FIXME
			// Failed to parse
		}
		// Public getters / setters (all chainable)
		this.r = function(val){ if(val != undefined){ rgba.r = parseAny(val); updatedRGBA(); return(this); }else{ return rgba.r; } }
		this.g = function(val){ if(val != undefined){ rgba.g = parseAny(val); updatedRGBA(); return(this); }else{ return rgba.g; } }
		this.b = function(val){ if(val != undefined){ rgba.b = parseAny(val); updatedRGBA(); return(this); }else{ return rgba.b; } }
		this.a = function(val){ if(val != undefined){ rgba.a = parseAny(val); updatedRGBA(); return(this); }else{ return rgba.a; } }
		this.h = function(val){ if(val != undefined){ hsla.h = parseNumber(val, 360); updatedHSLA(); return(this); }else{ return hsla.h } }
		this.s = function(val){ if(val != undefined){ hsla.s = parseNumber(val, 1); updatedHSLA(); return(this); }else{ return hsla.s } }
		this.l = function(val){ if(val != undefined){ hsla.l = parseNumber(val, 1); updatedHSLA(); return(this); }else{ return hsla.l } }
		// Public method to stringify the colour in various ways
		this.stringify = function(way){
			switch(way.toLowerCase()){
				case "hsl":
					return "hsl(" + Math.floor(hsla.h) + ", " + Math.floor(hsla.s * 100) + "%, " + Math.floor(hsla.l * 100) + "%)";
					break;
				case "hsla":
					return "hsla(" + Math.floor(hsla.h) + ", " + Math.floor(hsla.s * 100) + "%, " + Math.floor(hsla.l * 100) + "%, " + hsla.a + ")";
					break;
				case "rgb":
					return "rgb(" + Math.floor(rgba.r) + ", " + Math.floor(rgba.g) + ", " + Math.floor(rgba.b) + ")";
					break;
				case "rgba":
					return "rgba(" + Math.floor(rgba.r) + ", " + Math.floor(rgba.g) + ", " + Math.floor(rgba.b) + ", " + rgba.a + ")";
					break;
				case "hex":
				default:
					return (rgba.r.toString(16).length == 1 ? "0" : "") + rgba.r.toString(16) + (rgba.g.toString(16).length == 1 ? "0" : "") + rgba.g.toString(16) + (rgba.b.toString(16).length == 1 ? "0" : "") + rgba.b.toString(16);
					break;
				case "name":
					// TODO
					break;
			}
		}
		// Public method to calculate and return the inverse of a colour
		this.inverse = function(){
			var colour = new Colour();
			colour.r(255 - rgba.r);
			colour.g(255 - rgba.g);
			colour.b(255 - rgba.b);
			colour.a(rgba.a);
			return colour;
		}
	};
})();