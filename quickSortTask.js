const {parentPort, workerData} = require('worker_threads');
const {array, callback} = workerData;

callback(array).then(data => parentPort.postMessage(data));
