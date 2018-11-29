
var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  tempCanvas = document.createElement("canvas"),
  tempCtx = tempCanvas.getContext("2d"),
  width = 512,
  height = 512,
  threshold = 210,
  colors = { r: 255, g: 0, b: 0 }, cycle = 0,
  points = [];

canvas.width = tempCanvas.width = width;
canvas.height = tempCanvas.height = height;

for (var i = 0; i < 50; i++) {
  var x = Math.random() * width,
    y = Math.random() * height,
    vx = Math.random()/2 - 0.25, // btn -0.25, 0.25
    vy = (Math.random() * 2) - 1, // btn -1, 1
    size = Math.floor(Math.random() * 60) + 60;

  points.push({ x: x, y: y, vx: vx, vy: vy, size: size });

};

function update() {
  var len = points.length;
  tempCtx.clearRect(0, 0, width, height);
  while (len--) {
    var point = points[len];
    point.x += point.vx;
    point.y += point.vy;

    // higher y is farther down the page
    var Fg = 0.0125;
    // |Fh| without scalar is <(height/2)**2
    // multiply by 40 to keep |Fh| < 0.025
    var fhScalar = (height/2)**2 * 40;
    var Fh = -(((point.y-(height/2))**2) / fhScalar);

    point.vy += Fg;
    point.vy += Fh;

    if (point.x > width ||
        point.x < 0) {
      point.vx = 0 - point.vx;
    }

    if (point.y > height ||
        point.y < 0) {
      point.vy = 0 - point.vy;
    }

    tempCtx.beginPath();
    var grad = tempCtx.createRadialGradient(point.x, point.y, 1, point.x, point.y, point.size);
    grad.addColorStop(0, 'rgba(' + colors.r + ',' + colors.g + ',' + colors.b + ',1)');
    grad.addColorStop(1, 'rgba(' + colors.r + ',' + colors.g + ',' + colors.b + ',0)');
    tempCtx.fillStyle = grad;
    tempCtx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
    tempCtx.fill();
  }
  metabalize();
  colorCycle();
  setTimeout(update, 10);
}

function colorCycle(){
  cycle+=0.1;
  if(cycle>100){
    cycle = 0;
  }
  colors.r = ~~(Math.sin(.3*cycle + 0) * 127+ 128);
  colors.g =  ~~(Math.sin(.3*cycle + 2) * 127+ 128);
  colors.b = ~~( Math.sin(.3*cycle + 4) * 127+ 128);
}

function metabalize() {
  var imageData = tempCtx.getImageData(0, 0, width, height),
    pix = imageData.data;

  for (var i = 0, n = pix.length; i < n; i += 4) {
    // Checks threshold
    if (pix[i + 3] < threshold) {
      pix[i + 3] /= 6;
      if (pix[i + 3] > threshold / 4) {
        pix[i + 3] = 0;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/*
function forces(ball) {
  var Fg = -0.5;
  var Fh = 1/(ball.y ** 2);

  ball.y += (Fg + Fh);
		}
*/

update();