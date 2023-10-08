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
var ctm = [[1.0, 0.0, 0.0, 0.0],
[0.0, 1.0, 0.0, 0.0],
[0.0, 0.0, 1.0, 0.0],
[0.0, 0.0, 0.0, 1.0]];
var theta = Math.PI/2;
var maze = [];
var positions = [];
var colors = [];
var eye = [];
var at = [];
var up = [];
var directions = [];

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
    makeMaze();
    createMaze(0,7,0,7);
    printMaze();
    displayMaze();

    let num = 1.0;
    //frustrum(-num*0.9,0.9*num, -0.75*num, 0.75*num, -0.8*num, num);
    frustrum(-0.25, 0.25, -0.25, 0.25, -.3, -40);
    //frustrum(left, right, bottom, top, near, far);
    eye = [1.0,2.0,4.0,1.0];
    at = [1.0,2.0,0.0,1.0];
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
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * (positions.length + colors.length), gl.STATIC_DRAW);
    // Transfer positions and put it at the beginning of the buffer
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, to1DF32Array(positions));
    //console.log(positions);
    // Transfer colors and put it right after positions
    gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4 * positions.length, to1DF32Array(colors));
    //console.log(colors);

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
    return 0;
}

function ortho(left, right, bottom, top, near, far) {
    projection = [[2.0/(right-left),0.0,0.0,0.0],
            [0.0,2/(top-bottom),0.0,0.0],
            [0.0,0.0,2/(near-far),0.0],
            [-(right+left)/(right-left),-(top+bottom)/(top-bottom),-(near+far)/(near-far),1.0]];
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

function mocklook_at(tempEye, tempAt, up) {
    let vpn = LinAlg.vecSub(tempEye,tempAt);
    let n = LinAlg.normalize(vpn);
    let u = LinAlg.normalize(LinAlg.crossProduct(up,n));
    let v = LinAlg.normalize(LinAlg.crossProduct(n,u));
    let m = LinAlg.transpose([u,v,n,[0,0,0,1]]);
    let t = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[-tempEye[0],-tempEye[1],-tempEye[2],1]];
    return LinAlg.matrixMatrixMult(m,t);
}

