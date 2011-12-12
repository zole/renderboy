/*
 * Model.js
 */
 
function Model(vertices) {
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
	
	window.console.log(this.vertices.toString());
}

Model.Parse = function(obj) {
	var result = new Model();
	
	lines = obj.split("\n");
//	window.console.log(lines);
	//vertex_re = new RegExp("\s*v\s+(\S+)\s+(\S+)\s+(\S+)\s*");
	vertex_re = /\s*v\s+(\S+)\s+(\S+)\s+(\S+)\s*$/;
	for (var i = 0; i < lines.length; i++) {
		//window.console.log("{" + lines[i] + "}");
		
		var matches = lines[i].match(vertex_re)
		if (matches) {
			//window.console.log(result);
			result.vertices.push(new Vector3D(parseFloat(matches[1]), parseFloat(matches[2]), parseFloat(matches[3]), 1.0));
		} else {
			// warn
		}
	}
	
	window.console.log(result.vertices.toString());
	return result;
};