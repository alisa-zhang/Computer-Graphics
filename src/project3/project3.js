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
var temp_tr1 = LinAlg.matrixMatrixMult(LinAlg.transform(-0.5,0.5,0.0),LinAlg.scale(0.5,0.5,0.5));
var temp_tr2 = LinAlg.matrixMatrixMult(LinAlg.transform(0.5,0.5,0.0),LinAlg.scale(0.5,0.5,0.5));
var cubeVertexPositions = cubeVertices();
var cubeVertexColors = randomColors(36);
var sphereVertexPositions = sphereVertices(30);
var sphereVertexColors = randomColors(sphereVertexPositions.length);
var normals = [];
var animate = true;

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
    //static four squares
    for(var i = 0; i < cubeVertexPositions.length; i++)
    {
        positions.push(LinAlg.matrixVecMult(LinAlg.scale(4.0,0.2,4.0), cubeVertexPositions[i]));
        colors.push(cubeVertexColors[i]);
    }
    for(var i = 0; i < cubeVertexPositions.length; i++)
    {
        positions.push(LinAlg.matrixVecMult(LinAlg.scale(4.0,0.2,4.0), cubeVertexPositions[i]));
        colors.push(cubeVertexColors[i]);
    }
    for(var i = 0; i < cubeVertexPositions.length; i++)
    {
        positions.push(LinAlg.matrixVecMult(LinAlg.scale(4.0,0.2,4.0), cubeVertexPositions[i]));
        colors.push(cubeVertexColors[i]);
    }
    for(var i = 0; i < cubeVertexPositions.length; i++)
    {
        positions.push(LinAlg.matrixVecMult(LinAlg.scale(4.0,0.2,4.0), cubeVertexPositions[i]));
        colors.push(cubeVertexColors[i]);
    }

    //stationary squares


    //sixteen moving squares
    for(let j=1.0; j<5; j++){
        for(var i = 0; i < cubeVertexPositions.length; i++)
        {
            positions.push(LinAlg.matrixVecMult(LinAlg.matrixMatrixMult(LinAlg.transform(j,-0.1,0.0),LinAlg.scale(1.0,0.2,1.0)), cubeVertexPositions[i]));
            colors.push(cubeVertexColors[i]);
        }
    }
    for(let j=1.0; j<5; j++){
        for(var i = 0; i < cubeVertexPositions.length; i++)
        {
            positions.push(LinAlg.matrixVecMult(LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-0.1,-1.0*j),LinAlg.scale(1.0,0.2,1.0)), cubeVertexPositions[i]));
            colors.push(cubeVertexColors[i]);
        }
    }
    for(let j=1.0; j<5; j++){
        for(var i = 0; i < cubeVertexPositions.length; i++)
        {
            positions.push(LinAlg.matrixVecMult(LinAlg.matrixMatrixMult(LinAlg.transform(-1.0*j,-0.1,0.0),LinAlg.scale(1.0,0.2,1.0)), cubeVertexPositions[i]));
            colors.push(cubeVertexColors[i]);
        }
    }
    for(let j=1.0; j<5; j++){
        for(var i = 0; i < cubeVertexPositions.length; i++)
        {
            positions.push(LinAlg.matrixVecMult(LinAlg.matrixMatrixMult(LinAlg.transform(0.0,-0.1,j),LinAlg.scale(1.0,0.2,1.0)), cubeVertexPositions[i]));
            colors.push(cubeVertexColors[i]);
        }
    }

    for(let i=0; i<20; i++) {
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

    for(let i=1; i<5; i++) {
        for(let j=0; j<sphereVertexPositions.length; j++) {
            positions.push(LinAlg.matrixVecMult(LinAlg.scale(0.5,0.5,0.5),sphereVertexPositions[j]));
            normals.push([sphereVertexPositions[j][0],sphereVertexPositions[j][1],sphereVertexPositions[j][2],0.0]);
            //is this halfway? 2880 is correct but 2790 is halfway
            if(j<2880) {
                colors.push([57/256,77/256,141/256,1.0]);
            } else {
                colors.push([167/256,100/256,200/256,1.0]);
            }
        }
    }

    //add light
    for(let j=0; j<sphereVertexPositions.length; j++) {
        positions.push(LinAlg.matrixVecMult(LinAlg.scale(0.1,0.1,0.1),sphereVertexPositions[j]));
        normals.push([sphereVertexPositions[i][0],sphereVertexPositions[i][1],sphereVertexPositions[i][2],0.0]);
        colors.push([1.0,1.0,1.0,1.0]);
    }

    stay_ctms = [];
    //initialize the stationary plate ctms
    stay_ctms.push(LinAlg.transform(2.5,-0.1,2.5));
    stay_ctms.push(LinAlg.transform(2.5,-0.1,-2.5));
    stay_ctms.push(LinAlg.transform(-2.5,-0.1,-2.5));
    stay_ctms.push(LinAlg.transform(-2.5,-0.1,2.5));

    plate_ctms = [];
    //initialize the moving plate ctms
    for(let i=0.0; i<4.0; i++) {
        for(let j=0.0; j<4.0; j++) {
            if(i==3.0) {
                plate_ctms.push(LinAlg.transform(0.0,-1.0,0.0));
            } else {
                plate_ctms.push(LinAlg.transform(0.0,-1.0*i,0.0));
            }
        }
    }

    sphere_ctms = [];
    for(let i=1; i<5; i++) {
        sphere_ctms.push(LinAlg.transform(1.0*i,0.5,0.0));
    }
    
    light_ctm = LinAlg.transform(0,5.0,0.0);

    directions = [];
    for(let i=0; i<4; i++) {
        for(let j=0; j<4; j++) {
            if(i == 0 || i==3) {
                directions.push(-1.0);
            } else {
                directions.push(1.0);
            }
        }
    }

    //frustrum(left, right, bottom, top, near, far)
    frustrum(-0.25, 0.25, -0.25, 0.25, -.3, -40);
    eye = [0.0,10.0,0.0,1.0];
    at = [0.0,0.0,0.0,1.0];
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
    //console.log(positions);
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

var sphere_ctms = [];
var plate_ctms = [];
var stay_ctms = [];
var light_ctm = [];
var directions = [];
var direction = 1.0;

function display()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the ctm
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));
    gl.uniform4fv(light_position_location, new Float32Array(light_ctm[3]));

    for(let i=0; i<4; i++) {
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(stay_ctms[i]));
        gl.drawArrays(gl.TRIANGLES, i*36, 36);
    }

    for(let i=0; i<16; i++) {
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(plate_ctms[i]));
        gl.drawArrays(gl.TRIANGLES, (i+4)*36, 36);
    }

    for(let i=0; i<4; i++) {
        gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(sphere_ctms[i]));
        gl.drawArrays(gl.TRIANGLES, 20*36+i*sphereVertexPositions.length, sphereVertexPositions.length);
    }

    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(light_ctm));
    gl.drawArrays(gl.TRIANGLES, 20*36+4*sphereVertexPositions.length, sphereVertexPositions.length);
    
}


