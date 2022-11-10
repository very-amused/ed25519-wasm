/**
 * @license
 * ed25519-wasm v0.1.1
 * MIT License
 * Copyright (c) 2022 Keith Scroggs
 */
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
    ED25519.signatureLen = 64;
    (function (Methods) {
        Methods[Methods["LoadED25519"] = 0] = "LoadED25519";
        Methods[Methods["GenerateKeypair"] = 1] = "GenerateKeypair";
        Methods[Methods["SignMessage"] = 2] = "SignMessage";
    })(ED25519.Methods || (ED25519.Methods = {}));
    (function (ErrorCodes) {
        ErrorCodes[ErrorCodes["Success"] = 0] = "Success";
        ErrorCodes[ErrorCodes["BadRequest"] = 1] = "BadRequest";
        ErrorCodes[ErrorCodes["UnsupportedBrowser"] = 2] = "UnsupportedBrowser";
        ErrorCodes[ErrorCodes["Unknown"] = 3] = "Unknown";
    })(ED25519.ErrorCodes || (ED25519.ErrorCodes = {}));
})(ED25519 || (ED25519 = {}));

export { ED25519, WorkerConnection };
