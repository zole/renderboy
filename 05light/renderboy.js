var renderboy = new Renderboy05Light();

function render() {
	renderboy.render();
}
	
function Renderboy05Light() {
	this.fps = 60;
	this.focalLength = -554;
	this.objRotation = 0;

	this.world2view = new Matrix3D(); // identity matrix
	
	this.lightNormal = (new Vector3D(0, 0, -1, 1)).normalize();
	
	var els = document.getElementsByTagName("script");
	var path = els[0].src.match(new RegExp("^.+/"))[0];

	var that = this;
	window.onload = function() {	
		window.setTimeout(render, 500);
		
		that.canvas = document.getElementById('renderboy');	
		that.cx = that.canvas.getContext('2d');
		
		var gourdiv = document.getElementById("gourd");
		that.model = Model.Parse(gourdiv.childNodes[0].nodeValue);
	}
}

Renderboy05Light.prototype.render = function() {
	var w = this.canvas.width, h = this.canvas.height;

	var that = this;
	if (that.cx.createImageData) {
		that.imgd = that.cx.createImageData(that.canvas.width, that.canvas.height);
	} else if (that.cx.getImageData) {
		that.imgd = that.cx.getImageData(0, 0, that.canvas.width, that.canvas.height);
	} else {
		//console.value += "uh oh";
		that.imgd = {'width' : that.canvas.width, 'height' : h, 'data' : new Array(that.canvas.width * that.canvas.height *4)};
	}
		
	var object2world = new Matrix3D();
	
	// Scale, then rotate, then translate
	var object2world = Matrix3D.Translation(0, 0, -100).multiply(Matrix3D.RotationY(-this.objRotation)).multiply(Matrix3D.Scaling(20,20,20));
	

	// concatenate matrices
	var object2view = object2world.multiply(this.world2view);


	// Draw the model's faces
	for (var i = 0; i < this.model.faces.length; i++) {
		var face = this.model.getFace(i);
	
		var poly = [object2view.multiply(face[0]),
					object2view.multiply(face[1]),
					object2view.multiply(face[2])];
					
		var projectedPoly = [this.projectVertex(poly[0]),
					this.projectVertex(poly[1]),
					this.projectVertex(poly[2])];


		var normal = this.calculateNormal(poly);
		var cosTheta = Math.max(0, normal.dotProduct(this.lightNormal));
		
		//this.drawPoly(poly, 0, 255 * Math.max(0, cosTheta), 0);
		if (cosTheta > 0.0) {
			this.drawFilledPoly(projectedPoly, Math.round(160 * cosTheta), Math.round(64 * cosTheta), Math.round(32 * cosTheta));
		}
		//break;
/*		
		// bringin' back the point renderer...
		this.setPoint(poly[0].x, poly[0].y, 255, 255, 255);
		this.setPoint(poly[1].x, poly[1].y, 255, 255, 255);
		this.setPoint(poly[2].x, poly[2].y, 255, 255, 255);
		*/
	}
	

	this.objRotation += Math.PI / 90.0 * (30 / this.fps);
	if (this.objRotation >= Math.PI * 2) {
		this.objRotation -= Math.PI * 2;
	}
	
	this.cx.putImageData(this.imgd, 0, 0);
	
	window.setTimeout(render, 1000 / this.fps);
}


Renderboy05Light.prototype.projectVertex = function(vertex) {
	return {
		x : Math.round(vertex.x(0) * (this.focalLength / vertex.z())) + this.imgd.width / 2,
		y : Math.round(vertex.y(1) * (this.focalLength / vertex.z())) + this.imgd.height / 2,
	};
	//var size = this.focalLength / vertex.z() * 1;

	//return projVertex
}


Renderboy05Light.prototype.setPoint = function(x, y, r, g, b) {
	if (x < 0 || y < 0) {
		return;
	}
	
	if (x >= this.imgd.width || y >= this.imgd.height) {
		return;
	}
	
	var index = this.imgd.width * 4 * y + x * 4;
	this.imgd.data[index] = r;
	this.imgd.data[index + 1] = g;
	this.imgd.data[index + 2] = b;
	this.imgd.data[index + 3] = 255;
}


