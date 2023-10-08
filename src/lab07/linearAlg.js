'use strict'

class LinAlg {
    /*
    constructor() {
        if (this instanceof StaticClass) {
          throw Error('A static class cannot be instantiated.');
        }
    }*/

    static printVector(v) {
        console.log("[" + v[0].toFixed(4) + "    " + v[1].toFixed(4) + "    " + v[2].toFixed(4) + "    " + v[3].toFixed(4) + "]");
    }

    static scalarVectorMult(alpha, v) {
        let output = [];
        for(let i=0; i<4; i++) {
            output[i] = v[i] *alpha;
        }
        return output;
    }

    static vecAdd(v1, v2) {
        let output = [];
        for(let i=0; i<4; i++) {
            output.push(v1[i] + v2[i]);
        }
        return output;
    }

    static vecSub(v1, v2) {
        let output = [];
        for(let i=0; i<4; i++) {
            output.push(v1[i] - v2[i]);
        }
        return output;
    }

    static magnitude(v) {
        let output = 0;
        for(let i=0; i<4; i++) {
            output += Math.pow((v[i]),2);
        }
        return Math.sqrt(output);
    }

    static normalize(v) {
        let output = [];
        const mag = this.magnitude(v);
        for(let i=0; i<4; i++) {
            output.push(v[i]/mag);
        }
        return output;
    }

    static dotProduct(v1, v2) {
        let output = 0;
        for(let i=0; i<4; i++) {
            output += v1[i] * v2[i];
        }
        return output;
    }

    static crossProduct(v1, v2) {
        let output = [];
        output.push(v1[1]*v2[2]-v1[2]*v2[1]);
        output.push(v1[2]*v2[0]-v1[0]*v2[2]);
        output.push(v1[0]*v2[1]-v1[1]*v2[0]);
        output.push(0);
        return output;
    }

    //MATRIX OPERATIONS
    static printMatrix(m) {
        if(m === -1){
            console.log("invalid");
        }
        //column-major representation
        //go through a column
        for(let i=0; i<4; i++) {
            //go through a row
            console.log(m[0][i].toFixed(4) + "    " + m[1][i].toFixed(4) + "    " + m[2][i].toFixed(4) + "    " +m[3][i].toFixed(4) + "\n");
        }
    }

    static scalarMatrixMult(alpha, m) {
        let output = [[],[],[],[]];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = m[i][j]*alpha;
            }
        }
        return output;
    }

    static matrixAdd(m1, m2) {
        let output = [[],[],[],[]];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = m1[i][j]+m2[i][j];
            }
        }
        return output;
    }

    static matrixSub(m1, m2) {
        let output = [[],[],[],[]];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = m1[i][j]-m2[i][j];
            }
        }
        return output;
    }

    static matrixVecMult(m, v) {
        let sum = [0, 0, 0, 0];
        for(let i=0; i<4; i++) {
            sum = this.vecAdd(this.scalarVectorMult(v[i],m[i]),sum);
        }
        return sum;
    }

    static matrixMatrixMult(m1, m2) {
        let output = [[],[],[],[]];
        let mT = this.transpose(m1);
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = this.dotProduct(mT[j],m2[i]);
                //console.log(i+" "+j+" "+output[i][j]);
            }
        }
        return output;
    }

    static transpose(m) {
        let output = [[],[],[],[]];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = m[j][i];
            }
        }
        return output;
    }

    static inverse(m) {
        let output = [[],[],[],[]];
        let minor = this.matrixMinor(m);
        output = this.cofactor(minor);
        output = this.transpose(output);
        //this.printMatrix(output);
        const det = this.determinant_m4(minor,m);
        //console.log(det);
        if(det == 0) {
            return -1;
        }
        output = this.scalarMatrixMult(1/det, output);
        return output;
    }

    static matrixMinor(m) {
        let output = [[],[],[],[]];
        for(let i=0; i<4; i++){
            for(let j=0; j<4; j++){
                let c = [];
                let r = [];
                let countC = 0;
                let countR = 0
                for(let a=0; a<4; a++){
                    if(a != i){
                        c[countC] = a;
                        countC++;
                    }
                    if(a != j){
                        r[countR] = a;
                        countR++;
                    }
                }
                output[i][j] = m[c[0]][r[0]]*m[c[1]][r[1]]*m[c[2]][r[2]]+m[c[1]][r[0]]*m[c[2]][r[1]]*m[c[0]][r[2]]+m[c[2]][r[0]]*m[c[0]][r[1]]*m[c[1]][r[2]];
                output[i][j] -= m[c[0]][r[2]]*m[c[1]][r[1]]*m[c[2]][r[0]]+m[c[1]][r[2]]*m[c[2]][r[1]]*m[c[0]][r[0]]+m[c[2]][r[2]]*m[c[0]][r[1]]*m[c[1]][r[0]];
            }
        }
        return output;
    }

    static cofactor(m) {
        let output = [[],[],[],[]];
        let makeNeg = true;
        for(let i=0; i<4; i++) {
            makeNeg = !makeNeg;
            for(let j=0; j<4; j++) {
                if(makeNeg) {
                    output[i][j] = -m[i][j];
                } else {
                    output[i][j] = m[i][j];
                }
                makeNeg = !makeNeg;
            }
        }
        return output;
    }

    static determinant_m4(minor, m) {
        return minor[0][0]*m[0][0]-minor[0][1]*m[0][1]+minor[0][2]*m[0][2]-minor[0][3]*m[0][3];
    }

    static transform(xTrans, yTrans, zTrans) {
        let output = [[],[],[],[]];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                if(i==j) {
                    output[i][j] = 1;
                } else {
                    output[i][j] = 0;
                }
            }
        }
        output[3][0] = xTrans;
        output[3][1] = yTrans;
        output[3][2] = zTrans;
        return output;
    }

    static scale(xScale, yScale, zScale) {
        let output = [[],[],[],[]];
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                if(i == j) {
                    if(i == 0) {
                        output[i][j] = xScale;
                    } else if(i == 1) {
                        output[i][j] = yScale;
                    } else if (i == 2) {
                        output[i][j] = zScale;
                    } else {
                        output[i][j] = 1;
                    }
                } else {
                    output[i][j] = 0;
                }
            }
        }
        return output;
    }
    
    static rotateX (theta) {
        let output = [[],[],[],[]];
        theta = theta*Math.PI/180;
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = 0;
            }
        }
        output[0][0] = 1;
        output[1][1] = Math.cos(theta);
        output[2][1] = (-1)*Math.sin(theta);
        output[1][2] = Math.sin(theta);
        output[2][2] = Math.cos(theta);
        output[3][3] = 1;
        return output;
    }

    static rotateY (theta) {
        let output = [[],[],[],[]];
        theta = theta*Math.PI/180;
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = 0;
            }
        }
        output[0][0] = Math.cos(theta);
        output[2][0] = Math.sin(theta);
        output[1][1] = 1;
        output[0][2] = (-1)*Math.sin(theta);
        output[2][2] = Math.cos(theta);
        output[3][3] = 1;
        return output;
    }

    static rotateZ (theta) {
        let output = [[],[],[],[]];
        theta = theta*Math.PI/180;
        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                output[i][j] = 0;
            }
        }
        output[0][0] = Math.cos(theta);
        output[1][0] = (-1)*Math.sin(theta);
        output[0][1] = Math.sin(theta);
        output[1][1] = Math.cos(theta);
        output[2][2] = 1;
        output[3][3] = 1;
        return output;
    }
}

//export {LinAlg};