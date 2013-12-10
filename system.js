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

System.prototype.drawAll = function() {
}
System.prototype.doTimeStep = function() {
    
	for ( var i = 0, l = this.objects.length; i < l; i ++ ) {
		this.objects[i].doTimeStep();
	}
	
	this.time += this.timeStep;
	this.timeIndex++;
}

System.prototype.drawGround = function() {
	/*
	geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

		var vertex = geometry.vertices[ i ];
		//vertex.x += Math.random() * 20 - 10;
		vertex.y = this.groundHeight;
		//vertex.z += Math.random() * 20 - 10;

	}


	for ( var i = 0, l = geometry.faces.length; i < l; i=i+2 ) {

		var face = geometry.faces[ i ];
		if(this.shadows) face.receiveShadow = true;
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( 1.94, .87, .67 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( 1.94, .87, .67 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( 1.94, .87, .67 );

	}

	material = new THREE.MeshLambertMaterial( { vertexColors: THREE.VertexColors } );
	//material = new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('sand.jpg')});

	mesh = new THREE.Mesh( geometry, material );
	if(this.shadows) mesh.receiveShadow = true;
	this.scene.add( mesh );
	*/
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
/*
System.prototype.drawSphere = function(radius, scene, position) {
		// create the sphere's material
		var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});

		// set up the sphere vars
		var segments = 16, rings = 16;

		// create a new mesh with sphere geometry -
		// we will cover the sphereMaterial next!
		sphere = new THREE.Mesh(
		   new THREE.SphereGeometry(radius, segments, rings),
		   sphereMaterial);
		   
		sphere.position = position;

		// add the sphere to the scene
		scene.add(sphere);
}
*/
module.exports = System;