// draw a line where ABS(deltaX) >= deltaY
Renderboy05Light.prototype._drawWideLine = function(x0, y0, deltaX, deltaY, xDir) {
	var deltaYx2 = deltaY * 2;
	var deltaYx2minusDeltaXx2 = deltaYx2 - Math.round(deltaX * 2);
	var errorTerm = deltaYx2 - Math.round(deltaX);
	
	this.setPoint(x0, y0, 0, 255, 0);
	while (deltaX--) {
		if (errorTerm >= 0) {
			y0++;
			errorTerm += deltaYx2minusDeltaXx2;
		} else {
			errorTerm += deltaYx2;
		}
		x0 += xDir;
		this.setPoint(x0, y0, 0, 255, 0);
	}
}


// draw a line where ABS(deltaX) >= deltaY
Renderboy05Light.prototype._drawTallLine = function(x0, y0, deltaX, deltaY, xDir) {
	var deltaXx2 = deltaX * 2;
	var deltaXx2minusDeltaYx2 = deltaXx2 - Math.round(deltaY * 2);
	var errorTerm = deltaXx2 - Math.round(deltaY);
	
	this.setPoint(x0, y0, 0, 255, 0);
	while (deltaY--) {
		if (errorTerm >= 0) {
			x0 += xDir;
			errorTerm += deltaXx2minusDeltaYx2;
		} else {
			errorTerm += deltaXx2;
		}
		y0++;
		this.setPoint(x0, y0, 0, 255, 0);
	}
}



Renderboy05Light.prototype.drawLine = function(x0, y0, x1, y1) {
	if (y0 > y1) {
		// Swap the coordinates so that line always goes in positive Y
		var temp = y0;
		y0 = y1;
		y1 = temp;
		temp = x0;
		x0 = x1;
		x1 = temp;
	}
	
	var deltaX = x1 - x0;
	var deltaY = y1 - y0;
	if (deltaX > 0) {
		if (deltaX > deltaY) {
			this._drawWideLine(x0, y0, deltaX, deltaY, 1);
		} else {
			this._drawTallLine(x0, y0, deltaX, deltaY, 1);
		}
	} else {
		deltaX = -deltaX;
		if (deltaX > deltaY) {
			this._drawWideLine(x0, y0, deltaX, deltaY, -1);
		} else {
			this._drawTallLine(x0, y0, deltaX, deltaY, -1);
		}
	}	
}


Renderboy05Light.prototype.drawPoly = function(vertices) {
	this.drawLine(vertices[0].x, vertices[0].y, vertices[1].x, vertices[1].y);
	this.drawLine(vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y);
	this.drawLine(vertices[2].x, vertices[2].y, vertices[0].x, vertices[0].y);
}


Renderboy05Light.prototype.calculateNormal = function(vertices) {
	var dirVector1 = vertices[1].subtract(vertices[0]);
	var dirVector2 = vertices[2].subtract(vertices[1]);
	
	//return dirVector1.crossProduct(dirVector2).normalize();
	return dirVector2.crossProduct(dirVector1).normalize();
}

