class car {
  constructor(startx, starty, theta, left, right, center, fast, slow) {
    this.left = left;
    this.right = right;
    this.center = center;
    this.x = startx;
    this.y = starty;
    this.angle = theta;
    this.range = 60;
    this.v = 5;
    this.fast = fast;
    this.slow = slow;
    this.score = 0;
    this.disabled = false;
  }

  draw() {
    push();
    noStroke();
    translate(this.x, this.y);
    rotate(-this.angle);
    fill(color(180, 0, 0));
    rect(-5, -9, 10, 18);
    fill(color(255, 0, 0));
    rect(-5, -7, 10, 9);
    fill(color(255, 255, 0));
    circle(3, 8, 3, 3);
    circle(-3, 8, 3, 3);
    fill(color(0, 200, 255));
    rect(-5, 1, 10, 2)
    pop();
  }

  leftLidar(pixels) {
    let start = 0;
    let end = this.range;
    let theta = this.angle - PI / 4;
    while (start <= end) {
      let mid = (start + end) / 2;
      let x = Math.round(this.x + mid * Math.sin(theta));
      let y = Math.round(this.y + mid * Math.cos(theta));
      if (y < height && y >= 0 && x >= 0 && x < width && pixels[4 * (y * width + x)]) {
        start = mid + 0.1;
      } else {
        end = mid - 0.1;
      }
    }
    push();
    stroke(255);
    let x = Math.round(this.x + start * Math.sin(theta));
    let y = Math.round(this.y + start * Math.cos(theta));
    line(this.x, this.y, x, y);
    pop();
    return start;
  }

  rightLidar(pixels) {
    let start = 0;
    let end = this.range;
    let theta = this.angle + PI / 4;
    while (start <= end) {
      let mid = (start + end) / 2;
      let x = Math.round(this.x + mid * Math.sin(theta));
      let y = Math.round(this.y + mid * Math.cos(theta));
      if (y < height && y >= 0 && x >= 0 && x < width && pixels[4 * (y * width + x)]) {
        start = mid + 0.1;
      } else {
        end = mid - 0.1;
      }
    }
    push();
    stroke(255);
    let x = Math.round(this.x + start * Math.sin(theta));
    let y = Math.round(this.y + start * Math.cos(theta));
    line(this.x, this.y, x, y);
    pop();
    return start;
  }

  centerLidar(pixels) {
    let start = 0;
    let end = this.range;
    let theta = this.angle;
    while (start <= end) {
      let mid = (start + end) / 2;
      let x = Math.round(this.x + mid * Math.sin(theta));
      let y = Math.round(this.y + mid * Math.cos(theta));
      if (y < height && y >= 0 && x >= 0 && x < width && pixels[4 * (y * width + x)]) {
        start = mid + 0.1;
      } else {
        end = mid - 0.1;
      }
    }
    push();
    stroke(255);
    let x = Math.round(this.x + start * Math.sin(theta));
    let y = Math.round(this.y + start * Math.cos(theta));
    line(this.x, this.y, x, y);
    pop();
    return start;
  }

  nextMove(pixels) {
    if(this.disabled) return 0;
    let left = this.leftLidar(pixels);
    let right = this.rightLidar(pixels);
    let center = this.centerLidar(pixels);
    if (left < 10 || right < 10 || center < 7) {
      this.disabled = true;
    }
    if (left < this.left) {
      this.angle += 0.1;
      this.score -= 1;
    } else if (right < this.right) {
      this.angle -= 0.1;
      this.score -= 1;
    }
    if (center < this.center) {
      this.v = this.slow;
    } else {
      this.v = this.fast;
    }
    this.score += this.v;
    this.x += this.v * Math.sin(this.angle);
    this.y += this.v * Math.cos(this.angle);
  }
}


