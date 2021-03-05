"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;
var modelViewMatrixLoc;
var projectionMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var x_bear = -15;
var y_bear = 2;

var torsoId = 0;
var headId  = 1;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailId = 10;

var torsoHeight = 3.0;
var torsoWidth = 7.2;
var torsoDepth = 5.0;
var upperArmHeight = 2.5;
var lowerArmHeight = 2.0;
var upperArmWidth  = 1.0;
var lowerArmWidth  = 0.8;
var upperLegHeight = 2.5;
var lowerLegHeight = 2.0;
var upperLegWidth  = 1.0;
var lowerLegWidth  = 0.8;
var headHeight = 2.5;
var headWidth = 2.5;
var tailHeight = 1;
var tailWidth = 1;

var trunkId = 0;
var treehairId = 1;

var trunkHeight = 15.0;
var trunkWidth = 2.0;
var treehairHeight = 8.0;
var treehairWidth = 8.0;

var initTree_x = 0;
var initTree_y = 0;

var numNodesBear = 11;
var numNodesTree = 2;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 15, 5, 0, 5, -10, 0, 10, 5, 0];
var flag = [null, null, false, null, false, null, false, null, false, null, true];

var numVertices = 24;

var stack = [];

var bear = [];
var tree = [];

for( var i=0; i<numNodesBear; i++) bear[i] = createNode(null, null, null, null);
for( var i=0; i<numNodesTree; i++) tree[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var texCoordsArray = [];
var texCoordsArray2 = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var applyTexture  = true;
var applyTextureH = true;
var bear_part     = true;
var trunk_part    = true;
var treehair_part = true;

var texSize = 256;
var numChecks = 8;

var c;
var texture;
var textureH;

var image = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchx % 2 ^ patchy % 2) c = 255;
        else c = 0;
        image[4 * i * texSize + 4 * j] = c;
        image[4 * i * texSize + 4 * j + 1] = c;
        image[4 * i * texSize + 4 * j + 2] = c;
        image[4 * i * texSize + 4 * j + 3] = 255;
    }
}

var imageH = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        imageH[4 * i * texSize + 4 * j] = texSize + j;
        imageH[4 * i * texSize + 4 * j + 1] = texSize + j;
        imageH[4 * i * texSize + 4 * j + 2] = texSize + j;
        imageH[4 * i * texSize + 4 * j + 3] = 255;
    }
}



//-------------------------------------------


