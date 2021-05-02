var ED25519;
(function (ED25519) {
    ED25519.seedLen = 32;
    ED25519.publicKeyLen = 32;
    ED25519.privateKeyLen = 64;
    (function (Methods) {
        Methods[Methods["LoadED25519"] = 0] = "LoadED25519";
    })(ED25519.Methods || (ED25519.Methods = {}));
    (function (ErrorCodes) {
        ErrorCodes[ErrorCodes["Success"] = 0] = "Success";
        ErrorCodes[ErrorCodes["BadRequest"] = 1] = "BadRequest";
        ErrorCodes[ErrorCodes["UnsupportedBrowser"] = 2] = "UnsupportedBrowser";
        ErrorCodes[ErrorCodes["Unknown"] = 3] = "Unknown";
    })(ED25519.ErrorCodes || (ED25519.ErrorCodes = {}));
})(ED25519 || (ED25519 = {}));

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

export { ED25519, WorkerConnection };
