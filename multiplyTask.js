const { parentPort, workerData } = require('worker_threads');

const { rowAindex, A, colBindex, B } = workerData;

let value = 0;

for (let l = 0; l < B.length; l++) {
    value+= A[rowAindex][l] * B[l][colBindex];
}

parentPort.postMessage({
    rowAindex,
    colBindex,
    value
});
