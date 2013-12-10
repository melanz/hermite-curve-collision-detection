//var hermite = require("cubic-hermite");

// constructor
function Curve(r, nodeLoc1, nodeVel1, nodeLoc2, nodeVel2, delta) {
    // data
	nodeVel1.normalize();
	nodeVel2.normalize();
	this.radius = r;
	this.length = Math.sqrt(Math.pow(nodeLoc1.x - nodeLoc2.x, 2) + Math.pow(nodeLoc1.y - nodeLoc2.y, 2) + Math.pow(nodeLoc1.z - nodeLoc2.z, 2));
	this.p = [nodeLoc1.x, nodeLoc1.y, nodeLoc1.z, nodeVel1.x, nodeVel1.y, nodeVel1.z, nodeLoc2.x, nodeLoc2.y, nodeLoc2.z, nodeVel2.x, nodeVel2.y, nodeVel2.z];
	this.geometry = [];;
	this.system;
	this.delta = delta/this.length;
	this.addSphereGeometry();	
}

// functions
Curve.prototype.getXYZPointAlongLength = function(xi) {
	//var point = hermite([this.p[0],this.p[1],this.p[2]],[this.p[3],this.p[4],this.p[5]],[this.p[6],this.p[7],this.p[8]],[this.p[9],this.p[10],this.p[11]], xi);
	var a = this.length;
	var pos = new THREE.Vector3(0,0,0);
	pos.x = (1 - 3 * xi * xi + 2 * Math.pow(xi, 3)) * this.p[0] + a * (xi - 2 * xi * xi + Math.pow(xi, 3)) * this.p[3] + (3 * xi * xi - 2 * Math.pow(xi, 3)) * this.p[6] + a * (-xi * xi + Math.pow(xi, 3)) * this.p[9];
    pos.y = (1 - 3 * xi * xi + 2 * Math.pow(xi, 3)) * this.p[1] + a * (xi - 2 * xi * xi + Math.pow(xi, 3)) * this.p[4] + (3 * xi * xi - 2 * Math.pow(xi, 3)) * this.p[7] + a * (-xi * xi + Math.pow(xi, 3)) * this.p[10];
    pos.z = (1 - 3 * xi * xi + 2 * Math.pow(xi, 3)) * this.p[2] + a * (xi - 2 * xi * xi + Math.pow(xi, 3)) * this.p[5] + (3 * xi * xi - 2 * Math.pow(xi, 3)) * this.p[8] + a * (-xi * xi + Math.pow(xi, 3)) * this.p[11];
		
	return pos;//new THREE.Vector3(point[0],point[1],point[2]);
}

Curve.prototype.addSphereGeometry = function() {
	// create the beam's material
	var material = new THREE.MeshLambertMaterial({color: 0xCC0000});
		
	for(var xi=0;xi<1;xi=xi+this.delta) {
		// set up the sphere vars
		var segments = 12, rings = 12;

		// create a new mesh with sphere geometry -
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, segments, rings),material);
			   
		sphere.position = this.getXYZPointAlongLength(xi);
		this.geometry.push(sphere);
	}
}

Curve.prototype.checkCollision_nsquared = function(curve) {
	var index1 = -1;
	var index2 = -2;
	var d2min = 10000000;
	
	for(var i=0;i<this.geometry.length;i++)
	{
		var nodeLoc1 = this.geometry[i].position;
		for(var j=0;j<curve.geometry.length;j++)
		{
			var nodeLoc2 = curve.geometry[j].position;
			var d2 = Math.pow(nodeLoc1.x - nodeLoc2.x, 2) + Math.pow(nodeLoc1.y - nodeLoc2.y, 2) + Math.pow(nodeLoc1.z - nodeLoc2.z, 2);
			if(d2<d2min)
			{			
				d2min = d2;
				index1 = i;
				index2 = j;
			}
		}
	}
	
	var material = new THREE.LineBasicMaterial({color: 0xFFFF00});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(this.getXYZPointAlongLength(index1/this.geometry.length));
	geometry.vertices.push(curve.getXYZPointAlongLength(index2/curve.geometry.length));
	var line = new THREE.Line(geometry, material);
	this.system.scene.add(line);
	
}

Curve.prototype.checkCollision_sphere = function(curve) {
	// requires that the curves have the same cross-sectional radius!
	//var nbp = require("n-body-pairs")(3, 1000);
	var initNBP = require("n-body-pairs")
	//var collisions = [];
	var points = [];
	
	for(var i=0;i<this.geometry.length;i++)
	{
		points.push([this.geometry[i].position.x,this.geometry[i].position.y,this.geometry[i].position.z]);
	}
	
	for(var i=0;i<curve.geometry.length;i++)
	{
		points.push([curve.geometry[i].position.x,curve.geometry[i].position.y,curve.geometry[i].position.z]);
	}

	var nbp = initNBP(3)
	//Report all pairs of points which are within 1.5 units of eachother
	  var pairs = []
	  nbp(points, this.radius, function(i,j,d2) {
		//console.log("Overlap ("+i+","+j+") Distance=", Math.sqrt(d2), "Positions=", points[i], points[j])
		pairs.push([Math.min(i,j), Math.max(i,j), Math.sqrt(d2)])
	  })
	  pairs.sort()
	  
	for(var i=0;i<pairs.length;i++)
	{
		if(pairs[i][0]<this.geometry.length && pairs[i][1] >= this.geometry.length)
		{
			console.log("Overlap ("+pairs[i][0]+","+pairs[i][1]+") Distance=", pairs[i][2], "Positions=", points[i], points[j])
		}
	}
	
	//return collisions;
}

Curve.prototype.checkCollision_opt = function(curve) {
	// requires that the curves have the same cross-sectional radius!
	var mathopt = require('mathopt');
	
	var curve1 = this;
	var curve2 = curve;
	
	var dist2 = function(xi1, xi2) {
		var nodeLoc1 = curve1.getXYZPointAlongLength(xi1);
		var nodeLoc2 = curve2.getXYZPointAlongLength(xi2);
		var d2 = Math.pow(nodeLoc1.x - nodeLoc2.x, 2) + Math.pow(nodeLoc1.y - nodeLoc2.y, 2) + Math.pow(nodeLoc1.z - nodeLoc2.z, 2);
		if(xi1>1||xi1<0||xi2>1||xi2<0) d2 = 10000;
		return d2;
	}
	
	console.log('Minimum found at ', mathopt.basicPSO(dist2));
	
	var material = new THREE.LineBasicMaterial({color: 0x0000ff});
	var geometry = new THREE.Geometry();
	geometry.vertices.push(this.getXYZPointAlongLength(mathopt.basicPSO(dist2)[0]));
	geometry.vertices.push(curve.getXYZPointAlongLength(mathopt.basicPSO(dist2)[1]));
	var line = new THREE.Line(geometry, material);
	this.system.scene.add(line);
	
}

Curve.prototype.doTimeStep = function() {
    
}

module.exports = Curve;