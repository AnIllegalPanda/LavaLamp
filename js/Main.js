// globals
var scene, camera, renderer;
var aLight, light;
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

// apply forces only in y direction
function applyForces(cur) {
  var Fg = -0.00001;
  // cur.y < 0 -> apply positive force
  // cur.y > 0 -> apply negative force
  // cur.y == 0 -> apply 0 force
  var FhScalar = 20000;
  var Fh = ((-cur.y)**3) * cur.size / FhScalar;

  cur.vy += Fg;
  cur.vy += Fh;
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
  renderer.render(scene, camera);
};

window.onload = function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 6;

  aLight = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( aLight );

  light = new THREE.PointLight( 0xff0000, 3, 15 );
  light.position.set( 0, -5, 0 );
  scene.add( light );

  renderer = new THREE.WebGLRenderer();

  var axesHelper = new THREE.AxesHelper(2);
  //scene.add(axesHelper);

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  spheres = [];

  for (var i = 0; i < 10; ++i) {
    var x = Math.random() * 2 - 1;
    var y = (Math.random() / 4) - 1;
    var z = Math.random() * 2 - 1;
    var vx = Math.random() / 100 - 0.005;
    var vy = Math.random() / 50 - 0.01;
    var vz = Math.random() / 100 - 0.005;
    var size = Math.random();

    var geometry = new THREE.SphereGeometry(size, 32, 32);
    var material = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });
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
    });

    scene.add(sphere);
    sphere.position.set(x, y, z);

  }

  animate();
}

