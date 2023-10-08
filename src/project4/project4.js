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
var ctm_index = 0;
var degs = [0, 30, 60, 90];
const triangNum = 60;
var model_view = [[1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]];
var projection = [[1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]];
var model_view_location;
var projection_location;
var vNormal_location;
var light_position_location;
var arm_light_location;
var arm_direction_location;
var ctm = [[1.0, 0.0, 0.0, 0.0],
[0.0, 1.0, 0.0, 0.0],
[0.0, 0.0, 1.0, 0.0],
[0.0, 0.0, 0.0, 1.0]];
var eye = [];
var at = [];
var up = [];
var positions = [];
var colors = [];
var normals = [];
var cubeVertexPositions = cubeVertices();
var cubeVertexColors = randomColors(36);
var sphereVertexPositions = sphereVertices(30);
var sphereVertexColors = randomColors(sphereVertexPositions.length);
var cylinderVertexPositions = cylinderVertices(100);
var ctm_rotate1 = ctm;
var ctm_rotate2 = ctm;
var ctm_rotate3 = ctm;
var base_ctm = ctm;
var wrist_ctm = ctm;
var ctm_finger1 = ctm;
var ctm_finger2 = ctm;


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
    positions = [];
    colors = [];
    normals = [];
    
    //floor
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,-0.1,0.0),LinAlg.matrixVecMult(LinAlg.scale(30,0.2,30),cylinderVertexPositions[i])));
        colors.push([57/256,77/256,141/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push([0.0,1.0,0.0,0.0]);
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push([cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]);
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //base
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,0.5,0.0),LinAlg.matrixVecMult(LinAlg.scale(2.5,1.0,2.5),cylinderVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push([0.0,1.0,0.0,0.0]);
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push([cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]);
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //arm0
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,1.0,0.0),LinAlg.matrixVecMult(LinAlg.scale(1.5,2.0,1.5),cylinderVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push([0.0,1.0,0.0,0.0]);
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push([cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]);
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //joint 1
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,2.0,0.0),LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),LinAlg.matrixVecMult(LinAlg.scale(2.0,2.0,2.0),cylinderVertexPositions[i]))));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[0.0,1.0,0.0,0.0]));
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]));
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[0.0,-1.0,0.0,0.0]));
        }
    }
    
    //arm 1
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,4.0,0.0),LinAlg.matrixVecMult(LinAlg.scale(1.5,4.0,1.5),cylinderVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push([0.0,1.0,0.0,0.0]);
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push([cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]);
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //joint 2
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,6.0,0.0),LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),LinAlg.matrixVecMult(LinAlg.scale(2.0,2.0,2.0),cylinderVertexPositions[i]))));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[0.0,1.0,0.0,0.0]));
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]));
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[0.0,-1.0,0.0,0.0]));
        }
    }

    //arm 2
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,8.0,0.0),LinAlg.matrixVecMult(LinAlg.scale(1.5,4.0,1.5),cylinderVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push([0.0,1.0,0.0,0.0]);
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push([cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]);
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //joint 3
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,10.0,0.0),LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),LinAlg.matrixVecMult(LinAlg.scale(2.0,2.0,2.0),cylinderVertexPositions[i]))));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[0.0,1.0,0.0,0.0]));
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]));
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push(LinAlg.matrixVecMult(LinAlg.rotateX(Math.PI/2),[0.0,-1.0,0.0,0.0]));
        }
    }

    //arm 3
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,11.0,0.0),LinAlg.matrixVecMult(LinAlg.scale(1.5,2.0,1.5),cylinderVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push([0.0,1.0,0.0,0.0]);
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push([cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]);
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //wrist
    for(let i=0; i<cylinderVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,12.25,0.0),LinAlg.matrixVecMult(LinAlg.scale(2.0,0.5,2.0),cylinderVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
        if (i%12 == 0 || i%12 == 1 || i%12 == 2) {
            normals.push([0.0,1.0,0.0,0.0]);
        } else if (i%12 == 3 || i%12 == 4 || i%12 == 5 || i%12 == 6 || i%12 == 7 || i%12 == 8) {
            normals.push([cylinderVertexPositions[i][0], 0.0, cylinderVertexPositions[i][2], 0.0]);
        } else if (i%12 == 9 || i%12 == 10 || i%12 == 11) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //palm
    for(let i=0; i<cubeVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,12.75,0.0),LinAlg.matrixVecMult(LinAlg.scale(0.5,0.5,2.0),cubeVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
    }
    
    //finger 1
    for(let i=0; i<cubeVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,13.5,0.2),LinAlg.matrixVecMult(LinAlg.scale(0.4,1.0,0.4),cubeVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
    }

    //finger 2
    for(let i=0; i<cubeVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(0.0,13.5,-0.2),LinAlg.matrixVecMult(LinAlg.scale(0.4,1.0,0.4),cubeVertexPositions[i])));
        colors.push([1/256,1/256,40/256,1.0]);
    }

    //cube normals
    for(let i=0; i<3; i++) {
        for(let j=0; j<6; j++) {
            normals.push([0.0,0.0,1.0,0.0]);
        }
        for(let j=0; j<6; j++) {
            normals.push([0.0,0.0,-1.0,0.0]);
        }
        for(let j=0; j<6; j++) {
            normals.push([1.0,0.0,0.0,0.0]);
        }
        for(let j=0; j<6; j++) {
            normals.push([-1.0,0.0,1.0,0.0]);
        }
        for(let j=0; j<6; j++) {
            normals.push([0.0,1.0,0.0,0.0]);
        }
        for(let j=0; j<6; j++) {
            normals.push([0.0,-1.0,0.0,0.0]);
        }
    }

    //sphere
    for(let j=0; j<sphereVertexPositions.length; j++) {
        //positions.push(LinAlg.matrixVecMult(LinAlg.transform(-2.0,1.0,8.0),sphereVertexPositions[j]));
        positions.push(LinAlg.matrixVecMult(LinAlg.transform(7.0,1.0,0.0),sphereVertexPositions[j]));
        normals.push([sphereVertexPositions[j][0],sphereVertexPositions[j][1],sphereVertexPositions[j][2],0.0]);
        colors.push([140/256,23/256,54/256,1.0]);
    }

    console.log(positions);
    console.log(colors);
    console.log(normals);

    arm_light_position = [0.0,13.0,0.0,0.0];

    //frustrum(left, right, bottom, top, near, far)
    frustrum(-0.25, 0.25, -0.25, 0.25, -.3, -60);
    theta = 7*Math.PI/16;
    phi = Math.PI/2;
    radius = 20;
    eye = [radius*Math.cos(phi)*Math.sin(theta),radius*Math.cos(theta),radius*Math.sin(phi)*Math.sin(theta),1.0];
    at = [0.0,5.0,0.0,1.0];
    up = [0.0,1.0,0.0,0.0];
    look_at(eye,at,up);

    // Load and compile shader programs
    var shaderProgram = initShaders(gl, "vertex-shader", "fragment-shader");
    if(shaderProgram == -1)
	return -1;
    gl.useProgram(shaderProgram)

    // Allocate memory in a graphics card
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * (positions.length + colors.length + normals.length), gl.STATIC_DRAW);
    // Transfer positions and put it at the beginning of the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));
    // Transfer colors and put it right after positions
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * positions.length, to1DF32Array(colors));
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (positions.length + colors.length), to1DF32Array(normals));

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

    var vNormal_location = gl.getAttribLocation(shaderProgram,"vNormal");
    if(vNormal_location == -1) {
        alert("Unable to locate vNormal");
        return -1;
    }
    gl.enableVertexAttribArray(vNormal_location);
    gl.vertexAttribPointer(vNormal_location,4,gl.FLOAT,false,0,16*(positions.length+colors.length));

    // Current Transformation Matrix - locate and enable "ctm"
    ctm_location = gl.getUniformLocation(shaderProgram, "ctm");
    if (ctm_location == -1)
    { 
        alert("Unable to locate ctm");
        return -1;
    }

    model_view_location = gl.getUniformLocation(shaderProgram, "model_view");
    if(model_view_location == null) {
        alert("Unable to locate model_view");
        return -1;
    }

    projection_location = gl.getUniformLocation(shaderProgram, "projection");
    if(projection_location == null) {
        alert("Unable to locate projection");
        return -1;
    }

    light_position_location = gl.getUniformLocation(shaderProgram, "light_position");
    if(light_position_location == null) {
        alert("Unable to locate light position");
        return -1;
    }

    arm_light_location = gl.getUniformLocation(shaderProgram, "arm_light_position");
    if(light_position_location == null) {
        alert("Unable to locate arm light position");
        return -1;
    }

    arm_light_location = gl.getUniformLocation(shaderProgram, "arm_light_position");
    if(light_position_location == null) {
        alert("Unable to locate arm light position");
        return -1;
    }

    arm_direction_location = gl.getUniformLocation(shaderProgram, "arm_light_direction");
    if(light_position_location == null) {
        alert("Unable to locate arm light direction");
        return -1;
    }

    return 0;
}

