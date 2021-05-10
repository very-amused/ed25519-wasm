import * as connection from './connection'

export namespace ED25519 {

/**
 * @internal
 */
export type Source = WebAssembly.WebAssemblyInstantiatedSource & {
  instance: WebAssembly.Instance & {
    exports: Exports
  }
}

/**
 * @internal
 */
export type Exports = {
  malloc(size: number): number
  free(ptr: number): void
  ed25519_keypair(seed: number, publicKey: number, privateKey: number): void
  ed25519_sign(signedMessage: number, message: number, messageLen: number, privateKey: number): void
  memory: WebAssembly.Memory
}

export import WorkerConnection = connection.WorkerConnection

export const seedLen = 32
export const publicKeyLen = 32
export const privateKeyLen = 64
export const signatureLen = 64

export enum Methods {
  LoadED25519 = 0,
  GenerateKeypair,
  SignMessage
}

export type GenerateParameters = {
  seed: Uint8Array
  omitPublicKey: boolean
}

export type SignParameters = {
  message: Uint8Array
  privateKey: Uint8Array
}

export type GenerateResult = {
  body: {
    publicKey: Uint8Array|null
    privateKey: Uint8Array
  }
  /** @internal */
  transfer: Transferable[]
}

export type SignResult = {
  signature: Uint8Array
}

export type LoadParameters = {
  wasmPath: string
}

export type Request = {
  method: Methods
  params: GenerateParameters|LoadParameters|SignParameters
}

export type Response = {
  code: ErrorCodes
  body?: GenerateResult['body']|SignResult
  message?: string
}

export enum ErrorCodes {
  Success = 0,
  BadRequest,
  UnsupportedBrowser,
  Unknown
}

}