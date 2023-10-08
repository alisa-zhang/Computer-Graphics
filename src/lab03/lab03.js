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
const triangNum = 60;

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
    var positions = coneVertices(triangNum);

    var colors = randomColors(triangNum);

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

function randomColors(size) {
    var colors = [];
    for(let i=0; i<(size*2); i++) {
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

function display()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the ctm
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctms[ctm_index]));
    // Draw the object
    gl.drawArrays(gl.TRIANGLES, 0, 6*triangNum);
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
    }
}

function main()
{
    canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
	return -1;
    if(init() == -1)
	return -1;

    document.onkeydown = keyDownCallback;
    
    display();
}