function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodesBear(Id) {

    var m = mat4();

    switch(Id) {
    	
    case torsoId:
    	m = translate(x_bear, y_bear, 0.0);
    	m = mult(m, rotate(theta[torsoId], 0, 0, 1));
    	bear[torsoId] = createNode( m, torso, null, headId );
    	break;

    case headId:
    	m = translate(torsoWidth-2.8, 0.5*torsoHeight, 0.0); 
	  	m = mult(m, rotate(theta[headId], vec3(0, 0, 1)));
    	bear[headId] = createNode( m, head, leftUpperArmId, null); //leftUpperArmId
    	break;

    case leftUpperArmId:
	    m = translate(0.5*torsoWidth-0.5*upperArmWidth, upperArmHeight-0.6, -0.5*torsoDepth);
	    m = mult(m, rotate(180, 1, 0, 0));
		m = mult(m, rotate(theta[leftUpperArmId], vec3(0, 0, 1)));
    	bear[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    	break;

    case leftLowerArmId:
	    m = translate(0.0, upperArmHeight, 0.0);
    	m = mult(m, rotate(theta[leftLowerArmId], vec3(0, 0, 1)));
    	bear[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    	break;

    case rightUpperArmId:
	    m = translate(0.5*torsoWidth-0.5*upperArmWidth, upperArmHeight-0.6, 0.5*torsoDepth);
	    m = mult(m, rotate(180, 1, 0, 0));
	  	m = mult(m, rotate(theta[rightUpperArmId], vec3(0, 0, 1)));
    	bear[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    	break;

    case rightLowerArmId:
	    m = translate(0.0, upperArmHeight, 0.0);
    	m = mult(m, rotate(theta[rightLowerArmId], vec3(0, 0, 1)));
    	bear[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    	break;

    case leftUpperLegId:
	    m = translate(-(0.5*torsoWidth-0.5*upperArmWidth), upperArmHeight-0.6, -0.5*torsoDepth);
	    m = mult(m, rotate(180,1,0,0));
	  	m = mult(m , rotate(theta[leftUpperLegId], vec3(0, 0, 1)));
    	bear[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    	break;

    case leftLowerLegId:
	    m = translate(0.0, upperArmHeight, 0.0);
    	m = mult(m, rotate(theta[leftLowerLegId], vec3(0, 0, 1)));
    	bear[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    	break;

    case rightUpperLegId:
	    m = translate(-(0.5*torsoWidth-0.5*upperArmWidth), upperArmHeight-0.6, 0.5*torsoDepth);
	    m = mult(m, rotate(180,1,0,0));
		m = mult(m, rotate(theta[rightUpperLegId], vec3(0, 0, 1)));
    	bear[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId ); //prima tailid =null
    	break;

    case rightLowerLegId:
	    m = translate(0.0, upperArmHeight, 0.0);
    	m = mult(m, rotate(theta[rightLowerLegId], vec3(0, 0, 1)));
    	bear[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    	break;

    case tailId:
	    m = translate(-0.5*torsoWidth-0.5, 0.5*torsoHeight+0.5*tailHeight, 1.0);
    	m = mult(m, rotate(theta[tailId], vec3(0, 0, 1)));
    	bear[tailId] = createNode( m, tail, null, null );
    	break;

    }

}

function initNodesTree(id) {
    var m = mat4();

    switch (id) {

        case trunkId:
            m = translate(initTree_x, initTree_y, -3.5);
            tree[trunkId] = createNode(m, trunk, null, treehairId);
            break;


        case treehairId:
            m = translate(0.0, trunkHeight, 0.0);
            tree[treehairId] = createNode(m, treehair, null, null );
            break;

    }

}


function configureTexture() {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    textureH = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureH);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageH);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


function traverseBear(Id) {
    if(Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, bear[Id].transform);
    bear[Id].render();
    if(bear[Id].child != null) traverseBear(bear[Id].child);
    modelViewMatrix = stack.pop();
    if(bear[Id].sibling != null) traverseBear(bear[Id].sibling);
}

function traverseTree(Id) {
	if(Id == null) return;
	stack.push(modelViewMatrix);
   	modelViewMatrix = mult(modelViewMatrix, tree[Id].transform);
   	tree[Id].render();
   	if(tree[Id].child != null) traverseTree(tree[Id].child);
    modelViewMatrix = stack.pop();
   	if(tree[Id].sibling != null) traverseTree(tree[Id].sibling);
}

function torso() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) ); 	
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {
    applyTexture  = true;
    applyTextureH = false;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*headHeight, 0.0 ));		
	instanceMatrix = mult(instanceMatrix, scale4(1.5, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*upperArmHeight, 0.0) );		
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5*lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
	instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function tail() {
    applyTexture  = false;
    applyTextureH = true;
	bear_part     = true;
	trunk_part    = false;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*tailHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function trunk() {
    applyTexture  = false;
    applyTextureH = false;
	bear_part     = false;
	trunk_part    = true;
	treehair_part = false;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * trunkHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(trunkWidth, trunkHeight, trunkWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function treehair() {
    applyTexture  = false;
    applyTextureH = false;
	bear_part     = false;
	trunk_part    = false;
	treehair_part = true;
    gl.uniform1f(gl.getUniformLocation(program, "bear_part"),     bear_part);
    gl.uniform1f(gl.getUniformLocation(program, "trunk_part"),    trunk_part);
    gl.uniform1f(gl.getUniformLocation(program, "treehair_part"), treehair_part);
    gl.uniform1f(gl.getUniformLocation(program, "applyTexture"),  applyTexture);
    gl.uniform1f(gl.getUniformLocation(program, "applyTextureH"),  applyTextureH);
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * treehairHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(treehairWidth, treehairHeight, treehairWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);
    texCoordsArray2.push(texCoord[0]);
    pointsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray2.push(texCoord[1]);
    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);
    texCoordsArray2.push(texCoord[2]);
    pointsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
    texCoordsArray2.push(texCoord[3]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


var thetac  = 60/180;
var phi = 70/180;
var radius = 1;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST); //aggiunto da me
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray2), gl.STATIC_DRAW);

    var vTexCoord2 = gl.getAttribLocation(program, "vTexCoord2");
    gl.vertexAttribPointer(vTexCoord2, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord2);

    configureTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, "Tex"), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textureH);
    gl.uniform1i(gl.getUniformLocation(program, "TexH"), 1);
    
    document.getElementById("startBtn").onclick = function(){requestAnimationFrame(startMovement);};

    for(i=0; i<numNodesBear; i++) initNodesBear(i);
    for(i=0; i<numNodesTree; i++) initNodesTree(i);

    render();
    
}


function legMovement(id){
	
	switch(id){
		
		case leftUpperArmId:
		case leftUpperLegId:
			
          	if(theta[id] <= -20){flag[id] = false;}
          	if(theta[id] >= 20){flag[id] = true;}
          	if(flag[id]) theta[id]-= 2;
          	else theta[id]+= 2;
        	break;
		
		case rightUpperArmId:
		case rightUpperLegId:
		
			if(theta[id] <= -20){flag[id] = false;}
          	if(theta[id] >= 20){flag[id] = true;}
          	if(flag[id]){ theta[id]-= 2;}
          	else theta[id] +=2;
      		break;
		
	}
}

function startMovement(){
	
	x_bear+=0.05;
	if(x_bear<6){
		
		for (var i=leftUpperArmId; i<=rightLowerLegId; i++)legMovement(i);
		traverseTree(trunkId);
		drawBear();
		requestAnimationFrame(startMovement);
	}
	else{
		requestAnimationFrame(standup);
	}
}

function standup(){
	
//	x_bear = 6;
	y_bear = 8;
	
	if(theta[torsoId] > -90){flag[torsoId] = true;}
    if(theta[torsoId] <= -90){flag[torsoId] = false;}
    if(flag[torsoId]) theta[torsoId]+= -3;
    else theta[torsoId]+=0;
    
    if(theta[headId] >= 90){flag[headId] = false;}
    if(theta[headId] < 90){flag[headId] = true;}
    if(flag[headId]) theta[headId]+= 3;
    else theta[headId]+=0;
    
	if(theta[rightUpperLegId] > -90){flag[rightUpperLegId] = true;}
    if(theta[rightUpperLegId] <= -90){flag[rightUpperLegId] = false;}
    if(flag[rightUpperLegId]) theta[rightUpperLegId]+= -3;
    else theta[rightUpperLegId]+=0;
    
	if(theta[leftUpperLegId] > -90){flag[leftUpperLegId] = true;}
    if(theta[leftUpperLegId] <= -90){flag[leftUpperLegId] = false;}
    if(flag[leftUpperLegId]) theta[leftUpperLegId]+= -3;
    else theta[leftUpperLegId]+=0;
    
    
    if(theta[torsoId] != -90){
	    traverseTree(trunkId);
		drawBear();
		requestAnimationFrame(standup);
	}
	else {
		requestAnimationFrame(scratchDown);
	}
	
}


function scratchUp(){
	
	var step = 0.05;
	y_bear+=step;
	
	if(y_bear<=8){
		
		theta[rightUpperLegId] += -Math.acos(step / (2.0 * upperLegHeight));
		theta[leftUpperLegId]  += -Math.acos(step / (2.0 * upperLegHeight));
		theta[rightLowerLegId] +=  2.0 * Math.acos(step / (2.0 * lowerLegHeight));
		theta[leftLowerLegId]  +=  2.0 * Math.acos(step / (2.0 * lowerLegHeight));
		
		traverseTree(trunkId);
		drawBear();
		requestAnimationFrame(scratchUp);
	}
	else{
		requestAnimationFrame(scratchDown);
	}

}

function scratchDown(){
	
	var step = 0.05;
	y_bear-=step;
	
	if(y_bear>6){
		
		theta[rightUpperLegId] +=  Math.acos(step / (2.0 * upperLegHeight));
		theta[leftUpperLegId]  +=  Math.acos(step / (2.0 * upperLegHeight));
		theta[rightLowerLegId] += -2.0 * Math.acos(step / (2.0 * lowerLegHeight));
		theta[leftLowerLegId]  += -2.0 * Math.acos(step / (2.0 * lowerLegHeight));
		
		traverseTree(trunkId);
		drawBear();
		requestAnimationFrame(scratchDown);
	}
	else{
		requestAnimationFrame(scratchUp);
	}
	
}


function drawBear(){
	for (var i=0; i<numNodesBear; i++) initNodesBear(i);
	traverseBear(torsoId);
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );
        eye = vec3(radius*Math.sin(phi), radius*Math.sin(thetac), radius*Math.cos(phi));
        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = ortho(-25.0, 25.0, -25.0, 25.0, -25.0, 25.0);
	    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    	gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

        traverseBear(torsoId);
        traverseTree(trunkId);
        requestAnimationFrame(render);
}
