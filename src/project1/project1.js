// Always execute in strict mode (less bug)
'use strict';
/* to1DF32Array(a2DArray)
 *
 * This function turns an array of 4-element arrays a2DArray into a packed
 * 1-dimensional array of 32-bit floating-point numbers.
 *
 * NOTE: This function should not be here. It should be in your library.
 */
function to1DF32Array(a2DArray)
{
    var size = a2DArray.length;

    if(size == 0)
    {
        console.log("[alib/to1DF32Array - DEBUG]: size is 0");
        return new Float32Array([]);
    }

    // Turn 2D array into 1D array
    
    var result = [];
    var index = 0;

    for(var i = 0; i < size; i++)
    {
        var anElement = a2DArray[i];
        if(anElement.length != 4)
            console.log("[laib/to1DF32Array - ERROR]: Not a 4-element vector");
        
        result[index] = anElement[0];
        result[index + 1] = anElement[1];
        result[index + 2] = anElement[2];
        result[index + 3] = anElement[3];
        index += 4;
    }

    return new Float32Array(result);
}

// These variables must be global variables.
// Some callback functions may need to access them.
var gl = null;
var canvas = null;
var ctm_location;
var ctms = [[[1.0, 0.0, 0.0, 0.0],
	     [0.0, 1.0, 0.0, 0.0],
	     [0.0, 0.0, 1.0, 0.0],
	     [0.0, 0.0, 0.0, 1.0]],
	    [[1.0, 0.0, 0.0, 0.0],
	     [0.0, 0.87, -0.50, 0.0],
	     [0.0, 0.50, 0.87, 0.0],
	     [0.0, 0.0, 0.0, 1.0]],
	    [[1.0, 0.0, 0.0, 0.0],
	     [0.0, 0.50, -0.87, 0.0],
	     [0.0, 0.87, 0.50, 0.0],
	     [0.0, 0.0, 0.0, 1.0]],
	    [[1.0, 0.0, 0.0, 0.0],
	     [0.0, 0.0, -1.0, 0.0],
	     [0.0, 1.0, 0.0, 0.0],
	     [0.0, 0.0, 0.0, 1.0]]];
var ctm_index = 0;
var degs = [0, 30, 60, 90];
const triangNum = 30;
var object = "";
var ctm = [[1.0, 0.0, 0.0, 0.0],
[0.0, 1.0, 0.0, 0.0],
[0.0, 0.0, 1.0, 0.0],
[0.0, 0.0, 0.0, 1.0]];
var scaleUp = false;
var scaleDown = false;
var mouseDown = false;
var first = Array(4);
var last = Array(4);
var lastRotate = [[1.0, 0.0, 0.0, 0.0],
[0.0, 1.0, 0.0, 0.0],
[0.0, 0.0, 1.0, 0.0],
[0.0, 0.0, 0.0, 1.0]];

function initGL(canvas)
{
    gl = canvas.getContext("webgl");
    if(!gl)
    {
	alert("WebGL is not available...");
	return -1;
    }

    // Set the clear screen color to black (R, G, B, A)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Enable hidden surface removal
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    return 0;
}

