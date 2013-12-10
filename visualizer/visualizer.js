var System = require("../system.js");
var Sphere = require("../sphere.js");
var Curve = require("../curve.js");

var mySystem; // CREATE THE SYSTEM!
var shadows = 1;

var sphere; 
var camera, scene, renderer;
var geometry, material, mesh;
var controls,time = Date.now();

var objects = [];

var ray;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {
	var element = document.body;
	var pointerlockchange = function ( event ) {

		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

			controls.enabled = true;

			blocker.style.display = 'none';

		} else {

			controls.enabled = false;

			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';
		}
	}

	var pointerlockerror = function ( event ) {

		instructions.style.display = '';

	}

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

	instructions.addEventListener( 'click', function ( event ) {

	instructions.style.display = 'none';

	// Ask the browser to lock the pointer
	element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

	if ( /Firefox/i.test( navigator.userAgent ) ) {

		var fullscreenchange = function ( event ) {

			if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

				document.removeEventListener( 'fullscreenchange', fullscreenchange );
				document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

				element.requestPointerLock();
			}

		}

		document.addEventListener( 'fullscreenchange', fullscreenchange, false );
		document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

		element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

		element.requestFullscreen();

	} else {

		element.requestPointerLock();

	}

	}, false );

	} else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}
	
	init();
	animate();

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
	//camera.position = new THREE.Vector3( 30, 10, 30 );
	//camera.lookAt(new THREE.Vector3( 0, 10, 0 );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
	
	var light = new THREE.AmbientLight( 0x333333 );
	scene.add( light );

	var light = new THREE.DirectionalLight( 0xBBBBBB );//0xffffff, 1.5 );
	light.position.set( 0, 10, 0 );
	if(shadows) {
		light.castShadow = true;
		light.shadowCameraNear = 1;
		light.shadowCameraFar = 100;

		light.shadowCameraLeft = -50;
		light.shadowCameraRight = 50;
		light.shadowCameraTop = -50;
		light.shadowCameraBottom = 50;

		light.shadowBias = -.01;
		//light.shadowCameraVisible = true;
	}
	scene.add( light );

	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	ray = new THREE.Raycaster();
	ray.ray.direction.set( 0, -1, 0 );
	
	// create the system
	mySystem = new System(.001,0,scene,shadows);
    
    /*
    /// DEMONSTRATE VISUALIZER
    var ball = new Sphere( 1, 1, new THREE.Vector3( 20*Math.random()+3, 20*Math.random()+3, 20*Math.random()+3 ));
    mySystem.add(ball);
    
    
    /// DEMONSTRATE PARTICLE API
    var ball;
	for(var i=0;i<1000;i++)
	{
		ball = new Sphere( .1, 1, new THREE.Vector3( 20*Math.random()+3, 20*Math.random()+3, 20*Math.random()+3 ));
		mySystem.add(ball);
	}
     
    
    /// DEMONSTRATE STRAIGHT CURVE
    var radius = Math.random();
    var curve0 = new Curve(radius, new THREE.Vector3(0,10,0), new THREE.Vector3(1,0,0) , new THREE.Vector3(20,10,0) , new THREE.Vector3(1,0,0), .01);
    mySystem.add(curve0);
	
    /// DEMONSTRATE CURVED BEAM
	var radius = Math.random();
	var curve1 = new Curve(radius, new THREE.Vector3(0,1,0), new THREE.Vector3(1,0,0) , new THREE.Vector3(20,20,0) , new THREE.Vector3(0,1,0), .01);
    mySystem.add(curve1);
	
    
    /// CHECK COLLISION DETECTION
    var radius = Math.random();
	var curve2 = new Curve(radius, new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0) , new THREE.Vector3(1,0,0) , new THREE.Vector3(1,0,0), .5);
	var curve3 = new Curve(radius, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0) , new THREE.Vector3(0,3,0) , new THREE.Vector3(0,1,0), 1.5);
    
    mySystem.add(curve2);
	mySystem.add(curve3);
    
    //curve2.checkCollision_sphere(curve3);
    //curve2.checkCollision_opt(curve3);
	*/
    
    /// CHECK RANDOM BEAMS IN COLLISION DETECTION
    var radius = Math.random();
	var curve4 = new Curve(radius, new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()), new THREE.Vector3(Math.random(),Math.random(),Math.random()) , new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()) , new THREE.Vector3(Math.random(),Math.random(),Math.random()), radius*.2);
	var curve5 = new Curve(radius, new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()), new THREE.Vector3(Math.random(),Math.random(),Math.random()) , new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()) , new THREE.Vector3(Math.random(),Math.random(),Math.random()), radius*.2);

	mySystem.add(curve4);
	mySystem.add(curve5);
	
	curve4.checkCollision_nsquared(curve5)
	curve4.checkCollision_opt(curve5);
	
	//

	renderer = new THREE.WebGLRenderer();
	if(shadows) renderer.shadowMapEnabled = true;
	renderer.setClearColor( 0xffffff );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	mySystem.doTimeStep();
	//console.log(mySystem.time);

	requestAnimationFrame( animate );

	controls.isOnObject( false );

	ray.ray.origin.copy( controls.getObject().position );
	ray.ray.origin.y -= 10;

	var intersections = ray.intersectObjects( objects );

	if ( intersections.length > 0 ) {

		var distance = intersections[ 0 ].distance;

		if ( distance > 0 && distance < 10 ) {

			controls.isOnObject( true );

		}

	}

	controls.update( Date.now() - time );

	renderer.render( scene, camera );

	time = Date.now();

}