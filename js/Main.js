// globals
var scene, camera, renderer;
var aLight, brLight, trLight;
//var pRight, pLeft, pTop, bBottom, pFront, pBack;
var spheres;
var boxSideLen = 3.0;

// bounding box collision check
function checkCollision(cur) {

  if( cur.x + cur.size > boxSideLen ||
      cur.x - cur.size < -boxSideLen )
      cur.vx *= -1;

  if( cur.y + cur.size > boxSideLen ||
      cur.y - cur.size < -boxSideLen )
      cur.vy = 0;

  if( cur.z + cur.size > boxSideLen ||
      cur.z - cur.size < -boxSideLen )
      cur.vz *= -1;
}

function computeColor(cur, fh) {
  var minimum = -2;
  var maximum = 2;
  var value = fh * 400000;
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
  var FhScalar = 400000;
  var Fh = ((-cur.y)**3) * cur.size / FhScalar;

  cur.vy += Fg;
  cur.vy += Fh;
  return Fh;
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
    var Fh = applyForces(cur);
    computeColor(cur, Fh);
  }
  renderer.render(scene, camera);
};

window.onload = function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  aLight = new THREE.AmbientLight( 0x1f1f1f );
  scene.add( aLight );

  brLight = new THREE.RectAreaLight( 0xf0f0f0, 2 );
  brLight.position.set( 0, -5, 0 );
  brLight.lookAt(0, 0, 0);
  scene.add( brLight );

  trLight = new THREE.RectAreaLight( 0xf0f0f0, 2, 4, 4 );
  trLight.position.set( 0, 5, 0 );
  trLight.lookAt(0, 0, 0);
  scene.add( trLight );

  renderer = new THREE.WebGLRenderer();

  var axesHelper = new THREE.AxesHelper(2);
  //scene.add(axesHelper);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  spheres = [];

  for (var i = 0; i < 20; ++i) {
    var x = Math.random() * boxSideLen*2 - boxSideLen;
    var y = -boxSideLen + (Math.random() / 4);
    var z = Math.random() * boxSideLen*2 - boxSideLen;
    var vx = Math.random() / 200 - 0.005;
    var vy = Math.random() / 100 - 0.01;
    var vz = Math.random() / 200 - 0.0025;
    var size = Math.random() + 0.25;

    if( y - size <= boxSideLen )
      y = -boxSideLen + size + 0.1;

    var geometry = new THREE.SphereGeometry(size, 32, 32);
    var material = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
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
      sph: sphere
    });

    scene.add(sphere);
    sphere.position.set(x, y, z);

  }

  animate();
}

