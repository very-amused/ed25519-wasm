import * as connection from './connection';
export declare namespace ED25519 {
    export import WorkerConnection = connection.WorkerConnection;
    const seedLen = 32;
    const publicKeyLen = 32;
    const privateKeyLen = 64;
    const signatureLen = 64;
    enum Methods {
        LoadED25519 = 0,
        GenerateKeypair = 1,
        SignMessage = 2
    }
    type GenerateParameters = {
        seed: Uint8Array;
        omitPublicKey: boolean;
    };
    type SignParameters = {
        message: Uint8Array;
        privateKey: Uint8Array;
    };
    type GenerateResult = {
        body: {
            publicKey: Uint8Array | null;
            privateKey: Uint8Array;
        };
    };
    type SignResult = {
        signature: Uint8Array;
    };
    type LoadParameters = {
        wasmPath: string;
    };
    type Request = {
        method: Methods;
        params: GenerateParameters | LoadParameters | SignParameters;
    };
    type Response = {
        code: ErrorCodes;
        body?: GenerateResult['body'] | SignResult;
        message?: string;
    };
    enum ErrorCodes {
        Success = 0,
        BadRequest = 1,
        UnsupportedBrowser = 2,
        Unknown = 3
    }
}
