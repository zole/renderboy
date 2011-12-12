/*
 * Vector3D
 */

function Vector3D(x, y, z, w) {
	if (arguments.length == 4) {
		this.elements = [x, y, z, w];
	} else if (arguments.length == 1 && x.length == 4) {
		this.elements = x.slice();
	} else if (arguments.length == 0) {
		this.elements = [0, 0, 0, 1];
	} else {
		return null;
	}
}

Vector3D.prototype = {
	x : function() { return this.elements[0]; },
	y : function() { return this.elements[1]; },
	z : function() { return this.elements[2]; },
	w : function() { return this.elements[3]; },
	get : function(index) { return this.elements[index]; },
	toString : function() { return "{" + this.x() + "," + this.y() + "," + this.z() + "," + this.w() + "}"; },

	length : function() {
		return Math.sqrt(this.elements[0] * this.elements[0] +
			this.elements[1] * this.elements[1] +
			this.elements[2] * this.elements[2]);
	},
	
	normalize : function() {
		var myLength = this.length();
		return new Vector3D(this.elements[0] / myLength,
			this.elements[1] / myLength,
			this.elements[2] / myLength,
			1);
	},
	
	// Subtract otherVector from this one and return the result
	subtract : function(otherVector) {
		return new Vector3D(this.elements[0] - otherVector.elements[0],
			this.elements[1] - otherVector.elements[1],
			this.elements[2] - otherVector.elements[2],
			1);
			// TODO: is it OK to ignore the W component here?
	},
	
	dotProduct : function(otherVector) {
		return this.x() * otherVector.x() +
			this.y() * otherVector.y() +
			this.z() * otherVector.z();
	},
	
	crossProduct : function(otherVector) {
		return new Vector3D(
			this.y() * otherVector.z() - this.z() * otherVector.y(),
			this.z() * otherVector.x() - this.x() * otherVector.z(),
			this.x() * otherVector.y() - this.y() * otherVector.x(),
			1);
	},
};


/*
 * Matrix3D
 */

function Matrix3D(elements) {
	if (elements) {
		this.elements = elements.slice();
	} else {
		this.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
			];
	}
} 

Matrix3D.prototype = {
	get: function(row, col) {
		return this.elements[row * 4 + col];
	},

	set: function(row, col, value) {
		this.elements[row * 4 + col] = value;
	},

	// Multiply this matrix by multiplier and return the result
	multiply: function(multiplier) {
		if (multiplier instanceof Matrix3D) {
			// Concatenate 
			var result = new Matrix3D();
	
			for (var i = 0; i < 4; i++) {
				for (var j = 0; j < 4; j++) {
					result.elements[i * 4 + j] = 0;
					for (var k = 0; k < 4; k++) {
						result.elements[i * 4 + j] += this.get(i, k) * multiplier.get(k, j);
					}
				}
			}
	
			return result;
		} else if (multiplier instanceof Vector3D) {
			var result = new Array(4);

			for (var i = 0; i < 4; i++) {
				result[i] = 0;
				for (var j = 0; j < 4; j++) {
					result[i] += this.get(i, j) * multiplier.get(j);
				}
			}

			return new Vector3D(result);
		} else {
			return null;
		}
	},
	
	toString : function() {
		return "{" + this.elements.slice(0, 4) + "}\n" +
			"{" + this.elements.slice(4, 8) + "}\n" +
			"{" + this.elements.slice(8, 12) + "}\n" +
			"{" + this.elements.slice(12, 16) + "}\n";
	}
};

// Creates a translation matrix 
Matrix3D.Translation = function(x, y, z) {
	var result = new Matrix3D();
	result.elements[0 * 4 + 3] = x; // [0][3]
	result.elements[1 * 4 + 3] = y; // [1][3]
	result.elements[2 * 4 + 3] = z; // [2][3]
		
	return result;
};

// Creates a scaling matrix
Matrix3D.Scaling = function(x, y, z) {
	var result = new Matrix3D();
	result.elements[0 * 4 + 0] = x; // [0][0]
	result.elements[1 * 4 + 1] = y; // [1][1]
	result.elements[2 * 4 + 2] = z; // [2][2]
	
	return result;
}
	
// Creates a rotation matrix around the Y axis
Matrix3D.RotationY = function(radians) {
	var result = new Matrix3D();
	result.elements[0 * 4 + 0] = result.elements[2 * 4 + 2] = Math.cos(radians); // [0,0] [2,2]
	result.elements[2 * 4 + 0] = -(result.elements[0 * 4 + 2] = Math.sin(radians));

	return result;
};
