// constructor
function System(timeStep,groundHeight,scene,shadows) {
    // data
	this.groundHeight = groundHeight;
	this.time = 0;
	this.timeIndex = 0;
	this.timeStep = timeStep;
	this.objects = [];
	this.scene = scene;
	this.drawGround(this.groundHeight);
	this.gravity = new THREE.Vector3( 0, -9.81, 0 );
	this.shadows = shadows;
}

// functions
System.prototype.add = function(object) {
	object.system = this;
    this.objects.push(object);
	
	for(var i=0;i<object.geometry.length;i++)
	{
		if(this.shadows) object.geometry[i].castShadow = true;
		this.scene.add(object.geometry[i]);
	}
}

System.prototype.doTimeStep = function() {
    
	for ( var i = 0, l = this.objects.length; i < l; i ++ ) {
		this.objects[i].doTimeStep();
	}
	
	this.time += this.timeStep;
	this.timeIndex++;
}

System.prototype.drawGround = function() {
	var ground = new THREE.Mesh(
		new THREE.PlaneGeometry( 30, 30 ),
		new THREE.MeshLambertMaterial({ color: 0x33CC33 })
	);
	// PlaneGeometry is created along YZ axis, rotate -90 degrees
	// around the X axis so it lays flat and pointing up 
	ground.rotation.x = -0.5*Math.PI;
	ground.receiveShadow = true;
	this.scene.add( ground );
}

module.exports = System;