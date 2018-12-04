
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
var axesHelper = new THREE.AxesHelper(2);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var spheres = [];

scene.add(axesHelper);

/*
		var geometry = new THREE.CubeGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube = new THREE.Mesh( geometry, material );
		scene.add(cube);
		*/
for (var i = 0; i < 10; ++i) {
  var x = Math.random() * 2 - 1;
  var y = (Math.random() / 4) - 1;
  var z = 0.1;
  var vx = Math.random() / 200 - 0.0025;
  var vy = Math.random() / 100 - 0.005;
  var vz = 0;
  var size = 1;

  var geometry = new THREE.SphereGeometry(size, 16, 16);
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  var sphere = new THREE.Mesh(geometry, material);
  /*
  var coords = new THREE.Vector3(x, y, z);
  var mathSphere = new THREE.Sphere( coords, size);
  */

  spheres.push({
    x: x,
    y: y,
    z: z,
    vx: vx,
    vy: vy,
    vz: vz,
    size: size,
    geo: geometry
  });


  scene.add(sphere);
  sphere.position.set(x, y, z);

}

  var boxEdgeGeo = new THREE.BoxGeometry(5, 6, 0);
  var boxEdgeMaterial = new THREE.MeshBasicMaterial( {color: 0xD2B48C} );
  var boxEdge = new THREE.Mesh( boxEdgeGeo, boxEdgeMaterial );
  scene.add( boxEdge );
  
  var boxGeo = new THREE.BoxGeometry(4.9, 5.9, 0);
  var boxMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var box = new THREE.Mesh( boxGeo , boxMaterial );
  scene.add( box );

camera.position.z = 5;

var animate = function () {
  requestAnimationFrame(animate);
  for (var i = 0; i < spheres.length; ++i) {
    var cur = spheres[i];
	cur.x += cur.vx;
	cur.y += cur.vy;
	cur.z += 0;
    cur.geo.translate(cur.vx, cur.vy, 0);
	if(cur.x + cur.size > 2.5){
		cur.vx = -cur.vx;
	}
	if(cur.x - cur.size < -2.5){
		cur.vx = -cur.vx;
	}	
	if(cur.y + cur.size > 3){
		cur.vy = -cur.vy;
	}	
	if(cur.y - cur.size < -3){
		cur.vy = -cur.vy;
	}

    //if( cur.geo.intersectsBox(boundingBox) )
  }
  renderer.render(scene, camera);
};

animate();