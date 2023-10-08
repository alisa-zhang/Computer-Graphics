import {LinAlg} from "./linearAlg.js"

/*
const v1 = [1, 2, 3, 4];
const v2 = [5, 6, 7, 8];
const m1 = [[1, -5, 9, 13], [2, 6, -10, 14], [3, 7, 11, 15], [4, 8, 12, -16]];
const m2 = [[4, 8, 12, 16], [3, 7, 11, 15], [2, 6, 10, 14], [1, 5, 9, 13]];
const s = 3.0;
*/

const v1 = [10.05, 72.63, -82.17, -81.15];
const v2 = [-78.40, -22.40, 89.17, -71.11];
const m1 = [[-47.28, -15.54, 50.58, -75.31], [-24.87, -71.42, -70.05, 66.31], [19.07, -17.87, 4.77, 79.18], [90.39, -44.49, 13.44, 7.29]];
const m2 = [[-28.44, 72.09, 47.66, -82.19], [94.60, -66.39, 11.38, 67.11], [64.76, 97.18, -34.10, 59.25], [17.61, 81.95, 91.14, 92.48]];
const s = -85.64;

console.log("TEST #1: s * v1\n");
LinAlg.printVector(LinAlg.scalarVectorMult(s,v1));

console.log("\n\nTEST #2: v1 + v2\n");
LinAlg.printVector(LinAlg.vecAdd(v1, v2));

console.log("\n\nTEST #3: v1 - v2\n");
LinAlg.printVector(LinAlg.vecSub(v1, v2));

console.log("\n\nTEST #4: |v2|\n");
console.log(LinAlg.magnitude(v2));

console.log("\n\nTEST #5: Normalized v2\n");
LinAlg.printVector(LinAlg.normalize(v2));

console.log("\n\nTEST #6: v1 . v2\n");
console.log(LinAlg.dotProduct(v1, v2));

console.log("\n\nTEST #7: v1 x v2\n");
LinAlg.printVector(LinAlg.crossProduct(v1, v2));

console.log("\n\nTEST #8: s * m1\n");
LinAlg.printMatrix(LinAlg.scalarMatrixMult(s, m1));

console.log("\n\nTEST #9: m1 + m2\n");
LinAlg.printMatrix(LinAlg.matrixAdd(m1, m2));

console.log("\n\nTEST #10: m1 - m2\n");
LinAlg.printMatrix(LinAlg.matrixSub(m1, m2));

console.log("\n\nTEST #11: m1 x m2\n");
LinAlg.printMatrix(LinAlg.matrixMatrixMult(m1, m2));

console.log("\n\nTEST #12: m1^T (transpose)\n");
LinAlg.printMatrix(LinAlg.transpose(m1));

console.log("\n\nTEST #13: m2^{-1} (inverse)\n");
LinAlg.printMatrix(LinAlg.inverse(m2));

console.log("\n\nTEST #14: m1*v1\n");
LinAlg.printVector(LinAlg.matrixVecMult(m1, v1));

console.log("\n\nTEST #15: m2*m2^{-1}\n");
LinAlg.printMatrix(LinAlg.matrixMatrixMult(m2, LinAlg.inverse(m2)));

console.log("\n\nTEST #16: m1^{-1}*m1\n");
LinAlg.printMatrix(LinAlg.matrixMatrixMult(LinAlg.inverse(m1), m1));