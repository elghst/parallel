const { Worker, workerData } = require('worker_threads');

const A = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
];

const B = [
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18],
];

const linearMultiplyMatrixes = (A, B) => {
    const rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        result = [];

    if (colsA !== rowsB) return false;

    A.forEach(() => result.push([]))

    for (let i = 0; i < colsB; i++) {
        for (let j = 0; j < rowsA; j++) {
            let k = 0;

            for (let l = 0; l < rowsB; l++) {
                k+= A[j][l] * B[l][i];
            }

            result[j][i] = k;
        }
    }

    return result;
}

console.log('LINEAR RESULT: ')
console.log(linearMultiplyMatrixes(A, B));

const createWorkerPromise = (workerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./multiplyTask.js', {workerData});

        worker.on('message', data => resolve(data));
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

const parallelMultiplyMatrixes = async (A, B) => {
    const rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        result = [], promisesArray = [];

    if (colsA !== rowsB) return false;

    A.forEach(() => result.push([]));

    for (let i = 0; i < colsB; i++) {
        for (let j = 0; j < rowsA; j++) {
            promisesArray.push(createWorkerPromise({
                rowAindex: j,
                A,
                colBindex: i,
                B,
            }));
        }
    }

    return Promise
        .all(promisesArray)
        .then(data => {
            data.forEach(multiplyResult => {
                result[multiplyResult.rowAindex][multiplyResult.colBindex] = multiplyResult.value;
            })
        })
        .then(() => result)
}

console.log('PARALLEL RESULT: ')
parallelMultiplyMatrixes(A, B).then(result => console.log(result));

