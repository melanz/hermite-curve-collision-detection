hermite-curve-collision-detection
=================================

This project implements hermite curve collision detection using nonlinear optimization for use with Absolute Nodal Coordinate Formulation (ANCF). Elements that undergo large deformations and rotations cannot be accurately described with traditional finite element analysis. ANCF was introduced to avoid these issues. For most of the applications involving large deformation finite elements, i.e. polymer, hair, and grass simulation, contact with friction is an integral part of the modeling approach.

## Motivation
The collision detection problem can be a bottleneck in the simulation of physical systems involving a large number of beams in contact. For instance, for a polymer simulation problem, one has to consider systems with hundreds of thousands of flexible beams interacting through friction and contact. This collision detection task must be performed once at each integration time step. The goal of this project is to implement a collision detection algorithm that efficiently calculates the collisions between two beam elements. This collision detection algorithm will make use of the fact that the shape of the beams is dictated by cubic Hermite splines. Possible external libraries that will be imported will be (i) minimization algorithms, (ii) Hermite-to-Bezier converters, and (iii) broadphase collision algorithms.

## Demonstration

This code uses THREE.js for visualization. It has been tested in [Chrome](https://www.google.com/intl/en/chrome/browser/).

[![Screenshot](https://f.cloud.github.com/assets/5438923/1786261/d4294c08-68f1-11e3-8ade-5cb3c1858c09.png)](http://htmlpreview.github.io/?https://github.com/melanz/hermite-curve-collision-detection/blob/master/visualizer/index.html)

## Example
The following code creates two random beams and checks for the minimum separation distance using spherical decomposition and optimization.

```javascript
// create the system
var System = require("../system.js");
var Curve = require("../curve.js");

var mySystem = new System(.001,0,new THREE.Scene(),1);
        
var radius = Math.random();

var curve1 = new Curve(radius, new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()), new THREE.Vector3(Math.random(),Math.random(),Math.random()) , new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()) , new THREE.Vector3(Math.random(),Math.random(),Math.random()), radius*.2);
var curve2 = new Curve(radius, new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()), new THREE.Vector3(Math.random(),Math.random(),Math.random()) , new THREE.Vector3(10*Math.random(),10*Math.random(),10*Math.random()) , new THREE.Vector3(Math.random(),Math.random(),Math.random()), radius*.2);

mySystem.add(curve1);
mySystem.add(curve2);
        
curve1.checkCollision_nsquared(curve2)
curve1.checkCollision_opt(curve2);

// The two collision checks should give similar results
```

## Install

    npm install hermite-curve-collision-detection
    
## Implementation
Gradient-deficient beams are two node beam elements where one position vector and only one gradient vector are used as nodal coordinates ![Eq1](http://www.sciweavers.org/upload/Tex2Img_1387515217/render.png). Thus each node has 6 coordinates: three components of global position vector of the node and three components of position vector gradient at the node. The global position vector of an arbitrary point on the beam centerline is given by:

![Eq2](http://www.sciweavers.org/upload/Tex2Img_1387516901/render.png)

where ![Eq3](http://www.sciweavers.org/upload/Tex2Img_1387516660/render.png)is the vector of element nodal coordinates. The shape function matrix for this element is defined as:

![Eq4](http://www.sciweavers.org/upload/Tex2Img_1387516744/render.png)

where I is the 3x3 identity matrix and the shape functions  ![Eq5](http://www.sciweavers.org/upload/Tex2Img_1387517018/render.png) are defined as:

![Eq6](http://www.sciweavers.org/upload/Tex2Img_1387517092/render.png)

Here ![Eq7](http://www.sciweavers.org/upload/Tex2Img_1387517262/render.png), and ![Eq8](http://www.sciweavers.org/upload/Tex2Img_1387517299/render.png) is the element length. The minimum separation distance is found by minimizing the distance between the two curves:

![Eq9](http://www.sciweavers.org/upload/Tex2Img_1387520176/render.png)

The goal of this project is to find the minimum separation distance (MSD) [1] and any self-intersection [2] between the beam elements. The MSD between two general geometrical objects is obtained at a pair of points, one on the surface of each object, where moving either of the points a differential amount in any direction while keeping them on the surfaces of their respective object will not produce a reduction in the Cartesian distance between them. Although this definition may include any stationary point (i.e., maxima, minima, and inflection points), the algorithms used will guarantee that only minima are found. Several [NPM](https://npmjs.org/) modules are used:
- [cubic-hermite](https://npmjs.org/package/cubic-hermite) is used for curve interpolation
- [n-body-pairs](https://npmjs.org/package/n-body-pairs) is used to check collisions with spheres
- [mathopt](https://npmjs.org/package/mathopt) is used for optimization
    
## References
[1]	A. Roy, J. A. Carretero, B. J. Buckham, and R. S. Nicoll, “[Continuous Collision Detection of Cubic-Spline-Based Tethers in ROV Simulations](http://offshoremechanics.asmedigitalcollection.asme.org/article.aspx?articleid=1472687),” J. Offshore Mech. Arct. Eng., vol. 131, no. 4, p. 041102, 2009.

[2]	D. Pekerman, G. Elber, and M. S. Kim, “[Self-intersection detection and elimination in freeform curves and surfaces](http://www.sciencedirect.com/science/article/pii/S0010448507002357),” Comput. Des., vol. 40, no. 2, pp. 150–159, Feb. 2008. 

## Credits
(c) 2013 Daniel Melanz. MIT License