function frustrum(left, right, bottom, top, near, far) {
    projection = [[-2.0*near/(right-left),0.0,0.0,0.0],
            [0.0, -2.0*near/(top-bottom),0.0,0.0],
            [(left+right)/(right-left),(bottom+top)/(top-bottom),(near+far)/(far-near),-1.0],
            [0.0,0.0,-2.0*near*far/(far-near),0.0]];
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

function columnColors() {
    var colors = [];
    let color = [128/256,148/256,208/256,1.0];
    for(let i=0;i<24;i++) {
        colors.push(color);
    }

    color = [148/256,168/256,228/256,1.0];
    for(let i=0;i<12;i++) {
        colors.push(color);
    }
    return colors;
}

function wallColors() {
    var colors = [];

    let color = [191/256,213/256,232/256,1.0];
    for(let i=0;i<12;i++) {
        colors.push(color);
    }

    color = [163/256,184/256,201/256,1.0];
    for(let i=0;i<24;i++) {
        colors.push(color);
    }
    return colors;
}

function makeMaze() {
    maze = [];
    for(let i=0; i<64; i++) {
        let arr = new Array(64);
        arr.fill(false);
        maze.push(arr);
    }

    for(let i=0; i<64; i++) {
        //not the last one in a row
        if((i+1)%8 != 0) {
            maze[i][i+1] = true;
            maze[i+1][i] = true;
        }
        //not the last row
        if(i<55) {
            maze[i][i+8] = true;
            maze[i+8][i] = true;
        }
        
        //not the first one in a row
        if(i%8 != 0) {
            maze[i][i-1] = true;
            maze[i-1][i] = true;
        }
        
        //not in the first row
        if(i>7) {
            maze[i][i-8] = true;
            maze[i-8][i] = true;
        }
    }
}

function createMaze(vertStart, vertEnd, horzStart, horzEnd) {
    if(vertEnd === vertStart || horzEnd === horzStart) {
        return;
    }
    
    //select the intersection point
    let vert = vertStart + getRandomInt(vertEnd-vertStart)+0.5;
    let horz = horzStart + getRandomInt(horzEnd-horzStart)+0.5;
    //select the wall that stays closed
    let closed = getRandomInt(4);

    //generate openings
    let top = vertStart + getRandomInt(Math.floor(vert)-vertStart);
    let bottom = vertEnd - getRandomInt(vertEnd-Math.ceil(vert));
    let left = horzStart + getRandomInt(Math.floor(horz)-horzStart);
    let right = horzEnd - getRandomInt(horzEnd-Math.ceil(horz));

    //for the vertical wall
    for(let i=vertStart; i<=vertEnd; i++) {
        if((i!=top && i!=bottom) || (i === top && closed === 0) || (i === bottom && closed === 1)){
            //use vert in every one to determine where the vertical wall is along the x axis
            maze[i*8+Math.floor(horz)][i*8+Math.ceil(horz)] = false;
            maze[i*8+Math.ceil(horz)][i*8+Math.floor(horz)] = false;
        }
    }

    //for the horizontal wall
    for(let i=horzStart; i<=horzEnd; i++) {
        if((i!=left && i!=right) || (i === left && closed === 2) || (i === right && closed === 3)){
            //use horz in every one to determine where the horizontal wall is along the y axis
            maze[i+Math.floor(vert)*8][i+Math.ceil(vert)*8] = false;
            maze[i+Math.ceil(vert)*8][i+Math.floor(vert)*8] = false;
            //convert the coordinate to adjacency matrix elements
        }
    }

    //recursive for each quadrant
    createMaze(vertStart, Math.floor(vert), horzStart, Math.floor(horz));
    createMaze(vertStart, Math.floor(vert), Math.ceil(horz), horzEnd);
    createMaze(Math.ceil(vert), vertEnd, horzStart, Math.floor(horz));
    createMaze(Math.ceil(vert), vertEnd, Math.ceil(horz), horzEnd);
}

function printMaze() {
    let output = "";
    output += "+---+---+---+---+---+---+---+---+\n";
    for(let i=0;i<7;i++) {
        if(i!=0) {
            output += "|   ";
        } else {
            output += "    ";
        }
        for(let j=0; j<7; j++) {
            //iterate through the vertical walls
            if(maze[i*8+j][i*8+j+1]){
                output += "    ";
            } else {
                output += "|   ";
            }
        }
        output += "|\n";

        for(let j=0; j<8; j++){
            //iterate through the horizontal walls
            //`switched i and j here, double check
            if(maze[j+i*8][j+(i+1)*8]) {
                output += "+   ";
            } else {
                output += "+---";
            }
        }
        output += "+\n";
    }

    output += "|   ";
    for(let j=0; j<7; j++) {
        //iterate through the vertical walls
        if(maze[7*8+j][7*8+j+1]){
            output += "    ";
        } else {
            output += "|   ";
        }
    }
    output += " \n";
    output += "+---+---+---+---+---+---+---+---+";
    console.log(output);
}

function displayMaze() {
    let cubeVertexPositions = cubeVertices();
    let cubeVertexColors = randomCubeColors();
    let columnVertexColors = columnColors();
    let wallVertexColors = wallColors();

    //maze base
    var m = LinAlg.matrixMatrixMult(LinAlg.transform(15, 0, -18),LinAlg.scale(36, 0.1, 36));
    for(let i = 0; i < cubeVertexPositions.length; i++) {
        positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[i]));
        colors.push(cubeVertexColors[i]);
    }

    //maze columns
    for(let i=-1.0; i<32; i+=4) {
        for(let j=-2.0; j>-35; j-=4) {
            m = LinAlg.matrixMatrixMult(LinAlg.transform(i, 1.8, j),LinAlg.scale(0.5, 3.6, 0.5));
            for(let k=0; k<cubeVertexPositions.length; k++) {
                positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
                colors.push(columnVertexColors[k]);
            }
        }
    }

    //top and bottom walls
    for(let i=-1.0; i<32; i+=32){
        for(let j=-4.0; j>-35; j-=4) {
            m = LinAlg.matrixMatrixMult(LinAlg.transform(i, 1.7, j),LinAlg.scale(0.1, 3.4, 3.5));
            for(let k=0; k<cubeVertexPositions.length; k++) {
                positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
                colors.push(wallVertexColors[k]);
            }
        }
    }

    for(let i=0;i<7;i++) {
        //left vertical wall
        if(i!=0) {
            m = LinAlg.matrixMatrixMult(LinAlg.transform(i*4.0+1.0, 1.7, -2.0),LinAlg.scale(3.5, 3.4, 0.1));
            for(let k=0; k<cubeVertexPositions.length; k++) {
                positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
                colors.push(wallVertexColors[k]);
            }
        }
        
        for(let j=0; j<7; j++) {
            //iterate through the vertical walls
            if(!maze[i*8+j][i*8+j+1]){
                m = LinAlg.matrixMatrixMult(LinAlg.transform(i*4.0+1.0, 1.7, j*-4.0-6.0),LinAlg.scale(3.5, 3.4, 0.1));
                for(let k=0; k<cubeVertexPositions.length; k++) {
                    positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
                    colors.push(wallVertexColors[k]);
                }
            }
        }

        //right vertical wall
        m = LinAlg.matrixMatrixMult(LinAlg.transform(i*4.0+1.0, 1.7, -34),LinAlg.scale(3.5, 3.4, 0.1));
        for(let k=0; k<cubeVertexPositions.length; k++) {
            positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
            colors.push(wallVertexColors[k]);
        }

        for(let j=0; j<8; j++){
            //iterate through the horizontal walls
            //`switched i and j here, double check
            if(!maze[j+i*8][j+(i+1)*8]) {
                m = LinAlg.matrixMatrixMult(LinAlg.transform(i*4.0+3.0, 1.7, j*-4.0-4.0),LinAlg.scale(0.1, 3.4, 3.5));
                for(let k=0; k<cubeVertexPositions.length; k++) {
                    positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
                    colors.push(wallVertexColors[k]);
                }
            }
        }
    }

    //bottom left vertical wall
    m = LinAlg.matrixMatrixMult(LinAlg.transform(29.0, 1.7, -2.0),LinAlg.scale(3.5, 3.4, 0.1));
    for(let k=0; k<cubeVertexPositions.length; k++) {
        positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
        colors.push(wallVertexColors[k]);
    }

    for(let j=0; j<7; j++) {
        //iterate through the vertical walls
        if(!maze[7*8+j][7*8+j+1]){
            m = LinAlg.matrixMatrixMult(LinAlg.transform(29.0, 1.7, j*-4.0-6.0),LinAlg.scale(3.5, 3.4, 0.1));
            for(let k=0; k<cubeVertexPositions.length; k++) {
                positions.push(LinAlg.matrixVecMult(m, cubeVertexPositions[k]));
                colors.push(wallVertexColors[k]);
            }
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random()*max);
}

