/*
 * Model.js
 */
 
function Model(vertices) {
/*
	if (vertices) {
		this.vertices = new Array(vertices.length);
		for (var i = 0; i < vertices.length; i++) {
			if (vertices[i] instanceof Vector3D) {
				// Copy the vector
				this.vertices[i] = new Vector3D(vertices[i].elements);
			} else {
				// Assume it's an array
				this.vertices[i] = new Vector3D(vertices[i]);
			}
		}
	} else {
		this.vertices = [];
	}
	*/
	
	this.vertices = [];
	// Each entry is an array of indexes into the vertices array
	this.faces = [];
}

Model.prototype = {
	getFace : function(num) {
		var face = this.faces[num];
		return [this.vertices[face[0] - 1], this.vertices[face[1] - 1], this.vertices[face[2] - 1]];
	}
}

Model.Parse = function(obj) {
	var result = new Model();
	
	lines = obj.split("\n");
//	window.console.log(lines);
	//vertex_re = new RegExp("\s*v\s+(\S+)\s+(\S+)\s+(\S+)\s*");
	vertex_re = /^\s*v\s+(\S+)\s+(\S+)\s+(\S+)\s*$/;
	face_re = /^\s*f\s+(.+)$/;
	for (var i = 0; i < lines.length; i++) {
		//window.console.log("{" + lines[i] + "}");
		
		var matches = lines[i].match(vertex_re)
		if (matches) {
			//window.console.log(result);
			result.vertices.push(new Vector3D(parseFloat(matches[1]), parseFloat(matches[2]), parseFloat(matches[3]), 1.0));
			continue;
		}
		
		matches = lines[i].match(face_re);
		if (matches) {
			var face = [];
			var splitline = matches[1].split(/\s+/);
			if (splitline.length != 3) {
				throw new Error("Non-triangle faces not supported");
			}
			for (var j = 0; j < splitline.length; j++) {
				face.push(parseInt(splitline[j]));
			}
			result.faces.push(face);
		}
	}
	
	return result;
};