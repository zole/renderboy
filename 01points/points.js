var bluh = 0;

var focalLength = -554;

var objRotation = 0;


var model = [
	// [ 0, 0, 0, 1 ],
	[ 20, 20, 20, 1 ],
	[ 20, -20, 20, 1 ],
	[ -20, -20, 20, 1 ],
	[ -20, 20, 20, 1 ],
	[ 20, 20, -20, 1 ],
	[ 20, -20, -20, 1 ],
	[ -20, -20, -20, 1 ],
	[ -20, 20, -20, 1 ]
	];

var world2view = [
	[1, 0, 0, 0,],
	[0, 1, 0, 0,],
	[0, 0, 1, 0,],
	[0, 0, 0, 1,],
	];


// 
function matrix4_concat(matrix1, matrix2) {
	var result = new Array(4);

	for (var i = 0; i < 4; i++) {
		result[i] = new Array(4);
		for (var j = 0; j < 4; j++) {
			result[i][j] = 0;
			for (var k = 0; k < 4; k++) {
				result[i][j] += matrix1[i][k] * matrix2[k][j];
			}
		}
	}
	
	return result;
}


function matrix4_transform_vector(matrix, vector) {
	var result = new Array(4);

	for (var i = 0; i < 4; i++) {
		result[i] = 0;
		for (var j = 0; j < 4; j++) {
			result[i] += matrix[i][j] * vector[j];
		}
	}

	return result;
}

window.onload = function() {

	//cx.fillStyle = "rgb(200,0,0)";  
        //cx.fillRect (10, 10, 55, 50);
  
        //cx.fillStyle = "rgba(0, 0, 200, 0.5)";  
        //cx.fillRect (30, 30, 55, 50);

	window.setTimeout(render, 100);
}


function render() {
	var console = document.getElementById('console');

	var canvas = document.getElementById('renderboy');	
	var cx = canvas.getContext('2d');
	
	//cx.fillStyle = 'rgba(0,0,0,1)';
	//cx.fillRect(0, 0, canvas.width, canvas.height);
	// or...?
	//canvas.width = canvas.width;

	var imgd = false;
	var w = canvas.width, h = canvas.height;
/*
	if (cx.createImageData) {
		//console.value += "create";
		imgd = cx.createImageData(w, h);
	} else if (cx.getImageData) {
		//console.value += "get";
		imgd = cx.getImageData(0, 0, w, h);
	} else {
		//console.value += "uh oh";
		imgd = {'width' : w, 'height' : h, 'data' : new Array(w*h*4)};
	}	
*/	
	cx.clearRect(0, 0, w, h);
	cx.fillStyle = "rgb(255, 32, 32)";
	var pix = imgd.data;
	//pix[1000*4] = 255;
	//pix[1000*4+3] = 255;

	var object2world = [
		[1, 0, 0, 0],
		[0, 1, 0, 5],
		[0, 0, 1, -150],
		[0, 0, 0, 1]];

	object2world[0][0] = object2world[2][2] = Math.cos(objRotation);
	object2world[2][0] = -(object2world[0][2] = Math.sin(objRotation));

	// concatenate matrices
	var object2view = matrix4_concat(object2world, world2view);

	// Transform and project points
	for(var i = 0; i < model.length; i++) {
		// Transform one vertex from the world
		var vertex = matrix4_transform_vector(object2view, model[i]);
		// var vertex = world[i];
		var projVertex = new Array(2);
		//projVertex[0] = Math.round(vertex[0] / vertex[2] * projectionRatio * (w / 2.0)) + w / 2;
		//projVertex[1] = Math.round(vertex[1] / vertex[2] * projectionRatio * (w / 2.0)) + h / 2;
		projVertex[0] = Math.round(vertex[0] * (focalLength / vertex[2])) + w / 2;
		projVertex[1] = Math.round(vertex[1] * (focalLength / vertex[2])) + h / 2;
		var size = focalLength / vertex[2] * 5;
		//projVertex[1] = Math.round(vertex[1] / vertex[2] * projectionRatio * (w / 2.0)) + h / 2;


		/*
		var linear = (projVertex[1] * w + projVertex[0]) * 4;
		pix[linear] = 255;
		if (i % 2) {
			pix[linear + 1] = 255;
		}
		pix[linear + 2] = 255;
		pix[linear + 3] = 255;
		*/

		cx.fillRect(projVertex[0] - size / 2, projVertex[1] - size / 2, size, size);
/*
		console.value += "\nVertex: ";
		console.value += vertex;
		console.value += "\nProj: ";
		console.value += projVertex;
*/
	}

	//cx.putImageData(imgd, 0, 0);
	//console.value += bluh;

	bluh++;
	//objRotation += 0.1;
	// if ((Rotation += (M-PI/30.0)) >- (M_PI*E))Rotation -= M-PI*2;
	// 
	objRotation += Math.PI / 90.0;
	if (objRotation >= Math.PI * 2) {
		objRotation -= Math.PI * 2;
	}
	
	window.setTimeout(render, 1000 / 45);
}
