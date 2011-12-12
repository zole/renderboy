var renderboy = new Renderboy03Wireframe();

function render() {
	renderboy.render();
}
	
function Renderboy03Wireframe() {
	this.fps = 30;
	this.focalLength = -554;
	this.objRotation = 0;

	this.world2view = new Matrix3D(); // identity matrix
	
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

Renderboy03Wireframe.prototype.render = function() {
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
		//window.console.log(face);
		var poly = [this.projectVertex(object2view.multiply(face[0])),
					this.projectVertex(object2view.multiply(face[1])),
					this.projectVertex(object2view.multiply(face[2]))];

		this.drawPoly(poly);

/*		
		// bringin' back the point renderer...
		this.setPoint(poly[0].x, poly[0].y, 255, 255, 255);
		this.setPoint(poly[1].x, poly[1].y, 255, 255, 255);
		this.setPoint(poly[2].x, poly[2].y, 255, 255, 255);
		*/
	}
	

	this.objRotation += Math.PI / 90.0;
	if (this.objRotation >= Math.PI * 2) {
		this.objRotation -= Math.PI * 2;
	}
	
	this.cx.putImageData(this.imgd, 0, 0);
	
	window.setTimeout(render, 1000 / this.fps);
}


Renderboy03Wireframe.prototype.projectVertex = function(vertex) {
	return {
		x : Math.round(vertex.x(0) * (this.focalLength / vertex.z())) + this.imgd.width / 2,
		y : Math.round(vertex.y(1) * (this.focalLength / vertex.z())) + this.imgd.height / 2,
	};
	//var size = this.focalLength / vertex.z() * 1;

	//return projVertex
}


Renderboy03Wireframe.prototype.setPoint = function(x, y, r, g, b) {
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
Renderboy03Wireframe.prototype._drawWideLine = function(x0, y0, deltaX, deltaY, xDir) {
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
Renderboy03Wireframe.prototype._drawTallLine = function(x0, y0, deltaX, deltaY, xDir) {
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



Renderboy03Wireframe.prototype.drawLine = function(x0, y0, x1, y1) {
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


Renderboy03Wireframe.prototype.drawPoly = function(vertices) {
	this.drawLine(vertices[0].x, vertices[0].y, vertices[1].x, vertices[1].y);
	this.drawLine(vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y);
	this.drawLine(vertices[2].x, vertices[2].y, vertices[0].x, vertices[0].y);
}