function display()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set the ctm
    gl.uniformMatrix4fv(model_view_location, false, to1DF32Array(model_view));
    gl.uniformMatrix4fv(projection_location, false, to1DF32Array(projection));
    gl.uniformMatrix4fv(ctm_location, false, to1DF32Array(ctm));
    
    // Draw the object
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
}

function keyDownCallback(event)
{
    if(event.keyCode == 32)
    {
        direction = "fly";
        newDirection = true;
        //birdsEye();
        display();
    } else if(event.keyCode == 87) {
        //move forward
        direction = "forward";
        newDirection = true;
        display();
    } else if(event.keyCode == 83) {
        //move backward
        direction = "back";
        newDirection = true;
        display();
    } else if(event.keyCode == 65) {
        //turn left
        direction = "left";
        newDirection = true;
        display();
    } else if(event.keyCode == 68) {
        //turn right
        direction = "right";
        newDirection = true;
        display();
    } else if(event.keyCode == 190) {
        solveMaze();
        startSolution = true;
        display();
    }
}

function solveMaze() {
    //find current position by converting eye into the current vertex
    let vertex;
    if(eye[2]==4) {
        vertex = 0;
        at = [1.0,2.0,0.0,1.0];
        directions.push("forward");
        directions.push("forward");
    } else if(Math.round(eye[2]) == 0) {
        vertex = 0;
        at = [1.0,2.0,-4.0,1.0];
        directions.push("forward");
    } else {
        vertex = Math.round((eye[0])/4*8-(eye[2]+12)/4);
    }
    console.log(vertex);
    //start at 63 so you don't have to go backwards?
    let pred = new Array(63);
    const q = [];
    q.push(63);
    let visited = new Array(64);
    visited.fill(false);
    visited[63] = true;
    let vis;

    while(q.length>0) {
        vis = q[0];
        q.shift();
        for(let i=0; i<64; i++) {
            if(maze[vis][i] && !visited[i]) {
                q.push(i);
                pred[i] = vis;
                visited[i] = true;
            }
        }
    }
    //`everything above here can be in the create maze since it's independent of current vertex
    //create an array to store the directions and boolean if it's done moving
    let curVertex = vertex;
    let path = [];
    path.push(vertex);
    while(curVertex != 63){
        curVertex = pred[curVertex];
        path.push(curVertex);
    }
    let face = "";
    let neededFace = "";

    //first one (need to figure out direction)
    diff = LinAlg.vecSub(eye,at);
    if(Math.round(diff[0])>0) {
        face = "north";
    } else if (Math.round(diff[0]<0)) {
        face = "south";
    } else if (Math.round(diff[2]<0)) {
        face = "west";
    } else if (Math.round(diff[2]>0)) {
        face = "east";
    }

    for(let i=0; i<(path.length-1); i++){
        //going right
        if(path[i+1]-path[i] == 1) {
            neededFace = "east";
        } else if(path[i]-path[i+1] == 1) {
            neededFace = "west";
        } else if(path[i+1]-path[i] == 8) {
            neededFace = "south";
        } else if(path[i]-path[i+1] == 8) {
            neededFace = "north";
        }

        if((neededFace == "north" && face == "south") || (neededFace == "south" && face == "north") || (neededFace == "east" && face == "west") || (neededFace == "west" && face == "east")) {
            directions.push("right");
            directions.push("right");
        } else if((neededFace == "west" && face == "north") || (neededFace == "east" && face == "south") || (neededFace == "south" && face == "west") || (neededFace == "north" && face == "east")) {
            directions.push("left");
        } else if((neededFace == "north" && face == "west") || (neededFace == "south" && face == "east") || (neededFace == "west" && face == "south") || (neededFace == "east" && face == "north")) {
            directions.push("right");
        }
        face = neededFace;
        directions.push("forward");
    }

    //to turn towards the exit
    neededFace = "east";
    if((neededFace == "north" && face == "south") || (neededFace == "south" && face == "north") || (neededFace == "east" && face == "west") || (neededFace == "west" && face == "east")) {
        directions.push("right");
        directions.push("left");
    } else if((neededFace == "west" && face == "north") || (neededFace == "east" && face == "south") || (neededFace == "south" && face == "west") || (neededFace == "north" && face == "east")) {
        directions.push("left");
    } else if((neededFace == "north" && face == "west") || (neededFace == "south" && face == "east") || (neededFace == "west" && face == "south") || (neededFace == "east" && face == "north")) {
        directions.push("right");
    }
}