function look_at(eye, at, up) {
    let vpn = LinAlg.vecSub(eye,at);
    let n = LinAlg.normalize(vpn);
    let u = LinAlg.normalize(LinAlg.crossProduct(up,n));
    let v = LinAlg.normalize(LinAlg.crossProduct(n,u));
    let m = LinAlg.transpose([u,v,n,[0,0,0,1]]);
    let t = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[-eye[0],-eye[1],-eye[2],1]];
    model_view = LinAlg.matrixMatrixMult(m,t);
}

function frustrum(left, right, bottom, top, near, far) {
    projection = [[-2.0*near/(right-left),0.0,0.0,0.0],
            [0.0, -2.0*near/(top-bottom),0.0,0.0],
            [(left+right)/(right-left),(bottom+top)/(top-bottom),(near+far)/(far-near),-1.0],
            [0.0,0.0,-2.0*near*far/(far-near),0.0]];
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
        colors.push(color);
        colors.push(color);
        colors.push(color);
    }
    return colors;
}

function randomColor() {
    let r = Math.random();
    let g = Math.random();
    let b = Math.random();
    return [r, g, b, 1.0];
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

function sphereVertices(size) {
    var thetaChange =  2*Math.PI/size;
    var phiChange = Math.PI/size;
    var phi = -Math.PI/2;
    var sphere = [];
    var bottomLeft = [0.0, -1.0, 0.0, 1.0];
    var topLeft = LinAlg.matrixVecMult(LinAlg.rotateZ(phiChange), bottomLeft);
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
        // if(phi < 0.1 && phi>-0.1) {
        //     console.log(sphere.length);
        // }
    }
    return sphere;
}