function init()
{
    var positions = cubeVertices();
    //console.log(coneVertices(triangNum));
    positions = positions.concat(coneVertices(triangNum));
    //console.log(cylinderVertices(triangNum));
    positions = positions.concat(cylinderVertices(triangNum));
    //console.log(sphereVertices(triangNum));
    positions = positions.concat(sphereVertices(triangNum));
    //console.log(torusVertices(triangNum));
    positions = positions.concat(torusVertices(triangNum));
    //console.log(positions);

    var colors = randomCubeColors();
    colors = colors.concat(randomColors(4*triangNum + 5*triangNum*triangNum+180));
    //console.log(colors);

    // Load and compile shader programs
    var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    if(shaderProgram == -1)
	return -1;
    gl.useProgram(shaderProgram)

    // Allocate memory in a graphics card
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * (positions.length + colors.length), gl.STATIC_DRAW);
    // Transfer positions and put it at the beginning of the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));
    // Transfer colors and put it right after positions
    gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * positions.length, to1DF32Array(colors));

    // Vertex Position - locate and enable "vPosition"
    var vPosition_location = gl.getAttribLocation(shaderProgram, "vPosition");
    if (vPosition_location == -1)
    { 
        alert("Unable to locate vPosition");
        return -1;
    }
    gl.enableVertexAttribArray(vPosition_location);
    // vPosition starts at offset 0
    gl.vertexAttribPointer(vPosition_location, 4, gl.FLOAT, false, 0, 0);

    // Vertex Color - locate and enable vColor
    var vColor_location = gl.getAttribLocation(shaderProgram, "vColor");
    if (vColor_location == -1)
    { 
        alert("Unable to locate vColor");
        return -1;
    }
    gl.enableVertexAttribArray(vColor_location);
    // vColor starts at the end of positions
    gl.vertexAttribPointer(vColor_location, 4, gl.FLOAT, false, 0, 4 * 4 * positions.length);

    // Current Transformation Matrix - locate and enable "ctm"
    ctm_location = gl.getUniformLocation(shaderProgram, "ctm");
    if (ctm_location == -1)
    { 
        alert("Unable to locate ctm");
        return -1;
    }

    return 0;
}

function sphereVertices(size) {
    var thetaChange =  2*Math.PI/size;
    var theta = 0;
    var phiChange = Math.PI/size;
    var phi = -Math.PI/2;
    var sphere = [];
    var nextVertex = [];
    var bottomLeft = [0.0, -1.0, 0.0, 1.0];
    var topLeft = LinAlg.matrixVecMult(LinAlg.rotateZ(phiChange), bottomLeft);
    //outer for loop for each latitude strip (phi)
    for(phi = -Math.PI/2; !(phi>Math.PI/2); phi+=phiChange) {
    bottomLeft = LinAlg.matrixVecMult(LinAlg.rotateZ(phi), [1.0, 0.0, 0.0, 1.0]);
    topLeft = LinAlg.matrixVecMult(LinAlg.rotateZ(phi+phiChange), [1.0, 0.0, 0.0, 1.0]);
        //inner for loop for triangle in latitude (theta)
        for(let j=0; j<size; j++) {
            //two triangles (one rectangle) for each iteration!
            sphere.push(bottomLeft);
            sphere.push(LinAlg.matrixVecMult(LinAlg.rotateY(thetaChange), bottomLeft));
            sphere.push(topLeft);

            sphere.push(topLeft);
            bottomLeft = LinAlg.matrixVecMult(LinAlg.rotateY(thetaChange), bottomLeft);
            sphere.push(bottomLeft);
            topLeft = LinAlg.matrixVecMult(LinAlg.rotateY(thetaChange),topLeft);
            sphere.push(topLeft);
        }
    }
    return sphere;
}

function torusVertices(size) {
    var r1Change =  2*Math.PI/size;
    var r1 = 0;
    var r2Change = 2*Math.PI/size;
    var r2 = 0;
    var torus = [];
    var cur1 = [];
    var cur2 = [];
    var start = [0.4, 0.0, 0.0, 1.0];
    for(let i=0; i<size; i++) {
        for(let j=0; j<size; j++) {
            cur1 = LinAlg.matrixVecMult(LinAlg.rotateY(r1),LinAlg.matrixVecMult(LinAlg.transform(0.6,0,0), LinAlg.matrixVecMult(LinAlg.rotateZ(r2),start)));
            torus.push(cur1);
            torus.push(LinAlg.matrixVecMult(LinAlg.rotateY(r1Change), cur1));
            cur2 = LinAlg.matrixVecMult(LinAlg.rotateY(r1),LinAlg.matrixVecMult(LinAlg.transform(0.6,0,0), LinAlg.matrixVecMult(LinAlg.rotateZ(r2+r2Change),start)));
            torus.push(cur2);
            
            torus.push(cur2);
            torus.push(LinAlg.matrixVecMult(LinAlg.rotateY(r1Change), cur1));
            torus.push(LinAlg.matrixVecMult(LinAlg.rotateY(r1Change), cur2));
            r2 += r2Change;
        }
        r1 += r1Change;
    }
    return torus;
}

