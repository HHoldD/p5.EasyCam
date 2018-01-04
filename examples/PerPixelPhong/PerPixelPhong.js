

var easycam;
var phongshader;


// function preload() {
  // phongshader = loadShader('vert.glsl', 'frag.glsl');
// }



function setup () {
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
 
  easycam = createEasyCam();
 
  var phong_vert = document.getElementById("phong.vert").textContent;
  var phong_frag = document.getElementById("phong.frag").textContent;
  
  phongshader = new p5.Shader(this._renderer, phong_vert, phong_frag);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0,0,windowWidth, windowHeight]);
}



var m4_camera = new p5.Matrix();
var m3_camera = new p5.Matrix('mat3');

function backupCameraMatrix(){
  // camera matrix: for transforming positions
  m4_camera.set(easycam.renderer.uMVMatrix);
  // inverse transpose: for transforming directions
  m3_camera.inverseTranspose(m4_camera);
}



function draw () {
  
  // save current state of the modelview matrix
  backupCameraMatrix();

  // some animated pointlight positions
  var radius = 400;
  var angle = -frameCount * 0.005;
  var pl_x = cos(angle) * radius;
  var pl_y = sin(angle) * radius;
  
  var pl_z = (sin(frameCount * 0.05) * 0.5 + 0.5) * 150;
  
  
  //////////////////////////////////////////////////////////////////////////////
  //
  // MATERIALS
  //
  //////////////////////////////////////////////////////////////////////////////
  
  var matWhite = {
    diff     : [1,1,1],
    spec     : [1,1,1],
    spec_exp : 400.0,
  };
  
  var matRed = {
    diff     : [1,0.05,0],
    spec     : [1,0,0],
    spec_exp : 800.0,
  };
  
  var matBlue = {
    diff     : [0,0.05,1],
    spec     : [0,0,1],
    spec_exp : 100.0,
  };
  
  var matGreen = {
    diff     : [0.05,1,0],
    spec     : [0,1,0],
    spec_exp : 800.0,
  };
  
  var matYellow = {
    diff     : [1,1,0],
    spec     : [1,1,0],
    spec_exp : 100.0,
  };
  
  var materials = [ matWhite, matRed, matBlue, matGreen, matYellow ];
  
  
  //////////////////////////////////////////////////////////////////////////////
  //
  // LIGHTS
  //
  //////////////////////////////////////////////////////////////////////////////
  
  var ambientlight = {
    col : [0.005, 0.01, 0.02],
  };
  
  
  var directlights = [
    {
      dir : [-1,-1,-2],
      col : [0.1, 0.075, 0.050],
    },
  ];
  

  var pointlights = [
    {
      pos : [pl_x, pl_y, 10,1],
      col : [1, 0, 0],
      att : 400,
    },
    
    {
      pos : [pl_y, pl_x, 10, 1],
      col : [0, 0, 1],
      att : 400,
    },
    
    {
      pos : [pl_x, 0, pl_z, 1],
      col : [1, 1, 0],
      att : 400,
    },
  ];
  
  
  //////////////////////////////////////////////////////////////////////////////
  //
  // shader, light-uniforms, etc...
  //
  //////////////////////////////////////////////////////////////////////////////
  
  setShader(phongshader);
 
  setAmbientlight(phongshader, ambientlight);
  setDirectlight(phongshader, directlights);
  setPointlight(phongshader, pointlights);
  
  
  
  
  //////////////////////////////////////////////////////////////////////////////
  //
  // scene, material-uniforms
  //
  //////////////////////////////////////////////////////////////////////////////
 
  background(16);
  noStroke();
  

  // display pointlights as little boxes, just as visual guides
  for(var i = 0; i < pointlights.length; i++){
    var pl = pointlights[i];
    push();  
    translate(pl.pos[0], pl.pos[1], pl.pos[2]);
    setMaterial(phongshader, matWhite);
    box(5);
    pop();
  }
  
  
  // ground
  push();  
  translate(0, 0, -5);
  setMaterial(phongshader, matWhite);
  box(1000, 1000, 10);
  pop();
  

  push();
  translate(0, 0, 100);
  setMaterial(phongshader, matWhite);
  sphere(80);
  pop();
  
  push();  
  translate(0, 0, 100);
  setMaterial(phongshader, matWhite);
  torus(200, 25, 40, 20);
  pop();
  
  
  push();
  rotateZ(frameCount * 0.01);
  translate(200, 0, 100);
  rotateX(PI/2);
  setMaterial(phongshader, matWhite);
  sphere(50);
  pop();
  
  
  push();
  translate(200, 0, 100);
  setMaterial(phongshader, matWhite);
  box(20, 100, 200);
  pop();
  
  // push();  
  // translate(-200, 0, 100);
  // setMaterial(phongshader, matWhite);
  // box(50, 50, 200);
  // pop();
  

  push();  
  translate(0, 300, 130);
  rotateX(PI/2);
  setMaterial(phongshader, matWhite);
  torus(100, 30, 40, 20);
  pop();
  
  
  randomSeed(0);
  var NX = 3;
  var NY = 3;
  var radius = 50;
  push();
  var dimx = radius * 2 * (NX-1);
  var dimy = radius * 2 * (NY-1);
  translate(-dimx/2, -dimy * 1.5, radius);
  rotateX(PI/2);
  for(var y = 0; y < NY; y++){
    for(var x = 0; x < NX; x++){
      
      var tx = x * radius * 2;
      var ty = y * radius * 2;
      push();
      
      var idx = (y * NY + x) % materials.length;
      setMaterial(phongshader, materials[idx]);
      
      translate(tx, ty, 0);
      box(radius * 1.2);
      pop();
    }
  }
  pop();
  
}



