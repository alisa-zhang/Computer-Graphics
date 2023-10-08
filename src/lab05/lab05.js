// Always execute in strict mode (less bug)
'use strict';

var vertWalls = [];
var horzWalls = [];

function makeMaze() {
    //entrance top left, exit bottom right
    //create the horizontal walls
    for(let i=0; i<9; i++) {
        let arr = new Array(8);
        if(i===0 || i===8) {
            arr.fill(true);
        } else {
            arr.fill(false);
        }
        horzWalls.push(arr);
    }
    
    //create the vertical walls
    for(let i=0; i<8; i++) {
        let arr = new Array(9);
        for(let j=0; j<9; j++) {
            if ((i===0 && j===0) || (i===7 && j===8)) {
                //entrance and exit
                arr[j] = false;
            } else if(j===0 || j===8) {
                //left and right walls
                arr[j] = true;
            } else {
                arr[j] = false;
            }
        }
        vertWalls.push(arr);
    }
}

function createMaze(vertStart, vertEnd, horzStart, horzEnd) {
    if(vertEnd===vertStart || horzEnd===horzStart) {
        return;
    }
    //select the wall that stays closed
    let closed = getRandomInt(4);

    //set intersection point, to the LEFT of horz and TOP of vert
    let vert = vertStart + getRandomInt(vertEnd-vertStart);
    let horz = horzStart + getRandomInt(horzEnd-horzStart);

    //generate the openings
    let top = vertStart + getRandomInt(vert-vertStart);
    let bottom = vertEnd - getRandomInt(vertEnd-vert);
    let left = horzStart + getRandomInt(horz-horzStart);
    let right = horzEnd - getRandomInt(horzEnd-horz);
    //console.log("vertStart " + vertStart + "vertEnd " + vertEnd + "horzStart " + horzStart + "horzEnd " + horzEnd);
    //console.log("intersect" + vert + " " + horz);
    //console.log("top " + top + "bottom " + bottom + "left " + left + "right " + right + "closed " + closed);

    for(let i=vertStart; i<(vertEnd+1); i++) {
        //incorporate the wall that stays closed
        if((i!=top && i!=bottom) || (i === top && closed === 0) || (i === bottom && closed === 1)) {
            vertWalls[i][horz+1] = true;
        }
    }
    for(let i=horzStart; i<(horzEnd+1); i++) {
        if((i!=left && i!=right) || (i === left && closed === 2) || (i === right && closed === 3)) {
            horzWalls[vert+1][i] = true;
        }
    }
    //printMaze();
    createMaze(vertStart, vert, horzStart, horz);
    createMaze(vertStart, vert, horz+1, horzEnd);
    createMaze(vert+1, vertEnd, horzStart, horz);
    createMaze(vert+1, vertEnd, horz+1, horzEnd);
}

function printMaze() {
    //just a bunch of if statements
    let output = "";
    for(let i=0; i<8; i++) {
        output += "+";
        //print the horizontal walls
        for(let j=0; j<8; j++) {
            if(horzWalls[i][j]){
                output += "---";
            } else {
                output += "   ";
            }
            output += "+";
        }
        output += "\n";
        //`make sure this catches the first and the last one?
        //print the vertical walls
        for(let j=0; j<9; j++) {
            if(vertWalls[i][j]) {
                output += "|";
            } else {
                output += " ";
            }
            if(j!=8) {
                output += "   ";
            }
        }
        output += "\n";
    }

    //`add the last horizontal line!
    output += "+---+---+---+---+---+---+---+---+";
    console.log(output);
}

function getRandomInt(max) {
    return Math.floor(Math.random()*max);
}

makeMaze();
createMaze(0,7,0,7);
//console.log("vertical walls:");
//console.log(vertWalls);
//console.log("horizontal walls:");
//console.log(horzWalls);
printMaze();

/* to1DF32Array(a2DArray)
 *
 * This function turns an array of 4-element arrays a2DArray into a packed
 * 1-dimensional array of 32-bit floating-point numbers.
 *
 * NOTE: This function should not be here. It should be in your library.
 */

/*
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
*/
