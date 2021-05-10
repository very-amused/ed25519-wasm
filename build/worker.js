class WorkerConnection {
    constructor(worker) {
        this.worker = worker;
        this.worker.addEventListener('message', (evt) => {
            this.onMessage(evt);
        }, true);
    }
    onMessage(evt) {
        if (!this.resolve) {
            return;
        }
        this.resolve(evt.data);
    }
    postMessage(message, transfer = []) {
        const p = new Promise((resolve) => {
            this.resolve = resolve;
        });
        this.worker.postMessage(message, transfer);
        return p;
    }
    deinit() {
        this.worker.removeEventListener('message', (evt) => {
            this.onMessage(evt);
        }, true);
        this.worker.terminate();
    }
}

var ED25519;
(function (ED25519) {
    ED25519.WorkerConnection = WorkerConnection;
    ED25519.seedLen = 32;
    ED25519.publicKeyLen = 32;
    ED25519.privateKeyLen = 64;
    (function (Methods) {
        Methods[Methods["LoadED25519"] = 0] = "LoadED25519";
        Methods[Methods["GenerateKeypair"] = 1] = "GenerateKeypair";
    })(ED25519.Methods || (ED25519.Methods = {}));
    (function (ErrorCodes) {
        ErrorCodes[ErrorCodes["Success"] = 0] = "Success";
        ErrorCodes[ErrorCodes["BadRequest"] = 1] = "BadRequest";
        ErrorCodes[ErrorCodes["UnsupportedBrowser"] = 2] = "UnsupportedBrowser";
        ErrorCodes[ErrorCodes["Unknown"] = 3] = "Unknown";
    })(ED25519.ErrorCodes || (ED25519.ErrorCodes = {}));
})(ED25519 || (ED25519 = {}));

let ed25519;
function getErrorMessage(err) {
    if (err instanceof Error) {
        return err.message;
    }
    else if (typeof err === 'string') {
        return err;
    }
    else {
        return 'An unknown error has occured, and a message was unable to be parsed from this error';
    }
}
function postError(err) {
    if (typeof err === 'number' && err in ED25519.ErrorCodes) {
        postMessage({
            code: err
        });
    }
    else {
        postMessage({
            code: ED25519.ErrorCodes.Unknown,
            message: getErrorMessage(err)
        });
    }
}
const postMessage = (message, transfer = []) => {
    self.postMessage(message, transfer);
};
function memCopy(dest, src) {
    for (let i = 0; i < src.length; i++) {
        dest[i] = src[i];
    }
}
function zeroBytes(view, passes = 1) {
    for (let i = 0; i < passes; i++) {
        for (let j = 0; j < view.length; j++) {
            view[j] = 0x00;
        }
    }
}
async function loadED25519(wasmPath = '.') {
    if (typeof WebAssembly !== 'object') {
        throw ED25519.ErrorCodes.UnsupportedBrowser;
    }
    let source;
    if (typeof WebAssembly.instantiateStreaming === 'function') {
        source = await WebAssembly.instantiateStreaming(fetch(wasmPath));
    }
    else {
        const res = await fetch(wasmPath);
        const raw = await res.arrayBuffer();
        source = await WebAssembly.instantiate(raw);
    }
    return source.instance.exports;
}
async function generate(seed, omitPublicKey = true) {
    const { seedLen, publicKeyLen, privateKeyLen } = ED25519;
    const seedPtr = ed25519.malloc(seedLen);
    const seedView = new Uint8Array(ed25519.memory.buffer, seedPtr, seedLen);
    memCopy(seedView, seed);
    const publicKeyPtr = ed25519.malloc(publicKeyLen);
    const privateKeyPtr = ed25519.malloc(privateKeyLen);
    ed25519.ed25519_keypair(seedPtr, publicKeyPtr, privateKeyPtr);
    zeroBytes(seedView);
    ed25519.free(seedPtr);
    const privateKeyView = new Uint8Array(ed25519.memory.buffer, privateKeyPtr, privateKeyLen);
    const privateKey = new Uint8Array(privateKeyLen);
    memCopy(privateKey, privateKeyView);
    let publicKey = null;
    const publicKeyView = new Uint8Array(ed25519.memory.buffer, publicKeyPtr, publicKeyLen);
    if (!omitPublicKey) {
        publicKey = new Uint8Array(publicKeyLen);
        memCopy(publicKey, publicKeyView);
    }
    zeroBytes(publicKeyView);
    ed25519.free(publicKeyPtr);
    zeroBytes(privateKeyView);
    ed25519.free(privateKeyPtr);
    return {
        body: {
            publicKey,
            privateKey,
        },
        transfer: publicKey !== null ? [publicKey.buffer, privateKey.buffer] : [privateKey.buffer]
    };
}
onmessage = async function (evt) {
    const req = evt.data;
    switch (req.method) {
        case ED25519.Methods.LoadED25519:
            try {
                const params = req.params;
                ed25519 = await loadED25519(params.wasmPath);
                postMessage({
                    code: ED25519.ErrorCodes.Success
                });
            }
            catch (err) {
                postError(err);
            }
            break;
        case ED25519.Methods.GenerateKeypair:
            try {
                const params = req.params;
                const result = await generate(params.seed, params.omitPublicKey);
                postMessage({
                    code: ED25519.ErrorCodes.Success,
                    body: result.body
                }, result.transfer);
            }
            catch (err) {
                postError(err);
            }
            break;
        default:
            postMessage({
                code: ED25519.ErrorCodes.BadRequest
            });
    }
};
