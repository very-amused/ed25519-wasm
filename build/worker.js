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
onmessage = async function (evt) {
    const req = evt.data;
    switch (req.method) {
        case ED25519.Methods.LoadED25519:
            try {
                ed25519 = await loadED25519();
            }
            catch (err) {
                postError(err);
                return;
            }
            postMessage({
                code: ED25519.ErrorCodes.Success
            });
            break;
        default:
            postMessage({
                code: ED25519.ErrorCodes.BadRequest
            });
    }
};