function coneVertices(size) {
    var thetaChange = -2*Math.PI/size;
    var theta = 0;
    var cone = [];
    var tip = [0.0, 0.5, 0.0, 1.0];
    var base = [0.0, -0.5, 0.0, 1.0]
    var nextVertex1 = [0.5*Math.sin(theta), -0.5, 0.5*Math.cos(theta), 1.0];
    var nextVertex2 = nextVertex1;
    for(let i=0; i<size; i++) {
        //diagonal triangle
        cone.push(nextVertex1);
        cone.push(tip);
        theta = theta+thetaChange;
        nextVertex2 = [0.5*Math.sin(theta), -0.5, 0.5*Math.cos(theta),1.0];
        cone.push(nextVertex2);
        //base triangle
        cone.push(nextVertex1);
        cone.push(nextVertex2);
        cone.push(base);
        nextVertex1 = nextVertex2;
    }
    return cone;
}

function cylinderVertices(size) {
    var thetaChange = -2*Math.PI/(size/2);
    var theta = 0;
    var cylinder = [];
    var top = [0.0, 0.5, 0.0, 1.0];
    var base = [0.0, -0.5, 0.0, 1.0]
    var baseVertex1 = [0.5*Math.sin(theta), -0.5, 0.5*Math.cos(theta), 1.0];
    var baseVertex2 = baseVertex1;
    var topVertex1 = [0.5*Math.sin(theta), 0.5, 0.5*Math.cos(theta), 1.0];
    var topVertex2 = topVertex1;
    for(let i=0; i<size/2; i++) {
        //top triangle
        cylinder.push(topVertex1);
        cylinder.push(top);
        theta = theta+thetaChange;
        topVertex2 = [0.5*Math.sin(theta), 0.5, 0.5*Math.cos(theta),1.0];
        cylinder.push(topVertex2);
        //top vertical triangle
        cylinder.push(topVertex1);
        cylinder.push(topVertex2);
        cylinder.push(baseVertex1);
        //base vertical triangle
        cylinder.push(baseVertex1);
        cylinder.push(topVertex2);
        baseVertex2 = [0.5*Math.sin(theta), -0.5, 0.5*Math.cos(theta),1.0];
        cylinder.push(baseVertex2);
        //base triangle
        cylinder.push(baseVertex1);
        cylinder.push(baseVertex2);
        cylinder.push(base);
        baseVertex1 = baseVertex2;
        topVertex1 = topVertex2;
    }
    return cylinder;
}

function cubeVertices() {
    var cube = [];
    //first face
    cube.push([0.5,0.5,0.5,1.0]);
    cube.push([-0.5,0.5,0.5,1.0]);
    cube.push([-0.5,-0.5,0.5,1.0]);
    cube.push([-0.5,-0.5,0.5,1.0]);
    cube.push([0.5,-0.5,0.5,1.0]);
    cube.push([0.5,0.5,0.5,1.0]);
    //second face
    cube.push([0.5,0.5,-0.5,1.0]);
    cube.push([-0.5,-0.5,-0.5,1.0]);
    cube.push([-0.5,0.5,-0.5,1.0]);
    cube.push([-0.5,-0.5,-0.5,1.0]);
    cube.push([0.5,0.5,-0.5,1.0]);
    cube.push([0.5,-0.5,-0.5,1.0]);
    //third face
    cube.push([0.5,0.5,0.5,1.0]);
    cube.push([0.5,-0.5,-0.5,1.0]);
    cube.push([0.5,0.5,-0.5,1.0]);
    cube.push([0.5,-0.5,-0.5,1.0]);
    cube.push([0.5,0.5,0.5,1.0]);
    cube.push([0.5,-0.5,0.5,1.0]);
    //fourth face
    cube.push([-0.5,0.5,0.5,1.0]);
    cube.push([-0.5,0.5,-0.5,1.0]);
    cube.push([-0.5,-0.5,-0.5,1.0]);
    cube.push([-0.5,-0.5,-0.5,1.0]);
    cube.push([-0.5,-0.5,0.5,1.0]);
    cube.push([-0.5,0.5,0.5,1.0]);
    //fifth face
    cube.push([0.5,0.5,0.5,1.0]);
    cube.push([-0.5,0.5,-0.5,1.0]);
    cube.push([-0.5,0.5,0.5,1.0]);
    cube.push([-0.5,0.5,-0.5,1.0]);
    cube.push([0.5,0.5,0.5,1.0]);
    cube.push([0.5,0.5,-0.5,1.0]);
    //sixth face
    cube.push([0.5,-0.5,0.5,1.0]);
    cube.push([-0.5,-0.5,0.5,1.0]);
    cube.push([-0.5,-0.5,-0.5,1.0]);
    cube.push([-0.5,-0.5,-0.5,1.0]);
    cube.push([0.5,-0.5,-0.5,1.0]);
    cube.push([0.5,-0.5,0.5,1.0]);
    return cube;
}