function cylinderVertices(size) {
    var thetaChange = -2*Math.PI/(size/2);
    var theta = 0;
    var cylinder = [];
    var top = [0.0, 0.5, 0.0, 1.0];
    var base = [0.0, -0.5, 0.0, 1.0];
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

function randomCubeColors() {
    var colors = [];
    let color = [57/256,77/256,141/256,1.0];
    for(let i=0;i<24;i++) {
        colors.push(color);
    }

    color = [87/256,107/256,191/256,1.0];
    for(let i=0;i<12;i++) {
        colors.push(color);
    }
    return colors;
}

function rotateAbout(aboutVector, theta, point) {
    aboutVector = LinAlg.normalize(aboutVector);
    let alphaX = aboutVector[0];
    let alphaY = aboutVector[1];
    let alphaZ = aboutVector[2];
    let d = Math.sqrt(Math.pow(alphaY,2)+Math.pow(alphaZ,2));
    //M = T(p0)Rx(-thetaX)Ry(thetaY)Rz(theta)Ry(-thetaY)Rx(thetaX)T(-p0)
    let transform_to = LinAlg.transform(-1.0*point[0],-1.0*point[1],-1.0*point[2]);
    let rotateX = [[1.0, 0.0, 0.0, 0.0],[0.0, alphaZ/d, alphaY/d, 0.0],[0.0, -alphaY/d, alphaZ/d, 0.0],[0.0, 0.0, 0.0, 1.0]];
    let rotateY = [[d, 0.0, alphaX, 0.0],[0.0, 1.0, 0, 0.0],[-alphaX, 0.0, d, 0.0],[0.0, 0.0, 0.0, 1.0]];
    let rotateZ = LinAlg.rotateZ(theta);
    let rotateY_back = [[d, 0.0, -alphaX, 0.0],[0.0, 1.0, 0, 0.0],[alphaX, 0.0, d, 0.0],[0.0, 0.0, 0.0, 1.0]];
    let rotateX_back = [[1.0, 0.0, 0.0, 0.0],[0.0, alphaZ/d, -alphaY/d, 0.0],[0.0, alphaY/d, alphaZ/d, 0.0],[0.0, 0.0, 0.0, 1.0]]
    let transform_back = LinAlg.transform(point[0],point[1],point[2]);
    var rotated = LinAlg.matrixMatrixMult(transform_back, LinAlg.matrixMatrixMult(rotateX_back, LinAlg.matrixMatrixMult(rotateY_back, LinAlg.matrixMatrixMult(rotateZ, LinAlg.matrixMatrixMult(rotateY,LinAlg.matrixMatrixMult(rotateX, transform_to))))));
    return rotated;
}

var arm_light_position = [];
var arm_light_direction = [];

function display()
{
    arm_light_position = LinAlg.matrixVecMult(base_ctm,LinAlg.matrixVecMult(ctm_rotate1,LinAlg.matrixVecMult(ctm_rotate2,LinAlg.matrixVecMult(ctm_rotate3,[0.0,13.0,0.0,1.0]))));
    arm_light_direction = LinAlg.matrixVecMult(base_ctm,LinAlg.matrixVecMult(ctm_rotate1,LinAlg.matrixVecMult(ctm_rotate2,LinAlg.matrixVecMult(ctm_rotate3,[0.0,1.0,0.0,0.0]))));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the ctm
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));
    gl.uniform4fv(light_position_location, new Float32Array(eye));
    //`this vector needs to be one going through the palm, not just the point at the top
    gl.uniform4fv(arm_light_location, new Float32Array(arm_light_position));
    gl.uniform4fv(arm_direction_location, new Float32Array(LinAlg.normalize(arm_light_direction)));

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, 0, cylinderVertexPositions.length);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(base_ctm));
    gl.drawArrays(gl.TRIANGLES, cylinderVertexPositions.length, 3*cylinderVertexPositions.length);
    
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(LinAlg.matrixMatrixMult(base_ctm,ctm_rotate1)));
    gl.drawArrays(gl.TRIANGLES, 4*cylinderVertexPositions.length, 2*cylinderVertexPositions.length);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(LinAlg.matrixMatrixMult(base_ctm,LinAlg.matrixMatrixMult(ctm_rotate1,ctm_rotate2))));
    gl.drawArrays(gl.TRIANGLES, 6*cylinderVertexPositions.length, 2*cylinderVertexPositions.length);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(LinAlg.matrixMatrixMult(base_ctm,LinAlg.matrixMatrixMult(ctm_rotate1,LinAlg.matrixMatrixMult(ctm_rotate2,ctm_rotate3)))));
    gl.drawArrays(gl.TRIANGLES, 8*cylinderVertexPositions.length, 2*cylinderVertexPositions.length);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(LinAlg.matrixMatrixMult(base_ctm,LinAlg.matrixMatrixMult(ctm_rotate1,LinAlg.matrixMatrixMult(ctm_rotate2,LinAlg.matrixMatrixMult(ctm_rotate3,wrist_ctm))))));
    gl.drawArrays(gl.TRIANGLES, 10*cylinderVertexPositions.length, cubeVertexPositions.length);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(LinAlg.matrixMatrixMult(base_ctm,LinAlg.matrixMatrixMult(ctm_rotate1,LinAlg.matrixMatrixMult(ctm_rotate2,LinAlg.matrixMatrixMult(ctm_rotate3,LinAlg.matrixMatrixMult(wrist_ctm,ctm_finger1)))))));
    gl.drawArrays(gl.TRIANGLES, 10*cylinderVertexPositions.length + cubeVertexPositions.length, cubeVertexPositions.length);
    
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(LinAlg.matrixMatrixMult(base_ctm,LinAlg.matrixMatrixMult(ctm_rotate1,LinAlg.matrixMatrixMult(ctm_rotate2,LinAlg.matrixMatrixMult(ctm_rotate3,LinAlg.matrixMatrixMult(wrist_ctm,ctm_finger2)))))));
    gl.drawArrays(gl.TRIANGLES, 10*cylinderVertexPositions.length + 2*cubeVertexPositions.length, cubeVertexPositions.length);

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    gl.drawArrays(gl.TRIANGLES, 10*cylinderVertexPositions.length + 3*cubeVertexPositions.length, sphereVertexPositions.length);
}

