// constructor
function Sphere(r, rho, pos) {
    // data
	this.radius = r;
	this.density = rho;
	this.position = pos;
	this.velocity = new THREE.Vector3( 0, 0, 0 );
	this.acceleration = new THREE.Vector3( 0, 0, 0 );
	this.force = new THREE.Vector3( 0, 0, 0 );
    this.E = 2.0e7;
    this.nu = 0.3;
	
	// create the sphere's material
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});

	// set up the sphere vars
	var segments = 6, rings = 6;

	// create a new mesh with sphere geometry -
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, segments, rings),sphereMaterial);
	sphere.geometry.dynamic = true;
	//sphere.geometry.verticesNeedUpdate = true;
	//sphere.geometry.normalsNeedUpdate = true;
	sphere.position = pos;
		
	this.geometry = [];
    this.geometry.push(sphere);
	this.system;
}

// functions
Sphere.prototype.doTimeStep = function() {
	// check to see if the sphere hit the ground
	var groundPenetration = this.system.groundHeight-(this.position.y-this.radius);
    if(groundPenetration>0) {
        var sigma = (1-this.nu*this.nu)/this.E;
        var K = 4.0/(3.0*(sigma+sigma))*Math.sqrt(this.radius*this.radius/(this.radius+this.radius));
        var n = 1.5;
        
		// determine damping
		var b = 10;
		var v = this.velocity;
		var normal = new THREE.Vector3( 0, 1, 0 );
		var damping = new THREE.Vector3( 0, 0, 0 );
        damping.x = -b * normal.x * normal.x * v.x - b * normal.x * normal.y * v.y - b * normal.x * normal.z * v.z;
        damping.y = -b * normal.x * normal.y * v.x - b * normal.y * normal.y * v.y - b * normal.y * normal.z * v.z;
        damping.z = -b * normal.x * normal.z * v.x - b * normal.y * normal.z * v.y - b * normal.z * normal.z * v.z;
        
		var vct = new THREE.Vector3( 0, 0, 0 );
        vct.x = v.x - (normal.x * v.x + normal.y * v.y + normal.z * v.z) * normal.x;
        vct.y = v.y - (normal.x * v.x + normal.y * v.y + normal.z * v.z) * normal.y;
        vct.z = v.z - (normal.x * v.x + normal.y * v.y + normal.z * v.z) * normal.z;
		vct.normalize();
		
		var mu = 0;//.25;
		var groundForce = K*Math.pow(groundPenetration,n)*(normal.y+mu*vct.y)-damping.y;
		this.force.y+=groundForce;
		
        console.log(sigma);
        console.log(groundForce);
    }
    
	var mass = 4*this.density*this.r*this.r*this.r*Math.PI/3;
	
    this.acceleration.x = this.force.x/mass+this.system.gravity.x;
	this.acceleration.y = this.force.y/mass+this.system.gravity.y;
	this.acceleration.z = this.force.z/mass+this.system.gravity.z;
	
	this.velocity.x += this.acceleration.x*this.system.timeStep;
	this.velocity.y += this.acceleration.y*this.system.timeStep;
	this.velocity.z += this.acceleration.z*this.system.timeStep;
	
	this.position.x += this.velocity.x*this.system.timeStep;
	this.position.y += this.velocity.y*this.system.timeStep;
	this.position.z += this.velocity.z*this.system.timeStep;
	
	this.geometry.position = this.position;
    
    this.force.y = 0;
	
	//console.log(this.position);
}

module.exports = Sphere;