// Just a good practice for JavaScript
'use strict';

// WebGL Rendering Context
var gl = null;

function initGL(canvas)
{
    // Get the WegGL Rendering Context
    gl = canvas.getContext("webgl");
    if(gl == null)
    {
	alert("WebGL is not available...");
	return -1;
    }
    // Set the clear color to black (r, g, b, a)
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable the hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    // Only the front face will be visible
    gl.enable(gl.CULL_FACE);

    return 0;
}

function init()
{
    // Array of vertex positions (x, y, z, w)
    var positions = [
	[0.0, 0.5, 0.0, 1.0],    // The position of the first vertex
	[-0.5, -0.5, 0.0, 1.0],  // The position of the second vertex
	[0.5, -0.5, 0.0, 1.0]    // The position of the third vertex
    ];

    // Load and compile the shader program (need initShaders.js)
    var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    if(shaderProgram == -1)
	return -1;
    gl.useProgram(shaderProgram)

    // Create 
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // Allocate 4 * positions.length bytes in the graphic card memory
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 16 * positions.length, gl.STATIC_DRAW);
    // Transfer the data from the array named positions and place the first
    // byte at the offset zero (0) bytes from the beginning of the buffer.
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));

    // Locate the name vPosition in a shader program and enable it
    var vPosition_location = gl.getAttribLocation(shaderProgram, "vPosition");
    if (vPosition_location == -1)
    { 
        alert("Unable to locate vPosition");
        return -1;
    }
    gl.enableVertexAttribArray(vPosition_location);
    
    // Each vPosition contains four (4) elements of type float (gl.FLOAT)
    // without normalization (false), data are tightly packed (0), and
    // the offset is zero (0) bytes from the beginning of the buffer.
    gl.vertexAttribPointer(vPosition_location, 4, gl.FLOAT, false, 0, 0);

    return 0;
}

/* This function should be called everytime we need to draw objects on
 * the screen.
 */
function display()
{
    // Clear the drawing and depth information
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw triangles starting at index 0 for 3 vertices
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function main()
{
    // Get the canvas element (from html document)
    var canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
	return -1;
    if(init() == -1)
	return -1;

    // Display "Hello from WebGL..." on the console screen
    console.log("Hello from WebGL...");

    display();
}