var theta = 0.000001;
var phi = Math.PI/4;
var radius = 15;
function keyDownCallback(event)
{
    if (event.keyCode == 81) { 
        //q key, turn base left
        base_ctm = LinAlg.matrixMatrixMult(LinAlg.rotateY(-0.05),base_ctm);
    } else if(event.keyCode == 87) {
        //w key, turn base right
        base_ctm = LinAlg.matrixMatrixMult(LinAlg.rotateY(0.05),base_ctm);
    } else if(event.keyCode == 69) {
        //e key, move arm1 left
        ctm_rotate1 = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,2.0,0.0),LinAlg.matrixMatrixMult(LinAlg.rotateZ(0.05),LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-2.0,0.0),ctm_rotate1)));
    } else if(event.keyCode == 68) {
        //d key, move arm1 right
        ctm_rotate1 = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,2.0,0.0),LinAlg.matrixMatrixMult(LinAlg.rotateZ(-0.05),LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-2.0,0.0),ctm_rotate1)));
    } else if(event.keyCode == 82) {
        //r key, move arm2 left
        ctm_rotate2 = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,6.0,0.0),LinAlg.matrixMatrixMult(LinAlg.rotateZ(0.05),LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-6.0,0.0),ctm_rotate2)));
    } else if(event.keyCode == 70) {
        //f key, move arm2 right
        ctm_rotate2 = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,6.0,0.0),LinAlg.matrixMatrixMult(LinAlg.rotateZ(-0.05),LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-6.0,0.0),ctm_rotate2)));
    } else if(event.keyCode == 84) {
        //t key, move arm3 left
        ctm_rotate3 = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,10.0,0.0),LinAlg.matrixMatrixMult(LinAlg.rotateZ(0.05),LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-10.0,0.0),ctm_rotate3)));
    } else if(event.keyCode == 71) {
        //g key, move arm3 right
        ctm_rotate3 = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,10.0,0.0),LinAlg.matrixMatrixMult(LinAlg.rotateZ(-0.05),LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-10.0,0.0),ctm_rotate3)));
    } else if(event.keyCode == 65) {
        //a key, turn wrist left
        wrist_ctm = LinAlg.matrixMatrixMult(LinAlg.rotateY(-0.05),wrist_ctm);
    } else if(event.keyCode == 83) {
        //s key, turn wrist right
        wrist_ctm = LinAlg.matrixMatrixMult(LinAlg.rotateY(0.05),wrist_ctm);
    } else if(event.keyCode == 90) {
        //z key, move fingers apart
        ctm_finger1 = LinAlg.matrixMatrixMult(LinAlg.transform(0,0,0.01), ctm_finger1);
        ctm_finger2 = LinAlg.matrixMatrixMult(LinAlg.transform(0,0,-0.01), ctm_finger2);
    } else if(event.keyCode == 88) {
        //x key, move fingers together
        ctm_finger1 = LinAlg.matrixMatrixMult(LinAlg.transform(0,0,-0.01), ctm_finger1);
        ctm_finger2 = LinAlg.matrixMatrixMult(LinAlg.transform(0,0,0.01), ctm_finger2);
    } else if(event.keyCode == 38) {
        //up key, move viewer forward
        //up is rotated, eye is moved parametrically...
        theta -= Math.PI/100;
    } else if(event.keyCode == 37) {
        //left key, move viewer left
        phi += Math.PI/100;
        //need to move the up vector?
    } else if(event.keyCode == 40) {
        //down key, move viewer back
        theta += Math.PI/100;
    } else if(event.keyCode == 39) {
        //right key, move viewer right
        phi -= Math.PI/100;
    } else if(event.keyCode == 190) {
        //. key, move in
        radius -= 0.1;
    } else if(event.keyCode == 191) {
        //"/" key, move out
        radius += 0.1;
    }
}

var counter = 0;

function idle()
{
    eye = [radius*Math.cos(phi)*Math.sin(theta),radius*Math.cos(theta),radius*Math.sin(phi)*Math.sin(theta),1.0];
    look_at(eye,at,up);

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

    document.onkeydown = keyDownCallback;
    
    display();
    requestAnimationFrame(idle);
}