function mouseDrag() {
    if(Math.pow(first[0],2)+Math.pow(first[1],2) <= 1 && Math.pow(last[0],2)+Math.pow(last[1],2) <= 1) {
        first[2] = Math.sqrt(1-Math.pow(first[0],2)-Math.pow(first[1],2));
        first[3] = 0;
        last[2] = Math.sqrt(1-Math.pow(last[0],2)-Math.pow(last[1],2));
        last[3] = 0;
        let aboutVector = LinAlg.crossProduct(last,first);
        let theta = Math.acos(LinAlg.dotProduct(first,last)/(LinAlg.magnitude(first)*LinAlg.magnitude(last)));
        rotateAbout(LinAlg.normalize(aboutVector), theta, [0.0,0.0,0.0,0.0]);
    }
}

function rotateAbout(aboutVector, theta, point) {
    let alphaX = aboutVector[0];
    let alphaY = aboutVector[1];
    let alphaZ = aboutVector[2];
    console.log(alphaX + " " + alphaY + " " + alphaZ);
    let d = Math.sqrt(Math.pow(alphaY,2)+Math.pow(alphaZ,2));
    //M = T(p0)Rx(-thetaX)Ry(thetaY)Rz(theta)Ry(-thetaY)Rx(thetaX)T(-p0)
    let transform_to = LinAlg.transform(-1.0*point[0],-1.0*point[1],-1.0*point[2]);
    let rotateX = [[1.0, 0.0, 0.0, 0.0],[0.0, alphaZ/d, alphaY/d, 0.0],[0.0, -alphaY/d, alphaZ/d, 0.0],[0.0, 0.0, 0.0, 1.0]];
    let rotateY = [[d, 0.0, alphaX, 0.0],[0.0, 1.0, 0, 0.0],[-alphaX, 0.0, d, 0.0],[0.0, 0.0, 0.0, 1.0]];
    let rotateZ = LinAlg.rotateZ(-theta);
    let rotateY_back = [[d, 0.0, -alphaX, 0.0],[0.0, 1.0, 0, 0.0],[alphaX, 0.0, d, 0.0],[0.0, 0.0, 0.0, 1.0]];
    let rotateX_back = [[1.0, 0.0, 0.0, 0.0],[0.0, alphaZ/d, -alphaY/d, 0.0],[0.0, alphaY/d, alphaZ/d, 0.0],[0.0, 0.0, 0.0, 1.0]]
    let transform_back = LinAlg.transform(point[0],point[1],point[2]);
    var rotated = LinAlg.matrixMatrixMult(transform_back, LinAlg.matrixMatrixMult(rotateX_back, LinAlg.matrixMatrixMult(rotateY_back, LinAlg.matrixMatrixMult(rotateZ, LinAlg.matrixMatrixMult(rotateY,LinAlg.matrixMatrixMult(rotateX, transform_to))))));
    lastRotate = rotated;
    ctm = LinAlg.matrixMatrixMult(rotated, ctm);
    for(let i=0; i<4; i++) {
        first[i] = last[i];
    }
}

function randomColors(size) {
    var colors = [];
    for(let i=0; i<size; i++) {
        let r = Math.random();
        let g = Math.random();
        let b = Math.random();
        let color = [r, g, b, 1.0];
        colors.push(color);
        colors.push(color);
        colors.push(color);
    }
    return colors;
}

function randomCubeColors() {
    var colors = [];
    for(let i=0; i<(6); i++) {
        let r = Math.random();
        let g = Math.random();
        let b = Math.random();
        let color = [r, g, b, 1.0];
        colors.push(color);
        colors.push(color);
        colors.push(color);
        colors.push(color);
        colors.push(color);
        colors.push(color);
    }
    return colors;
}

