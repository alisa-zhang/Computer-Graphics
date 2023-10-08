'use strict';

var gl = null;

function initGL(canvas)
{
    gl = canvas.getContext("webgl");
    if(gl == null)
    {
	alert("WebGL is not available...");
	return -1;
    }
    gl.clearColor(0.0, 0.8, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    return 0;
}

function init()
{
    var positions = [
	[0.0, 0.5, 0.0, 1.0],
	[-0.5, -0.8, -0.8, 1.0],
	[0.5, -0.5, 0.0, 1.0],
	[1.0, 1.0, 0.0, 1.0],
	[0.8, 1.0, 0.0, 1.0],
	[1.0, 0.8, 0.0, 1.0]
    ];

    var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    if(shaderProgram == -1)
	return -1;
    gl.useProgram(shaderProgram)

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 16 * positions.length, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));

    var vPosition_location = gl.getAttribLocation(shaderProgram, "vPosition");
    if (vPosition_location == -1)
    { 
        alert("Unable to locate vPosition");
        return -1;
    }
    gl.enableVertexAttribArray(vPosition_location);
    gl.vertexAttribPointer(vPosition_location, 4, gl.FLOAT, false, 0, 0);

    return 0;
}

function display()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function main()
{
    var canvas = document.getElementById("gl-canvas");
    if(initGL(canvas) == -1)
	return -1;
    if(init() == -1)
	return -1;

    console.log("Hello from WebGL...");

    display();
}