var direction = "";
var startSolution = false;
var val = 0;
var moving = false;
var newDirection = false;
var pressed = false;
//var temp = [];
var end = [];
var endAt = [];
var endEye = [];
var oldAt = [];
var oldEye = [];
var diffEye = [];
var diffAt = [];
var old_modelView = [];
var counter = 0;
var diff = 0;
function idle()
{
    if (counter == 0 && startSolution && val<directions.length) {
        //`be careful about what happens if you start the solution while moving
        newDirection = true;
        direction = directions[val];
        val++;
    }
    //new key pressed while current animation still playing
    if(newDirection) {
        counter++;
        if(moving) {
            model_view = end;
            at = endAt;
            eye = endEye;
            if(direction == "fly") {
                pressed = !pressed;
            }
            counter = 0;
        }
        moving = true;
        newDirection = false;
        if(direction == "fly") {
            if(pressed) {
                diffEye = LinAlg.vecSub(oldEye,eye);
                endEye = LinAlg.matrixVecMult(LinAlg.transform(diffEye[0],diffEye[1],diffEye[2]), eye);
                diffAt = LinAlg.vecSub(oldAt, at);
                endAt = LinAlg.matrixVecMult(LinAlg.transform(diffAt[0],diffAt[1],diffAt[2]), at);
                up = [-1.0,0.0,0.0,0.0];
            } else {
                oldEye = eye;
                oldAt = at;
                diffEye = LinAlg.vecSub([15.0,25.0,-18.0,1.0],eye);
                endEye = LinAlg.matrixVecMult(LinAlg.transform(diffEye[0],diffEye[1],diffEye[2]), eye);
                diffAt = LinAlg.vecSub([15.0,0.0,-18.0,1.0], at);
                endAt = LinAlg.matrixVecMult(LinAlg.transform(diffAt[0],diffAt[1],diffAt[2]), at);
                up = [0.0,1.0,0.0,0.0];
            }
        } else if(direction == "forward" && !pressed) {
            diff = LinAlg.vecSub(at, eye);
            endEye = LinAlg.matrixVecMult(LinAlg.transform(diff[0],0,diff[2]), eye);
            endAt = LinAlg.matrixVecMult(LinAlg.transform(diff[0],0,diff[2]), at);
        } else if(direction == "back" && !pressed) {
            diff = LinAlg.vecSub(at, eye);
            endEye = LinAlg.matrixVecMult(LinAlg.transform(-diff[0],0,-diff[2]), eye);
            endAt = LinAlg.matrixVecMult(LinAlg.transform(-diff[0],0,-diff[2]), at);
        } else if(direction == "left" && !pressed) {
            endEye = eye;
            endAt = LinAlg.matrixVecMult(LinAlg.transform(eye[0],eye[1],eye[2]), LinAlg.matrixVecMult(LinAlg.rotateY(90), LinAlg.matrixVecMult(LinAlg.transform(-eye[0],-eye[1],-eye[2]),at)));
        } else if(direction == "right" && !pressed) {
            endEye = eye;
            let temp = LinAlg.matrixVecMult(LinAlg.transform(-eye[0],-eye[1],-eye[2]),at);
            temp = LinAlg.matrixVecMult(LinAlg.rotateY(-90), temp);
            endAt = LinAlg.matrixVecMult(LinAlg.transform(eye[0],eye[1],eye[2]), temp);
        }
        endAt[0] = Math.round(endAt[0]);
        endAt[2] = Math.round(endAt[2]);
        end = mocklook_at(endEye, endAt, [0.0,1.0,0.0,0.0]);
    } else if (counter == 51) {
        moving = false;
        counter = 0;
        if(direction == "fly") {
            pressed = !pressed;
        }
        direction = "";
        at[0] = Math.round(at[0]);
        at[2] = Math.round(at[2]);
    } else if (moving) {
        counter++;
        if(direction == "fly") {
            if(pressed) {
                model_view = old_modelView;
                eye = LinAlg.matrixVecMult(LinAlg.transform(diffEye[0]/50,diffEye[1]/50,diffEye[2]/50), eye);
                at = LinAlg.matrixVecMult(LinAlg.transform(diffAt[0]/50,diffAt[1]/50,diffAt[2]/50), at);
                up = LinAlg.matrixVecMult(LinAlg.rotateZ(-90/50), up);
                look_at(eye, at, up);
            } else {
                old_modelView = model_view;
                eye = LinAlg.matrixVecMult(LinAlg.transform(diffEye[0]/50,diffEye[1]/50,diffEye[2]/50), eye);
                at = LinAlg.matrixVecMult(LinAlg.transform(diffAt[0]/50,diffAt[1]/50,diffAt[2]/50), at);
                up = LinAlg.matrixVecMult(LinAlg.rotateZ(90/50), up);
                look_at(eye, at, up);
            }
        } else if(direction == "forward" && !pressed) {
            eye = LinAlg.matrixVecMult(LinAlg.transform(diff[0]/50,0,diff[2]/50), eye);
            at = LinAlg.matrixVecMult(LinAlg.transform(diff[0]/50,0,diff[2]/50), at);
            look_at(eye, at, [0.0,1.0,0.0,0.0]);
        } else if(direction == "back" && !pressed) {
            eye = LinAlg.matrixVecMult(LinAlg.transform(-diff[0]/50,0,-diff[2]/50), eye);
            at = LinAlg.matrixVecMult(LinAlg.transform(-diff[0]/50,0,-diff[2]/50), at);
            look_at(eye, at, [0.0,1.0,0.0,0.0]);
        } else if(direction == "left" && !pressed) {
            let temp = LinAlg.matrixVecMult(LinAlg.transform(-eye[0],-eye[1],-eye[2]),at);
            temp = LinAlg.matrixVecMult(LinAlg.rotateY(90/50), temp);
            at = LinAlg.matrixVecMult(LinAlg.transform(eye[0],eye[1],eye[2]), temp);
            look_at(eye, at, [0.0,1.0,0.0,0.0]);
        } else if(direction == "right" && !pressed) {
            let temp = LinAlg.matrixVecMult(LinAlg.transform(-eye[0],-eye[1],-eye[2]),at);
            temp = LinAlg.matrixVecMult(LinAlg.rotateY(-90/50), temp);
            at = LinAlg.matrixVecMult(LinAlg.transform(eye[0],eye[1],eye[2]), temp);
            look_at(eye, at, [0.0,1.0,0.0,0.0]);
        }
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

    document.onkeydown = keyDownCallback;
    
    display();
    requestAnimationFrame(idle);
}