function setShader(shader){
  shader.uniforms.uUseLighting = true; // required for p5js
  this.shader(shader);
}


function setMaterial(shader, material){
  shader.setUniform('material.diff'    , material.diff);
  shader.setUniform('material.spec'    , material.spec);
  shader.setUniform('material.spec_exp', material.spec_exp);
}


function setAmbientlight(shader, ambientlight){
  shader.setUniform('ambientlight.col', ambientlight.col);
}


function setDirectlight(shader, directlights){
  
  for(var i = 0; i < directlights.length; i++){
    
    var light = directlights[i];
    
    // normalize
    var x = light.dir[0];
    var y = light.dir[1];
    var z = light.dir[2];
    var mag = Math.sqrt(x*x + y*y + z*z); // should not be zero length
    var light_dir = [x/mag, y/mag, z/mag];
    
    // transform to camera-space
    light_dir = mult(m3_camera, light_dir);
    
    // set shader uniforms
    shader.setUniform('directlights['+i+'].dir', light_dir);
    shader.setUniform('directlights['+i+'].col', light.col);
  }
}


function setPointlight(shader, pointlights){
  
  for(var i = 0; i < pointlights.length; i++){
    
    var light = pointlights[i];
    
    // transform to camera-space
    var light_pos = mult(m4_camera, light.pos);
    
    // set shader uniforms
    shader.setUniform('pointlights['+i+'].pos', light_pos);
    shader.setUniform('pointlights['+i+'].col', light.col);
    shader.setUniform('pointlights['+i+'].att', light.att);
  }
}





//
// transforms a vector by a matrix (m4 or m3)
//
function mult(mat, vSrc, vDst){
  
  vDst = ((vDst === undefined) || (vDst.constructor !== Array)) ? [] : vDst;
  
  var x ,y ,z, w;
  
  if(vSrc instanceof p5.Vector){
    x = vSrc.x
    y = vSrc.y;
    z = vSrc.z;
    w = 1;
  } else if(vDst.constructor === Array){
    x = vSrc[0];
    y = vSrc[1];
    z = vSrc[2];
    w = vSrc[3]; w = (w === undefined) ? 1 : w;
  } else {
    console.log("vSrc must be a vector");
  }
  
  if(mat instanceof p5.Matrix){
    mat = mat.mat4 || mat.mat3;
  }
  
  if(mat.length === 16){
    vDst[0] = mat[0]*x + mat[4]*y + mat[ 8]*z + mat[12]*w,
    vDst[1] = mat[1]*x + mat[5]*y + mat[ 9]*z + mat[13]*w,
    vDst[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
    vDst[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w; 
  } 
  else if(mat.length === 9) {
    vDst[0] = mat[0]*x + mat[3]*y + mat[6]*z,
    vDst[1] = mat[1]*x + mat[4]*y + mat[7]*z,
    vDst[2] = mat[2]*x + mat[5]*y + mat[8]*z;
  }
 
  return vDst;
}








