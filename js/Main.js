// globals
var scene, camera, renderer, controls;
var aLight, brLight, trLight;
var spheres;
var hBoxHeight = 3.0;
var hBoxWidth = 1.0;
var hBoxDepth = 0.4;
var sign = 1;
var heatStrength = 1.0;
var numLava = 20;
var color;

// convert menu choice into usable color
function dec2hex(i) {
  var result = "0x000000";
  if (i >= 0 && i <= 15) { result = "0x00000" + i.toString(16); }
  else if (i >= 16 && i <= 255) { result = "0x0000" + i.toString(16); }
  else if (i >= 256 && i <= 4095) { result = "0x000" + i.toString(16); }
  else if (i >= 4096 && i <= 65535) { result = "0x00" + i.toString(16); }
  else if (i >= 65535 && i <= 1048575) { result = "0x0" + i.toString(16); }
  else if (i >= 1048575 ) { result = '0x' + i.toString(16); }
if (result.length == 8){return result;}

}

// bounding box collision check
function checkCollision(cur) {

  // update position on box dimension change
  var prevx = cur.x;
  var prevy = cur.y;
  var prevz = cur.z;
  if( cur.x > hBoxWidth ) cur.x = hBoxWidth - cur.size;
  if( cur.x < -hBoxWidth ) cur.x = -hBoxWidth + cur.size;
  if( cur.y > hBoxHeight ) cur.y = hBoxHeight - cur.size;
  if( cur.y < -hBoxHeight ) cur.y = -hBoxHeight + cur.size;
  if( cur.z > hBoxDepth ) cur.z = hBoxDepth - cur.size;
  if( cur.z < -hBoxDepth ) cur.z = -hBoxDepth + cur.size;
  cur.geo.translate(cur.x - prevx, cur.y - prevy, cur.z - prevz);

  // collisions with box edges during normal motion
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

// apply necessary forces to each object
function applyForces(cur) {
  // constant gravity
  var Fg = -0.0000005;
  // cur.y < 0 -> apply positive force
  // cur.y > 0 -> apply negative force
  // cur.y == 0 -> apply 0 force
  var FhScalar = 400000;
  var Fh = ((-cur.y)**3) / ((cur.size*2) * FhScalar) * heatStrength;

  // make objects tend towards y axis
  var Fcx = ((-cur.x)**3) / FhScalar;
  var Fcz = ((-cur.z)**3) / FhScalar;

  cur.vy += Fg;
  cur.vy += Fh;
  cur.vx += Fcx;
  cur.vz += Fcz;
}

// add new objects to the scene, remove if necessary
function addLava() {

  if( numLava < spheres.length ) {
    var removed = spheres.splice(numLava, spheres.length - numLava);
    for( var i = 0; i < removed.length; ++i ) {
      scene.remove(removed[i].sph);
    }
  }

  // init spheres
  for (var i = spheres.length; i < numLava; ++i) {
    var x = Math.random() * hBoxWidth*2 - hBoxWidth;
    var y = -hBoxHeight + (Math.random() / 4);
    var z = Math.random() * hBoxDepth*2 - hBoxDepth;
    var vx = Math.random() / 200 - 0.0025;
    var vy = 0;
    var vz = Math.random() / 200 - 0.0025;
    var size = (Math.random() * 0.2) + 0.4;

    // make sure spheres are starting in the correct position
    if( y - size <= -hBoxHeight )
      y = -hBoxHeight + size + 0.1;

    var geometry = new THREE.SphereGeometry(size, 32, 32);
    var material = new THREE.MeshLambertMaterial({morphTargets: true, color: color});
    var sphere = new THREE.Mesh(geometry, material);

    spheres.push({
      x: x,
      y: y,
      z: z,
      vx: vx,
      vy: vy,
      vz: vz,
      size: size,
      geo: geometry,
      sph: sphere,
    });

    scene.add(sphere);
    sphere.position.set(x, y, z);
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
  }
  controls.update();
  renderer.render(scene, camera);
};

window.onload = function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  controls = new THREE.OrbitControls(camera);
  controls.update();

  aLight = new THREE.AmbientLight( 0x1f1f1f, 5 );
  scene.add( aLight );

  brLight = new THREE.PointLight( 0xf0f0f0, 1 );
  brLight.position.set( 0, 0, 5 );
  brLight.castShadow = true;
  scene.add( brLight );

  trLight = new THREE.PointLight( 0xf0f0f0, 1);
  trLight.position.set( 0, 20, 0 );
  trLight.castShadow = true;
  scene.add( trLight );

  var axesHelper = new THREE.AxesHelper( 3 );
  scene.add( axesHelper );

  // default lava color
  color = 0xff7d05;

  // gui options
  var controller = new function() {
    this.width = hBoxWidth;
    this.height = hBoxHeight;
    this.depth = hBoxDepth;
    this.home = function() {
      controls.reset();
    };
    this.lavaColor = color;
    this.heatStrength = 1.0;
    this.numLava = numLava;
  }();

  var gui = new dat.GUI();
  var f1 = gui.addFolder('Scale');
  f1.add(controller, 'width', 1, 5).onChange( function() {
    hBoxWidth = (controller.width);
  });
  f1.add(controller, 'height', 3, 6).onChange( function() {
    hBoxHeight = (controller.height);
  });
  f1.add(controller, 'depth', 0.4, 3).onChange( function() {
    hBoxDepth = (controller.depth);
  });

  gui.add( controller, 'heatStrength', 0.0, 5.0 ).onChange( function() {
    heatStrength = controller.heatStrength;
  });
  gui.add( controller, 'numLava', 5, 50 ).onChange( function() {
    numLava = (controller.numLava);
    addLava();
  });
  gui.addColor( controller, 'lavaColor', color ).onChange( function() {
    for( var i = 0; i < spheres.length; ++i )
      spheres[i].sph.material.color.setHex(dec2hex(controller.lavaColor));

    color = controller.lavaColor;
  });
  gui.add( controller, 'home' ).onChange( function() {
    controller.home();
  })

  renderer = new THREE.WebGLRenderer();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild(renderer.domElement);

  spheres = [];
  addLava();
  animate();
}

