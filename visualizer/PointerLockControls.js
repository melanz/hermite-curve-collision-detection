/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var moveUp = false;
	var moveDown = false;
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {
		
			case 81: //q
			case 33: //PgUp
				moveUp = true;
				break;
			
			case 69: // e
			case 34: // PgDown
				moveDown = true;
				break;

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; 
				break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if ( canJump === true ) velocity.y += 10;
				canJump = false;
				break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {
		
			case 81: //q
			case 33: //PgUp
				moveUp = false;
				break;
			
			case 69: // e
			case 34: // PgDown
				moveDown = false;
				break;

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.isOnObject = function ( boolean ) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();
	
	this.getLookAt = function ( delta ) {
		target = new THREE.Vector3( 0, 0, -1 );
		target.applyMatrix4( camera.matrixWorld );
		
		return target;
	};

	this.update = function ( delta ) {
		var cameraSpeed = .3;
		var target = new THREE.Vector3( 0, 0, -2 );
		target.applyMatrix4( camera.matrixWorld );
		//console.log(target);
		//console.log(yawObject.position);
		var currentPos = new THREE.Vector3( 0, 0, 0 );
		currentPos.applyMatrix4( camera.matrixWorld );
		
		var cameraDir = new THREE.Vector3( 0, 0, 0 );
		
		cameraDir.x = -target.x - currentPos.x;
		cameraDir.y = -target.y - currentPos.y;
		cameraDir.z = -target.z - currentPos.z;
		
		
		cameraDir.normalize();
		//console.log(cameraDir);
		//var cameraDir = subVectors(target,came
		
		//console.log("Target");
		//console.log(target);
		//console.log(cameraDir);

		if ( moveUp) yawObject.translateY(cameraSpeed);
		if ( moveDown) yawObject.translateY(-cameraSpeed);
		
		if ( moveForward ) 
		{
			//yawObject.translateX(cameraDir.x);
			//yawObject.translateY(cameraDir.y);
			//yawObject.translateZ(cameraDir.z);
			yawObject.translateZ(-cameraSpeed);
		}
		if ( moveBackward )
		{
			//yawObject.translateX(-cameraDir.x);
			//yawObject.translateY(-cameraDir.y);
			yawObject.translateZ(cameraSpeed);//-cameraDir.z);
		}
		
		if ( moveLeft ) yawObject.translateX(-cameraSpeed);
		if ( moveRight ) yawObject.translateX(cameraSpeed);

/*
		if ( scope.enabled === false ) return;

		delta *= 0.1;

		velocity.x += ( - velocity.x ) * 0.08 * delta;
		velocity.z += ( - velocity.z ) * 0.08 * delta;

		velocity.y -= 0.25 * delta;

		if ( moveForward ) velocity.z -= 0.12 * delta;
		if ( moveBackward ) velocity.z += 0.12 * delta;

		if ( moveLeft ) velocity.x -= 0.12 * delta;
		if ( moveRight ) velocity.x += 0.12 * delta;

		if ( isOnObject === true ) {

			velocity.y = Math.max( 0, velocity.y );

		}

		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );

		if ( yawObject.position.y < 10 ) {

			velocity.y = 0;
			yawObject.position.y = 10;

			canJump = true;

		}
*/
	};

};
