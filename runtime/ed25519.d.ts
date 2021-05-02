export declare namespace ED25519 {
    type Ptr = number;
    type Source = WebAssembly.WebAssemblyInstantiatedSource & {
        instance: WebAssembly.Instance & {
            exports: Exports;
        };
    };
    type Exports = {
        malloc(size: number): Ptr;
        free(ptr: Ptr): void;
        ed25519_keypair(seed: Ptr, publicKey: Ptr, privateKey: Ptr): void;
    };
    const seedLen = 32;
    const publicKeyLen = 32;
    const privateKeyLen = 64;
    enum Methods {
        LoadED25519 = 0
    }
    type Request = {
        method: Methods;
        params: LoadED25519Params;
    };
    type Response = {
        code: ErrorCodes;
        message?: string;
    };
    type LoadED25519Params = {
        wasmPath: string;
    };
    enum ErrorCodes {
        Success = 0,
        BadRequest = 1,
        UnsupportedBrowser = 2,
        Unknown = 3
    }
}
