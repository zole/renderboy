var renderboy = new Renderboy02LoadingModels();

function render() {
	renderboy.render();
}
	
function Renderboy02LoadingModels() {
	this.focalLength = -554;
	this.objRotation = 0;
	
	/*
	this.model = [
		// [ 0, 0, 0, 1 ],
		new Vector3D([ 20, 20, 20, 1 ]),
		new Vector3D([ 20, -20, 20, 1 ]),
		new Vector3D([ -20, -20, 20, 1 ]),
		new Vector3D([ -20, 20, 20, 1 ]),
		new Vector3D([ 20, 20, -20, 1 ]),
		new Vector3D([ 20, -20, -20, 1 ]),
		new Vector3D([ -20, -20, -20, 1 ]),
		new Vector3D([ -20, 20, -20, 1 ])
		];
		*/
		
/*
	this.model = new Model([
		new Vector3D([ 20, 20, 20, 1 ]),
		new Vector3D([ 20, -20, 20, 1 ]),
		new Vector3D([ -20, -20, 20, 1 ]),
		new Vector3D([ -20, 20, 20, 1 ]),
		new Vector3D([ 20, 20, -20, 1 ]),
		new Vector3D([ 20, -20, -20, 1 ]),
		new Vector3D([ -20, -20, -20, 1 ]),
		new Vector3D([ -20, 20, -20, 1 ])
		]);
*/

	this.world2view = new Matrix3D(); // identity matrix
	
	var els = document.getElementsByTagName("script");
	var path = els[0].src.match(new RegExp("^.+/"))[0];

/*
	var gourdLoader = new XMLHttpRequest();
	if (!gourdLoader) {
		document.writeln("Hmm. I don't think your browser supports XMLHttpRequest.<br />");
	}
	gourdLoader.open("GET", path + "gourd.obj", true);
	gourdLoader.send(null);
	if (gourdLoader.status != 200) {
		document.writeln("I couldn't load the gourd. What's up with that?");
	} else {
		window.console.log(gourdLoader.responseText);
	}
*/
	
	var that = this;
	window.onload = function() {	
		window.console.log("blah");
		window.setTimeout(render, 500);
		
		var gourdiv = document.getElementById("gourd");
		that.model = Model.Parse(gourdiv.childNodes[0].nodeValue);
		
		//window.console.log(gourdiv.childNodes[0].nodeValue);

	}
}

Renderboy02LoadingModels.prototype.render = function() {
		var console = document.getElementById('console');
	
		var canvas = document.getElementById('renderboy');	
		var cx = canvas.getContext('2d');
		
		
		var imgd = false;
		var w = canvas.width, h = canvas.height;
	
		cx.clearRect(0, 0, w, h);
		cx.fillStyle = "rgb(255, 32, 32)";
		var pix = imgd.data;
		
		
		var object2world = new Matrix3D();
		
		// Rotate, then translate
		//var object2world = Matrix3D.Translation(0, 0, -20).multiply(Matrix3D.RotationY(-this.objRotation));
		// Scale, then rotate, then translate
		var object2world = Matrix3D.Translation(0, 0, -100).multiply(Matrix3D.RotationY(-this.objRotation)).multiply(Matrix3D.Scaling(20,20,20));
		
	
		// concatenate matrices
		var object2view = object2world.multiply(this.world2view);
	
		// Transform and project points
		for(var i = 0; i < this.model.vertices.length; i++) {
			// Transform one vertex from the world
			var vertex = object2view.multiply(this.model.vertices[i]);

			var projVertex = {
				x : Math.round(vertex.get(0) * (this.focalLength / vertex.z())) + w / 2,
				y : Math.round(vertex.get(1) * (this.focalLength / vertex.z())) + h / 2,
			};
			var size = this.focalLength / vertex.z() * 1;
	
			cx.fillRect(projVertex.x - size / 2, projVertex.y - size / 2, size, size);

		}
	
	
		this.objRotation += Math.PI / 90.0;
		if (this.objRotation >= Math.PI * 2) {
			this.objRotation -= Math.PI * 2;
		}
		
		//window.setTimeout(this.render(), 1000 / 45);
		window.setTimeout(render, 1000 / 30);
	}
