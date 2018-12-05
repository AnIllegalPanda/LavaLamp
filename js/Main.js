// globals
var scene, camera, renderer;
var aLight, brLight, trLight;
//var pRight, pLeft, pTop, bBottom, pFront, pBack;
var spheres;
var hBoxHeight = 3.0;
var hBoxWidth = 1.0;
var hBoxDepth = 0.4;
var sign = 1;

// bounding box collision check
function checkCollision(cur) {

  if( cur.x + cur.size > hBoxWidth ||
      cur.x - cur.size < -hBoxWidth )
      cur.vx *= -1;

  if( cur.y + cur.size > hBoxHeight||
      cur.y - cur.size < -hBoxHeight )
      cur.vy = 0;

  if( cur.z + cur.size > hBoxDepth ||
      cur.z - cur.size < hBoxDepth )
      cur.vz *= -1;
}

function computeColor(cur, fh) {
  var minimum = -1;
  var maximum = 1;
  var value = fh * 400000; // scale force back up
  var ratio = 2 * (value-minimum) / (maximum - minimum);
  var b = Math.max(0, 255*(1 - ratio)) / 255;
  var r = Math.max(0, 255*(ratio - 1)) / 255;
  var g = (255 - b - r) / 255;
  cur.sph.material.color.setRGB(r, g, b);
}

// apply forces only in y direction
function applyForces(cur) {
  var Fg = -0.0000005;
  // cur.y < 0 -> apply positive force
  // cur.y > 0 -> apply negative force
  // cur.y == 0 -> apply 0 force
  var FhScalar = 800000;
  var Fh = ((-cur.y)**3) / ((cur.size*2) * FhScalar);

  var Fcx = ((-cur.x)**3) / FhScalar;
  var Fcz = ((-cur.z)**3) / FhScalar;

  cur.vy += Fg;
  cur.vy += Fh;
  cur.vx += Fcx;
  cur.vz += Fcz;
}

function computeMorphTargets(geometry) {
  for( var i = 0; i < geometry.vertices.length; ++i ) {
    var vertices = [];

    for( var j = 0; j < geometry.vertices.length; ++j ) {
      var v = geometry.vertices[j].clone();
      v.x *= 1.1;
      v.y *= 1.1; 
      v.z *= 1.1;
      vertices.push(v);

      /*
      if( j === i ) {
        vertices[ vertices.length -  1].x *= 2;
        vertices[ vertices.length -  1].y *= 2;
        vertices[ vertices.length -  1].z *= 2;
      }
      */
    }

    geometry.morphTargets.push({ name: "target"+i, vertices: vertices});
  }

}

var animate = function () {
  requestAnimationFrame(animate);
  for (var i = 0; i < spheres.length; ++i) {
    var cur = spheres[i];

    // position update
    cur.geo.translate(cur.vx, cur.vy, cur.vz);
    cur.x += cur.vx;
    cur.y += cur.vy;
    cur.z += cur.vz;

    checkCollision(cur);
    applyForces(cur);
    //computeColor(cur, Fh);

    //cur.sph.rotation.y += 0.01;

    /*
    for( var j = 0; j < cur.sph.morphTargetInfluences.length; ++j ) {
      cur.sph.morphTargetInfluences[ j ] = cur.sph.morphTargetInfluences[ j ] + 0.001 * sign;
      if ( cur.sph.morphTargetInfluences[ j ] <= 0 || cur.sph.morphTargetInfluences[ j ] >= 0.05 ) {
        sign *= - 1;
      }
    }
    */
  }
  renderer.render(scene, camera);
};

window.onload = function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  aLight = new THREE.AmbientLight( 0x1f1f1f, 5 );
  scene.add( aLight );

  brLight = new THREE.PointLight( 0xf0f0f0, 1 );
  brLight.position.set( 0, 0, 5 );
  brLight.castShadow = true;
  //brLight.lookAt(0, 0, 0);
  scene.add( brLight );

  trLight = new THREE.PointLight( 0xf0f0f0, 1);
  trLight.position.set( 0, 20, 0 );
  trLight.castShadow = true;
  //trLight.lookAt(0, 0, 0);
  scene.add( trLight );

  var boxEdgeGeo = new THREE.BoxGeometry(hBoxWidth*2, hBoxHeight*2, hBoxDepth*2);
  var boxEdgeMaterial = new THREE.MeshBasicMaterial( {color: 0xD2B48C, wireframe: true} );
  var boxEdge = new THREE.Mesh( boxEdgeGeo, boxEdgeMaterial );
  scene.add( boxEdge );

  /*
  var axesHelper = new THREE.AxesHelper(3);
  scene.add(axesHelper);
  */

  /*
  var boxGeo = new THREE.BoxGeometry(4.9, 5.9, 0);
  var boxMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var box = new THREE.Mesh( boxGeo , boxMaterial );
  scene.add( box );
  */

  renderer = new THREE.WebGLRenderer();


  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild(renderer.domElement);

  spheres = [];

  for (var i = 0; i < 10; ++i) {
    var x = Math.random() * hBoxWidth*2 - hBoxWidth;
    var y = -hBoxHeight + (Math.random() / 4);
    var z = Math.random() * hBoxDepth*2 - hBoxDepth;
    //var z = 0.5;
    var vx = Math.random() / 200 - 0.0025;
    //var vy = Math.random() / 100 - 0.01;
    var vy = 0;
    var vz = Math.random() / 200 - 0.0025;
    //var vz = 0;
    var size = (Math.random() * 0.2) + 0.4;

    if( y - size <= -hBoxHeight )
      y = -hBoxHeight + size + 0.1;

    var geometry = new THREE.SphereGeometry(size, 16, 16);
    //computeMorphTargets(geometry);

    var material = new THREE.MeshLambertMaterial({morphTargets: true, color: 0xff7d05});
    var sphere = new THREE.Mesh(geometry, material);

    //sphere.morphTargetInfluences[1] = 0;

    var pointsMaterial = new THREE.PointsMaterial( {

      size: 2,
      sizeAttenuation: false,
      alphaTest: 0.5,
      morphTargets: true

    } );

    var points = new THREE.Points( sphere.geometry, pointsMaterial );

    points.morphTargetInfluences = sphere.morphTargetInfluences;
    points.morphTargetDictionary = sphere.morphTargetDictionary;

    //sphere.add( points );

    spheres.push({
      x: x,
      y: y,
      z: z,
      vx: vx,
      vy: vy,
      vz: vz,
      size: size,
      geo: geometry,
      sph: sphere
    });

    scene.add(sphere);
    sphere.position.set(x, y, z);

  }

  animate();
}