function breed(car1, car2){
  let type = Math.random();
  if(type<0.45){
    // Mean
    thresh = (car1.left + car2.left)/2;
  }else if(type<0.9){
    // Take One
    if(Math.random()<=0.5)
      thresh = car1.left;
    else
      thresh = car2.left;
  }else{
    // Random
    thresh = car1.range*Math.random();
  }

  type = Math.random();
  if(type<0.45){
    // Mean
    center = (car1.center + car2.center)/2;
  }else if(type<0.9){
    // Take One
    if(Math.random()<=0.5)
      center = car1.center;
    else
      center = car2.center;
  }else{
    // Random
    center = car1.range*Math.random();
  }
  
  type = Math.random();
  if(type<0.45){
    // Mean
    fast = (car1.fast + car2.fast)/2;
  }else if(type<0.9){
    // Take One
    if(Math.random()<=0.5)
      fast = car1.fast;
    else
      fast = car2.fast;
  }else{
    // Random
    fast = 10*Math.random();
  }

  type = Math.random();
  if(type<0.45){
    // Mean
    slow = (car1.slow + car2.slow)/2;
  }else if(type<0.9){
    // Take One
    if(Math.random()<=0.5)
      slow = car1.slow;
    else
      slow = car2.slow;
  }else{
    // Random
    slow = fast*Math.random();
  }
  
  return new car(startx, starty, starttheta, thresh, thresh, center, fast, slow);
}

m = [];
cars = [];
track = [];
startx = 0;
starty = 0;
starttheta = 0;
episode = 0;

function setup() {
  frameRate(50);
  can = createCanvas(600, 400);
  can.parent("can");
}

function draw() {
  background(0);
  fill(255);
  text("Gen #" + episode, width - 80, 15);

  noStroke();
  fill(180);
  for (var i = 0; i < track.length; i++) {
    circle(track[i][0], track[i][1], 40, 40);
  }
  loadPixels();
  for (var i = 0; i < cars.length; i++) {
    cars[i].nextMove(pixels)
  }
  for (var i = 0; i < cars.length; i++) {
    cars[i].draw();
  }

}


function startEpisode(){
  episode++;
  temp = new car(0,0,0,0,0,0,0,0,0);
  temp.score = -100000;
  m = [temp, temp, temp];
  for(var i=0; i<cars.length; i++){
    if(cars[i].score >= m[0].score){
      m[2] = m[1];
      m[1] = m[0];
      m[0] = cars[i];
    }else if(cars[i].score >= m[1].score){
      m[2] = m[1];
      m[1] = cars[i];
    }else if(cars[i].score >= m[2].score){
      m[2] = cars[i];
    }
  }
  for(var i=0; i<3; i++){
    for(var j=i+1; j<3; j++){
      m.push(breed(m[i], m[j]));
      m.push(breed(m[i], m[j]));
    }
  }
  m[0].disabled = false;
  m[1].disabled = false;
  m[2].disabled = false;
  m[0].score = 0;
  m[1].score = 0;
  m[2].score = 0;
  m[0].x = startx;
  m[1].x = startx;
  m[2].x = startx;
  m[0].y = starty;
  m[1].y = starty;
  m[2].y = starty;
  m[0].angle = starttheta;
  m[1].angle = starttheta;
  m[2].angle = starttheta;
  
  cars = m;
}

function mouseReleased() {
  mouseDragged = () => {};
  starttheta = Math.atan((mouseX - startx) / (mouseY - starty));
  for (var i = 0; i < 9; i++) {
    let temp = 60 * Math.random();
    fast = 10*Math.random();
    cars.push(new car(startx, starty, starttheta, temp, temp, temp, fast, fast*Math.random()));
  }
  document.getElementById("title").innerText = "Learning to drive...";
  setInterval(startEpisode, 30000);
  mouseReleased = () => {};
}

function mouseDragged() {
  if(track.length>1 && dist(mouseX, mouseY, track[track.length-1][0], track[track.length-1][1])>10){
    t = 9/dist(mouseX, mouseY, track[track.length-1][0], track[track.length-1][1])
    for(var l=t; l<1; l+=t){
      x = l*mouseX + (1-l)*track[track.length-1][0];
      y = l*mouseY + (1-l)*track[track.length-1][1];
      track.push([x,y]);
    }
  }
  track.push([mouseX, mouseY]);
  if (track.length > 10) {
    startx = track[track.length - 10][0];
    starty = track[track.length - 10][1];
  }
}