function display()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    // Draw the object
    if(object === "cube") {
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    } else if (object === "cone") {
        gl.drawArrays(gl.TRIANGLES, 36, 6*triangNum);
    } else if (object === "cylinder") {
        gl.drawArrays(gl.TRIANGLES, 36+6*triangNum, 6*triangNum);
    } else if (object === "sphere") {
        gl.drawArrays(gl.TRIANGLES, 36+12*triangNum, 6*triangNum*triangNum);
    } else if (object === "torus") {
        gl.drawArrays(gl.TRIANGLES, 36+12*triangNum+6*triangNum*triangNum+180, 6*triangNum*triangNum+180);
    }
}

function mouseDownCallback(event) {
    //console.log("mouseDownCallback(): " + "event.which = " + event.which + ", x = " + (event.clientX - canvas.offsetLeft) + ", y = " + (event.clientY - canvas.offsetTop));
    mouseDown = true;
    first[0] = (event.clientX-canvas.offsetLeft-256)/256;
    first[1] = (canvas.offsetTop+256-event.clientY)/256;
    lastRotate = [[1.0, 0.0, 0.0, 0.0],[0.0, 1.0, 0.0, 0.0],[0.0, 0.0, 1.0, 0.0],[0.0, 0.0, 0.0, 1.0]];
}

function mouseUpCallback(event) {
    mouseDown = false;
    //console.log("mouseUpCallback(): " + "event.which = " + event.which + ", x = " + (event.clientX - canvas.offsetLeft) + ", y = " + (event.clientY - canvas.offsetTop));
}

function mouseMoveCallback(event) {
    last[0] = (event.clientX-canvas.offsetLeft-256)/256;
    last[1] = (canvas.offsetTop+256-event.clientY)/256;
    if(mouseDown) {
        mouseDrag();
    }
    //console.log("mouseMoveCallback(): " + "event.which = " + event.which + ", x = " + (event.clientX - canvas.offsetLeft) + ", y = " + (event.clientY - canvas.offsetTop));
}

function scaling(event) {
    event.preventDefault();
    let scale = event.deltaY;
    if(scale > 0) {
        scaleDown = true;
    } else {
        scaleUp = true;
    }
}

function keyDownCallback(event)
{
    if(event.keyCode == 32)
    {
	ctm_index += 1;
	if(ctm_index == 4)
	    ctm_index = 0;
	console.log("Tilting backward " + degs[ctm_index] + " degrees")
	display()
    } else if(event.keyCode == 37) {
        scaleDown = true;
    } else if(event.keyCode == 39) {
        scaleUp = true;
    } else if(event.keyCode == 67) {
        object = "cube";
        display();
    } else if(event.keyCode == 79) {
        object = "cone";
        display();
    } else if(event.keyCode == 76) {
        object = "cylinder";
        display();
    } else if(event.keyCode == 83) {
        object = "sphere";
        display();
    } else if(event.keyCode == 84) {
        object = "torus";
        display();
    } 
}

function idle()
{
    if(scaleDown){
        scaleDown = false;
        ctm = LinAlg.matrixMatrixMult(LinAlg.scale(1/1.02,1/1.02,1/1.02),ctm);
    } else if (scaleUp) {
        scaleUp = false;
        ctm = LinAlg.matrixMatrixMult(LinAlg.scale(1.02,1.02,1.02),ctm);
    }
    if(!mouseDown) {
        ctm = LinAlg.matrixMatrixMult(lastRotate, ctm);
    }
    display();
    requestAnimationFrame(idle);
}

function main()
{
    canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
	    return -1;
    if(init() == -1)
	    return -1;
    
    // Register callback functions
    // Comment out those that are not used.
    canvas.onmousedown = mouseDownCallback;
    canvas.onmouseup = mouseUpCallback;
    canvas.onmousemove = mouseMoveCallback;
    document.getElementById("gl-canvas").onwheel = scaling;
    document.onkeydown = keyDownCallback;
    
    display();
    requestAnimationFrame(idle);
}