Renderboy05Light.prototype.drawFilledPoly = function(vertices, red, green, blue) {
	// NOTE: only triangles are supported
	
	// 1. Find the top and bottom of the polygon
	var indexMaxY = 0;
	var minY = vertices[0].y;
	var maxY = minY;
	for (var i = 1; i < vertices.length; i++) {
		if (vertices[i].y < minY) {
			minY = vertices[i].y;
		} else if (vertices[i].y >= maxY) {
			maxY = vertices[i].y;
			indexMaxY = i;
		}
	}
	if (minY == maxY) {
		return; // Don't draw 0-height polygons
	}
	
	var indexLeftTop = 0;
	var indexRightTop = 0;

	// Find the first and last points in the vertices list that are on the top edge
	// TODO: double check
	for (i = vertices.length - 1; i >= 0; i--) {
		if (vertices[i].y == minY) {
			indexRightTop = i;
			break;
		}
	}
	for (i = 0; i < vertices.length; i++) {
		if (vertices[i].y == minY) {
			indexLeftTop = i;
			break;
		}
	}
	
	var leftEdgeDir = -1;
	
	// Figure out which direction to move from the top vertex/vertices to find the left and right sides
	var topIsFlat = (vertices[indexLeftTop].x != vertices[indexRightTop].x) ? 1 : 0;
	if (topIsFlat) {
		if (vertices[indexLeftTop].x > vertices[indexRightTop].x) {
			// Swap to make indexLeftTop have the smaller x value
			leftEdgeDir = 1;
			var temp = indexLeftTop;
			indexLeftTop = indexRightTop;
			indexRightTop = temp;
		}
	} else {
		// indexLeftTop is now going to be one index to the right of the left edge vertex
		// same with indexRightTop
		
		var indexNext = (indexRightTop + 1) % vertices.length;
		var indexPrev = (indexLeftTop - 1 + vertices.length) % vertices.length;
		// delta from top to the next adjacent vertex
		var deltaToNext = { x : vertices[indexNext].x - vertices[indexLeftTop].x,
			y : vertices[indexNext].y - vertices[indexLeftTop].y, };
		var deltaToPrev = { x : vertices[indexPrev].x - vertices[indexLeftTop].x,
			y : vertices[indexPrev].y - vertices[indexLeftTop].y, };
		if (deltaToNext.x * deltaToPrev.y - deltaToNext.y * deltaToPrev.x < 0) {
			leftEdgeDir = 1;
			// this swap only matters if we have two overlapping points at the top, I think
			var temp = indexLeftTop;
			indexLeftTop = indexRightTop;
			indexRightTop = temp;
		}
	}
		
	var edgesLeft = {};
	var edgesRight = {};
	var toDrawMinY = minY + 1 - topIsFlat;
	var toDrawMaxY = maxY - 1;
	
	// Start working in the direction of leftEdgeDir from indexLeftTop to find the next left point
	var indexCurrent = indexLeftTop;
	var indexPrev = indexLeftTop;
	do {
		// Advance or retreat the current index
		if (leftEdgeDir > 0) {
			indexCurrent = (indexCurrent + 1) % vertices.length;
		} else {
			indexCurrent = (indexCurrent - 1 + vertices.length) % vertices.length;
		}
		
		this._scanEdge(vertices[indexPrev], vertices[indexCurrent], edgesLeft, 0);
		indexPrev = indexCurrent;
	} while (indexCurrent != indexMaxY);
	
	// Start working the other direction, from indexRightTop, to find the next right point
	var indexCurrent = indexRightTop;
	var indexPrev = indexRightTop;
	do {
		// This time we go the opposite way
		if (leftEdgeDir < 0) {
			indexCurrent = (indexCurrent + 1) % vertices.length;
		} else {
			indexCurrent = (indexCurrent - 1 + vertices.length) % vertices.length;
		}
	
		this._scanEdge(vertices[indexPrev], vertices[indexCurrent], edgesRight, 0);
		indexPrev = indexCurrent;
	} while (indexCurrent != indexMaxY);

	// Now draw!
	var lineWidthInBytes = this.imgd.width * 4;
	for (var y = toDrawMinY ; y <= toDrawMaxY ; y++) {
		for (var x = edgesLeft[y] ; x <= edgesRight[y] ; x++) {
			//this.setPoint(x, y, red, green, blue);
			var index = lineWidthInBytes * y + x * 4;
			this.imgd.data[index] = red;
			this.imgd.data[index + 1] = green;
			this.imgd.data[index + 2] = blue;
			this.imgd.data[index + 3] = 255;
		}
	}
}


Renderboy05Light.prototype._scanEdge = function(point1, point2, edgeObj, subtract) {
	// subtract "subtract" from all X points
	var deltaX = point2.x - point1.x;
	var deltaY = point2.y - point1.y;
	
	if (deltaY <= 0) {
		return;
	}
	
	var inverseSlope = deltaX / deltaY;
	for (var y = point1.y ; y < point2.y ; y++) {
		edgeObj[y] = point1.x + Math.ceil((y - point1.y) * inverseSlope);
	}
}