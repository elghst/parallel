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

console.log('LINEAR MATRIX MULTIPLYING RESULT: ');
console.log(linearMultiplyMatrixes(A, B));

const createWorkerPromise = (path, workerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path, {workerData});

        worker.on('message', data => resolve(data));
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

const parallelMultiplyMatrixes = (A, B) => {
    const rowsA = A.length, colsA = A[0].length,
        rowsB = B.length, colsB = B[0].length,
        result = [], promisesArray = [];

    if (colsA !== rowsB) return false;

    A.forEach(() => result.push([]));

    for (let i = 0; i < colsB; i++) {
        for (let j = 0; j < rowsA; j++) {
            promisesArray.push(createWorkerPromise(
                './multiplyTask.js',
                {
                    rowAindex: j,
                    A,
                    colBindex: i,
                    B,
                }
            ));
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

console.log('PARALLEL MATRIX MULTIPLYING RESULT: ');
parallelMultiplyMatrixes(A, B).then(result => console.log(result));

const a = [
    1,
    2,
    4,
    6,
    100,
    0,
    10000,
    3
];

const linearQuickSort = (arr) => {
    if (arr.length < 2) return arr;
    let pivot = arr[0];
    const left = [];
    const right = [];

    for (let i = 1; i < arr.length; i++) {
        if (pivot > arr[i]) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return linearQuickSort(left).concat(pivot, linearQuickSort(right));
}

console.log('LINEAR BINARY SEARCH RESULT: ');
console.log(linearQuickSort(a));

const parallelQuickSort = async (arr) => {
    if (arr.length < 2) return arr;

    let pivot = arr[0];
    const left = [];
    const right = [];

    for (let i = 1; i < arr.length; i++) {
        if (pivot > arr[i]) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    const leftArray = await createWorkerPromise('./quickSortTask.js', {
        array: left,
        callback: parallelQuickSort,
    });
    const rightArray = await createWorkerPromise('./quickSortTask.js', {
        array: right,
        callback: parallelQuickSort,
    });

    return leftArray.concat(pivot, rightArray);
}

console.log('PARALLEL BINARY SEARCH RESULT: ')
parallelQuickSort(a).then(data => console.log(data));
