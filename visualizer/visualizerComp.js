;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    // these curves are static and cannot move (nothing to do in the time loop)
}

module.exports = Curve;
},{"mathopt":2,"n-body-pairs":3}],2:[function(require,module,exports){
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window).
        root.mathopt = factory();
  }
}(this, function () {
    var euclideanLength = function(x) {
        var v = 0;
        for(var i = x.length; i--;) {
            v += x[i] * x[i];
        }
        return Math.sqrt(v);
    };
    var copy = function(from, to, n) {
        while(n--){
            to[n] = from[n];
        }
    };
    var vectorize = function(f) {
        return function(x) {
            return f.apply(null, x);
        };
    };
    return {
        basicPSO: function(f, options) {
            var iteration, iterationLoop, result, allIdle, i, j, best, v, p, pbest, c, cbest;

            // Normalize arguments.
            options = options || {};
            options.oniteration = options.oniteration || function(i, p, v, pbest, best, cb) {
                cb && setTimeout(cb, 0);
            };
            options.onstop = options.onstop || null;
            options.inertia = options.inertia || 0.7298;
            options.localAcceleration = options.localAcceleration || 2.9922/2;
            options.globalAcceleration = options.globalAcceleration || 2.9922/2;
            options.particles = options.particles || 20;
            options.idleSpeed = options.idleSpeed || 0.01;
            if(!options.dimensions) {
                options.dimensions = f.length;
                f = vectorize(f);
            }
            if(!options.initialPosition) {
                options.initialPosition = [];
                for(i = options.dimensions; i--;) {
                    options.initialPosition.push(0);
                }
            }

            // Initialize state.
            p = new Array(options.particles);
            pbest = p.slice(0);
            v = p.slice(0);
            cbest = p.slice(0);
            best = 0;
            for(i = p.length; i--;) {
                p[i] = options.initialPosition.slice(0);
                v[i] = [];
                for(j = options.dimensions; j--;) {
                    v[i].push(2 * Math.random());
                }
                pbest[i] = p[i].slice(0);
                cbest[i] = f(p[i]);
                if(cbest[i] < cbest[best]) {
                    best = i;
                }
            }

            // Find result.
            result = pbest[best].slice(0);
            result.iterations = 0;
            iteration = function() {
                result.iterations++;
                allIdle = true;
                for(i = options.particles; i--;) {
                    for(j = options.dimensions; j--;) {
                        v[i][j] = options.inertia * v[i][j] +
                            options.localAcceleration * Math.random() * (pbest[i][j] - p[i][j]) +
                            options.globalAcceleration * Math.random() * (pbest[best][j] - p[i][j]);
                        p[i][j] += v[i][j];
                    }

                    if(euclideanLength(v[i]) > options.idleSpeed) {
                        allIdle = false;
                    }

                    c = f(p[i]);
                    if(c < cbest[i]) {
                        cbest[i] = c;
                        copy(p[i], pbest[i], options.dimensions);
                        if(c < cbest[best]) {
                            best = i;
                        }
                    }
                }
            };
            allIdle = false;
            if(options.onstop) {
                iterationLoop = function() {
                    if(allIdle) {
                        copy(pbest[best], result, options.dimensions);
                        result.value = cbest[best];
                        options.onstop(result);
                    } else {
                        options.oniteration(result.iterations, p, v, pbest, best, function() {
                            iteration();
                            iterationLoop();
                        });
                    }
                };
                iterationLoop();
            } else {
                while(!allIdle) {
                    options.oniteration(result.iterations, p, v, pbest, best);
                    iteration();
                }
                copy(pbest[best], result, options.dimensions);
                result.value = cbest[best];
                return result;
            }
        }
    };
}));

},{}],3:[function(require,module,exports){
"use strict"

function Storage(max_points, dimension) {
  this.coordinates = new Array(dimension)
  this.points = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    this.coordinates[i] = new Int32Array(max_points<<dimension)
    this.points[i] = new Float64Array(max_points<<dimension)
  }
  this.indices = new Int32Array(max_points<<dimension)
}

Storage.prototype.resize = function(max_points) {
  var dimension = this.coordinates.length
  for(var i=0; i<dimension; ++i) {
    this.coordinates[i] = new Int32Array(max_points<<dimension)
    this.points[i] = new Float64Array(max_points<<dimension)
  }
  this.indices = new Int32Array(max_points<<dimension)
}

Storage.prototype.size = function() {
  return this.indices >> this.coordinates.length
}

Storage.prototype.move = function(p, q) {
  var coords = this.coordinates
    , points = this.points
    , indices = this.indices
    , dimension = coords.length
    , a, b, k
  for(k=0; k<dimension; ++k) {
    a = coords[k]
    a[p] = a[q]
    b = points[k]
    b[p] = b[q]
  }
  indices[p] = indices[q]
}

Storage.prototype.load = function(scratch, i) {
  var coords = this.coordinates
    , points = this.points
  for(var k=0, d=coords.length; k<d; ++k) {
    scratch[k] = coords[k][i]|0
    scratch[k+d+1] = +points[k][i]
  }
  scratch[d] = this.indices[i]|0
}

Storage.prototype.store = function(i, scratch) {
  var coords = this.coordinates
    , points = this.points
  for(var k=0, d=coords.length; k<d; ++k) {
    coords[k][i] = scratch[k]
    points[k][i] = scratch[k+d+1]
  }
  this.indices[i] = scratch[d]
}

Storage.prototype.swap = function(i, j) {
  var coords = this.coordinates
  var points = this.points
  var ind = this.indices
  var t, a, b
  for(var k=0, d=coords.length; k<d; ++k) {
    a = coords[k]
    t = a[i]
    a[i] = a[j]
    a[j] = t
    b = points[k]
    t = b[i]
    b[i] = b[j]
    b[j] = t
  }
  t = ind[i]
  ind[i] = ind[j]
  ind[j] = t
}

Storage.prototype.compare = function(i,j) {
  var coords = this.coordinates
  for(var k=0, d=coords.length; k<d; ++k) {
    var a = coords[k]
      , s = a[i] - a[j]
    if(s) { return s }
  }
  return this.indices[i] - this.indices[j]
}

Storage.prototype.compareNoId = function(i,j) {
  var coords = this.coordinates
  for(var k=0, d=coords.length-1; k<d; ++k) {
    var a = coords[k]
      , s = a[i] - a[j]
    if(s) { return s }
  }
  return coords[d][i] - coords[d][j]
}

Storage.prototype.compareS = function(i, scratch) {
  var coords = this.coordinates
  for(var k=0, d=coords.length; k<d; ++k) {
    var s = coords[k][i] - scratch[k]
    if(s) { return s }
  }
  return this.indices[i] - scratch[d]
}

/*
  Modified from this: http://stackoverflow.com/questions/8082425/fastest-way-to-sort-32bit-signed-integer-arrays-in-javascript
 */
Storage.prototype.sort = function(n) {
  var coords = this.coordinates
  var points = this.points
  var indices = this.indices
  var dimension = coords.length|0
  var stack = []
  var sp = -1
  var left = 0
  var right = n - 1
  var i, j, k, d, swap = new Array(2*dimension+1), a, b, p, q, t
  for(i=0; i<dimension; ++i) {
    swap[i] = 0|0
  }
  swap[dimension] = 0|0
  for(i=0; i<dimension; ++i) {
    swap[dimension+1+i] = +0.0
  }
  while(true) {
    if(right - left <= 25){
      for(j=left+1; j<=right; j++) {
        for(k=0; k<dimension; ++k) {
          swap[k] = coords[k][j]|0
          swap[k+dimension+1] = +points[k][j]
        }
        swap[dimension] = indices[j]|0
        i = j-1;        
lo_loop:
        while(i >= left) {
          for(k=0; k<dimension; ++k) {
            d = coords[k][i] - swap[k]
            if(d < 0) {
              break lo_loop
            } if(d > 0) {
              break
            }
          }
          p = i+1
          q = i--
          for(k=0; k<dimension; ++k) {
            a = coords[k]
            a[p] = a[q]
            b = points[k]
            b[p] = b[q]
          }
          indices[p] = indices[q]
        }
        this.store(i+1, swap)
      }
      if(sp == -1)    break;
      right = stack[sp--];
      left = stack[sp--];
    } else {
      var median = (left + right) >> 1;
      i = left + 1;
      j = right;
      
      this.swap(median, i)
      if(this.compare(left, right) > 0) {
        this.swap(left, right)
      } if(this.compare(i, right) > 0) {
        this.swap(i, right)
      } if(this.compare(left, i) > 0) {
        this.swap(left, i)
      }
      
      this.load(swap, i)
      while(true){
ii_loop:
        while(true) {
          ++i
          for(k=0; k<dimension; ++k) {
            d = coords[k][i] - swap[k]
            if(d > 0) {
              break ii_loop
            } if(d < 0) {
              continue ii_loop
            }
          }
          if(indices[i] >= swap[dimension]) {
            break
          }
        }
jj_loop:
        while(true) {
          --j
          for(k=0; k<dimension; ++k) {
            d = coords[k][j] - swap[k]
            if(d < 0) {
              break jj_loop
            } if(d > 0) {
              continue jj_loop
            }
          }
          if(indices[j] <= swap[dimension]) {
            break
          }
        }
        if(j < i)    break;
        for(k=0; k<dimension; ++k) {
          a = coords[k]
          t = a[i]
          a[i] = a[j]
          a[j] = t
          b = points[k]
          t = b[i]
          b[i] = b[j]
          b[j] = t
        }
        t = indices[i]
        indices[i] = indices[j]
        indices[j] = t
      }
      this.move(left+1, j)
      this.store(j, swap)
      if(right - i + 1 >= j - left){
        stack[++sp] = i;
        stack[++sp] = right;
        right = j - 1;
      }else{
        stack[++sp] = left;
        stack[++sp] = j - 1;
        left = i;
      }
    }
  }
}

Storage.prototype.hashPoints = function(points, bucketSize, radius) {
  var floor = Math.floor
    , coords = this.coordinates
    , spoints = this.points
    , indices = this.indices
    , count = points.length|0
    , dimension = coords.length|0
    , dbits = (1<<dimension)|0
    , ptr = 0
  for(var i=0; i<count; ++i) {
    var t = ptr
      , p = points[i]
      , cross = 0
    for(var j=0; j<dimension; ++j) {
      var ix = floor(p[j]/bucketSize)
      coords[j][ptr] = ix
      spoints[j][ptr] = p[j]
      if(bucketSize*(ix+1) <= p[j]+2*radius) {
        cross += (1<<j)
      }
    }
    indices[ptr++] = i
    cross = ~cross
    for(var j=1; j<dbits; ++j) {
      if(j & cross) {
        continue
      }
      for(var k=0; k<dimension; ++k) {
        var c = coords[k]
        c[ptr] = c[t]+((j>>>k)&1)
        spoints[k][ptr] = p[k]
      }
      indices[ptr++] = i
    }
  }
  return ptr
}

Storage.prototype.computePairs = function(cellCount, bucketSize, radius, cb) {
  var floor = Math.floor
    , coords = this.coordinates
    , points = this.points
    , indices = this.indices
    , dimension = coords.length|0
    , ptr = 0
    , r2 = 4 * radius * radius
    , i, j, k, l
    , a, b, pa, pb, d, d2, ac, bc
  for(i=0; i<cellCount;) {
    for(j=i+1; j<cellCount; ++j) {
      if(this.compareNoId(i, j) !== 0) {
        break
      }
      a = indices[j]
k_loop:
      for(k=i; k<j; ++k) {
        b = indices[k]
        d2 = 0.0
        for(l=0; l<dimension; ++l) {
          ac = points[l][j]
          bc = points[l][k]
          if(ac > bc) {
            if(coords[l][i] !== floor(ac/bucketSize)) {
              continue k_loop
            }
          } else if(coords[l][i] !== floor(bc/bucketSize)) {
            continue k_loop
          }
          d = ac - bc
          d2 += d * d
          if(d2 > r2) {
            continue k_loop
          }
        }
        if(cb(a, b, d2)) {
          return
        }
      }
    }
    i = j
  }
}

function createNBodyDataStructure(dimension, num_points) {
  dimension = (dimension|0) || 2
  var grid = new Storage(num_points||1024, dimension)
  
  function findPairs(points, radius, cb) {
    var count = points.length|0
    var cellCount = count<<dimension
    if(grid.size() < cellCount) {
      grid.resize(count)
    }
    var bucketSize = 4*radius
    var nc = grid.hashPoints(points, bucketSize, radius)
    grid.sort(nc)
    grid.computePairs(nc, bucketSize, radius, cb)
  }
  
  Object.defineProperty(findPairs, "capacity", {
    get: function() {
      return grid.size()
    },
    set: function(n_capacity) {
      grid.resize(n_points)
      return grid.size()
    }
  })
  
  return findPairs
}

module.exports = createNBodyDataStructure

},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{"../curve.js":1,"../sphere.js":4,"../system.js":5}]},{},[6])
;