/*globals paper, console, $ */
/*jslint nomen: true, undef: true, sloppy: true */

var NOC = NOC || {};



// Extended Daniel Shiffman's natureofcode example to paper.js
// https://github.com/shiffman/The-Nature-of-Code-Examples-p5.js/tree/master/chp05_libraries/box2d-html5

// create local scope to avoid polluting global namespace
NOC.demo = NOC.demo || [];
NOC.demo[2] = function (canvasName) {

// put paper.js in local environment, and setup canvas and tool (for events)
this.paper = new paper.PaperScope();
this.paper.setup(canvasName);

with (this.paper) {

var tool = new Tool();

// setup objects used in the sketch:

// for the box, x and y are in pixel space already.  let the B2Helper function do conversion.
var Box = function(x, y) {
  this.w = getRandom(20, 40);
  this.h = getRandom(10, 30);

  //
  this.life = MAX_LIFE; // dies after MAX_LIFE frames, with some randomness.

   // Define a body
  var bd = new box2d.b2BodyDef();
  bd.type = box2d.b2BodyType.b2_dynamicBody;
  bd.position = B2Helper.scaleToWorld(x,y);

  // Define a fixture
  var fd = new box2d.b2FixtureDef();
  // Fixture holds shape
  fd.shape = new box2d.b2PolygonShape();
  fd.shape.SetAsBox(B2Helper.scaleToWorld(this.w/2), B2Helper.scaleToWorld(this.h/2));
  
  // Some physics
  fd.density = 1.0;
  fd.friction = 0.5;
  fd.restitution = 0.2;
 
  // Create the body
  this.body = world.CreateBody(bd);
  // Attach the fixture
  this.body.CreateFixture(fd);

  // Some additional stuff
  this.body.SetLinearVelocity(new box2d.b2Vec2(getRandom(-10, 10), getRandom(2, 10)));
  this.body.SetAngularVelocity(getRandom(-5,5));

  // creates the shape to be drawn by paper.js
  this.paperShape = new Group();
  this.paperShape.addChild( Path.Rectangle({
    point:  [0, 0],
    size:   [this.w, this.h],
    strokeColor:  'black',
    fillColor:    getRandomColor()
  }) );
  this.paperShape.position = new Point(x, y);
  this.paperShape.transformContent = false;

};

// This function removes the particle from the box2d world, and also in paper.js
Box.prototype.killBody = function() {
  world.DestroyBody(this.body);
  this.paperShape.remove();
};

// Is the particle ready for deletion?
Box.prototype.done = function() {
  // Let's find the screen position of the particle
  var pos = B2Helper.scaleToPixels(this.body.GetPosition());

  // Is it off the bottom of the screen?  also kill it if the life is non positive
  if (this.life <= 0 || pos.y > height+Math.max(this.w,this.h)) {
    this.killBody();
    return true;
  }
  return false;
};

// update the box's locations.  paper.js will handle the drawing after it is updated
// unlike p5/processing where draw function must draw the box again every time.
Box.prototype.update = function(event) {
  // Get the body's position
  var pos = B2Helper.scaleToPixels(this.body.GetPosition());
  // Get its angle of rotation
  var a = this.body.GetAngleDegrees();
  
  // Draw it!
  // translate:
  this.paperShape.position.x = pos.x;
  this.paperShape.position.y = pos.y;
  // rotation:
  this.paperShape.rotate(a-this.paperShape.rotation);

  // fade out when life decreases
  if (event.count % SHADER_FREQ === 0) { // do every half a second
    this.paperShape.opacity = Math.max(0,this.life) / MAX_LIFE;
  }

  // subtract orandom life every frame
  this.life -= getRandom(0, 1);

};

// for the particle (circle), x and y are in pixel space already.  let the B2Helper function do conversion.
var Particle = function(x, y, r) {
  this.r = getRandom(10, 20);

  //
  this.life = MAX_LIFE; // dies after MAX_LIFE frames, with some randomness.

   // Define a body
  var bd = new box2d.b2BodyDef();
  bd.type = box2d.b2BodyType.b2_dynamicBody;
  bd.position = B2Helper.scaleToWorld(x,y);

  // Define a fixture
  var fd = new box2d.b2FixtureDef();
  // Fixture holds shape
  fd.shape = new box2d.b2CircleShape();
  fd.shape.m_radius = B2Helper.scaleToWorld(this.r);
  
  // Some physics
  fd.density = 1.0;
  fd.friction = 0.1;
  fd.restitution = 0.8;
 
  // Create the body
  this.body = world.CreateBody(bd);
  // Attach the fixture
  this.body.CreateFixture(fd);

  // Some additional stuff
  this.body.SetLinearVelocity(new box2d.b2Vec2(getRandom(-10, 10), getRandom(2, 10)));
  //this.body.SetAngularVelocity(getRandom(-5,5));

  // creates the shape to be drawn by paper.js
  circle = new Path.Circle({
    center:  [0, 0],
    radius:   this.r,
    fillColor:    getRandomColor()
  });
  line = new Path.Line({
    from:   [0, 0],
    to:     [0+this.r, 0],
  });

  this.paperShape = new Group();
  this.paperShape.addChild(circle);
  this.paperShape.addChild(line);
  this.paperShape.strokeColor = 'black';
  this.paperShape.position = new Point(x, y);
  this.paperShape.transformContent = false;

};

// This function removes the particle from the box2d world, and also in paper.js
Particle.prototype.killBody = function() {
  world.DestroyBody(this.body);
  this.paperShape.remove();
};

// Is the particle ready for deletion?
Particle.prototype.done = function() {
  // Let's find the screen position of the particle
  var pos = B2Helper.scaleToPixels(this.body.GetPosition());
  var opacity;

  // Is it off the bottom of the screen?  also kill it if the life is non positive
  if (this.life <= 0 || pos.y > height+this.r*2) {
    this.killBody();
    return true;
  }
  return false;
};

// update the box's locations.  paper.js will handle the drawing after it is updated
// unlike p5/processing where draw function must draw the box again every time.
Particle.prototype.update = function(event) {
  // Get the body's position
  var pos = B2Helper.scaleToPixels(this.body.GetPosition());
  // Get its angle of rotation
  var a = this.body.GetAngleDegrees();
  
  // Draw it!

  // translate:
  this.paperShape.position.x = pos.x;
  this.paperShape.position.y = pos.y;

  // rotation:
  this.paperShape.rotate(a-this.paperShape.rotation);

  // fade out when life decreases
  if (event.count % SHADER_FREQ === 0) { // do every half a second
    opacity = Math.max(0,this.life) / MAX_LIFE;
    this.paperShape.opacity = opacity;
  }

  // subtract orandom life every frame
  this.life -= getRandom(0, 1);

};

// A fixed boundary class

  // A boundary is a simple rectangle with x,y,width,and height
var Boundary = function(x_,y_, w_, h_) {
  // But we also have to make a body for box2d to know about it
  // Body b;

  this.x = x_;
  this.y = y_;
  this.w = w_;
  this.h = h_;

  var fd = new box2d.b2FixtureDef();
  fd.density = 1.0;
  fd.friction = 0.5;
  fd.restitution = 0.2;
 
  var bd = new box2d.b2BodyDef();
 
  bd.type = box2d.b2BodyType.b2_staticBody;

  bd.position = B2Helper.scaleToWorld(this.x,this.y);
  //bd.position.x = B2Helper.scaleToWorld(this.x);
  //bd.position.y = B2Helper.scaleToWorld(this.y);
  fd.shape = new box2d.b2PolygonShape();
  fd.shape.SetAsBox(B2Helper.scaleToWorld(this.w/2), B2Helper.scaleToWorld(this.h/2));
  this.body = world.CreateBody(bd).CreateFixture(fd);

  // creates the shape to be drawn by paper.js
  this.paperShape = new Shape.Rectangle({
    point:  [this.x-this.w/2, this.y-this.h/2],
    size:   [this.w, this.h],
    strokeColor:  'black',
    fillColor:    getRandomColor()
  });
};

// event handler function for mouse (if applicable)

var mousePressed = function (event) {
  if (clickMe) {
    clickMe.remove();
    clickMe = null;
  }
  // create a new box at the mouse click location
  var b = new Box(event.point.x,event.point.y);
  boxes.push(b);
};

// main animation loop:

var draw = function (event) {

  // main simulation step for physics engine. 
  // 2nd and 3rd arguments are velocity and position iterations
  world.Step(timeStep,10,10);

  // Boxes fall from the top every so often
  var chance = getRandom(0,1);
  if (chance < 0.05) {
    var item;
    if (chance < 0.025) {
      item = new Box(width/2,30);
    } else {
      item = new Particle(width/2,30);
    }
    boxes.push(item);
  }

  // update location/orientation for all the boxes (rather than redrawing them)
  for (var i = boxes.length-1; i >= 0; i--) {
    boxes[i].update(event);
    if (boxes[i].done()) {
      boxes.splice(i,1);
    }
  }
};

// useful helper functions
var getRandom = function (min, max) {
  return Math.random() * (max - min) + min;
};

var getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

var getRandomColor = function() {
  var c = new Color(Math.random(), Math.random(), Math.random());
  return c;
};

// init and setup:

// timestep (1 frame = 1 / 60 fps)
var timeStep = 1.0/60;
var MAX_LIFE = 200; // life of object in frames
var SHADER_FREQ = 20;

// A reference to our box2d world
var world;

// A list we'll use to track fixed objects
var boundaries = [];

// A list for all of our boxes
var boxes = [];

// screen size
var height = view.size.height;
var width = view.size.width;

// Initialize box2d physics and create the world
world = B2Helper.createWorld();

// Add a bunch of fixed boundaries
boundaries.push(new Boundary(3*width/8,height*7/8,width/3,10));
boundaries.push(new Boundary(5*width/8,height/2,width/3,20));

var b = new Box(width/2,30);
boxes.push(b);

// write the fps into the canvas
var fps_data = new PointText(8, 24);
fps_data.content = 60;
fps_data.style = {
  fontFamily: 'Courier New',
  fontWeight: 'normal',
  fontSize: 16,
  fillColor: '#cacaca',
  justification: 'left'
};
fps_data.prevTimeStamp = 0.0;

var desc = new PointText(24, height-24);
desc.content = 'Boundary Objects.';
desc.style = {
  fontFamily: 'Courier New',
  fontWeight: 'normal',
  fontSize: 24,
  fillColor: '#aaaaaa',
  justification: 'left'
};

var clickMe = new PointText(width*1/4, height*1/4);
clickMe.content = 'Click on me.';
clickMe.style = {
  fontFamily: 'Courier New',
  fontWeight: 'normal',
  fontSize: 24,
  fillColor: '#eb6276',
  justification: 'center'
};

// set animation and event hooks:

view.onFrame = function(event) {
  var fps = Math.round(600 / (event.time-fps_data.prevTimeStamp)) / 10;
  // update fps every 60 frames.
  if ((event.count + 1) % 60 === 0) {
    fps_data.content = fps;
    fps_data.prevTimeStamp = event.time;
  }
  draw(event);
};

tool.onMouseDown = mousePressed;
tool.onMouseDrag = mousePressed;

}

};