var theta = 0.000001;
var phi = Math.PI/2;
var radius = 10;
function keyDownCallback(event)
{
    if(event.keyCode == 17) {
        animate = !animate;
    } else if(event.keyCode == 87) {
        //w key, move light up
        light_ctm = LinAlg.matrixMatrixMult(LinAlg.transform(0, 0.1, 0.0),light_ctm);
    } else if(event.keyCode == 65) {
        //a key, move light left
        light_ctm = LinAlg.matrixMatrixMult(LinAlg.transform(-0.1, 0.0, 0.0),light_ctm);
    } else if(event.keyCode == 68) {
        //d key, move light right
        light_ctm = LinAlg.matrixMatrixMult(LinAlg.transform(0.1, 0.0, 0.0),light_ctm);
    } else if(event.keyCode == 83) {
        //s key, move light down
        light_ctm = LinAlg.matrixMatrixMult(LinAlg.transform(0.0, -0.1, 0.0),light_ctm);
    } else if(event.keyCode == 69) {
        //e key, move light forward
        light_ctm = LinAlg.matrixMatrixMult(LinAlg.transform(0.0, 0.0, -0.1),light_ctm);
    } else if(event.keyCode == 88) {
        //x key, move light back
        light_ctm = LinAlg.matrixMatrixMult(LinAlg.transform(0.0, 0.0, 0.1),light_ctm);
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
    if(animate) {
        //time for the first one to go around once
        var speed = 0.0300;
        //sixteen moving squares
        for(let j=0; j<16; j++){
            if(plate_ctms[j][3][1]<=-2.0) {
                directions[j] = 1.0;
            }
            else if(plate_ctms[j][3][1]>0.0){
                directions[j] = -1.0;
            }

            plate_ctms[j] = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,directions[j]*speed/Math.pow(2,j%4),0.0),plate_ctms[j]);
            if(plate_ctms[j%4 ==1]) {
                plate_ctms[j] = LinAlg.matrixMatrixMult(LinAlg.transform(0.0,3*directions[j]*speed/Math.pow(2,j%4),0.0),plate_ctms[j]);
            }
        }
        //four moving spheres
        for(let i=0; i<4; i++) {
            sphere_ctms[i] = LinAlg.matrixMatrixMult(LinAlg.rotateY(speed*Math.PI*2.0/4.0/Math.pow(2,i)),sphere_ctms[i]);
            if(i==1) {
                sphere_ctms[i] = LinAlg.matrixMatrixMult(LinAlg.rotateY(2*speed*Math.PI*2.0/4.0/Math.pow(2,i)),sphere_ctms[i]);
            }
            if(Math.abs(sphere_ctms[i][3][2])<.02 && sphere_ctms[i][3][0]>0) {
                plate_ctms[i][3][1] = -0.1;
            } else if(Math.abs(sphere_ctms[i][3][0])<.02 && sphere_ctms[i][3][2]<0) {
                plate_ctms[4+i][3][1] = -0.1;
            } else if(Math.abs(sphere_ctms[i][3][2])<.02 && sphere_ctms[i][3][0]<0) {
                plate_ctms[4*2+i][3][1] = -0.1;
            } else if(Math.abs(sphere_ctms[i][3][0])<.02 && sphere_ctms[i][3][2]>0) {
                plate_ctms[4*3+i][3][1] = -0.1;
            }
            sphere_ctms[i] = LinAlg.matrixMatrixMult(rotateAbout([-sphere_ctms[i][3][0],-sphere_ctms[i][3][1],-sphere_ctms[i][3][2],0.0],speed*Math.PI*Math.PI*3.0/4.0/Math.pow(2,i),sphere_ctms[i][3]),sphere_ctms[i]);
        }
    }
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
