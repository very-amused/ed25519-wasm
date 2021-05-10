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
  memory: WebAssembly.Memory
}

export import WorkerConnection = connection.WorkerConnection

export const seedLen = 32
export const publicKeyLen = 32
export const privateKeyLen = 64

export enum Methods {
  LoadED25519 = 0,
  GenerateKeypair
}

export type GenerateParameters = {
  seed: Uint8Array
  omitPublicKey: boolean
}

/**
 * @internal
 * Internal result structure for the generate function
 */
export type GenerateResult = {
  body: {
    publicKey: Uint8Array|null
    privateKey: Uint8Array
  }
  transfer: Transferable[]
}

export type LoadParameters = {
  wasmPath: string
}

export type Request = {
  method: Methods
  params: GenerateParameters|LoadParameters
}

export type Response = {
  code: ErrorCodes
  body?: GenerateResult['body']
  message?: string
}

export enum ErrorCodes {
  Success = 0,
  BadRequest,
  UnsupportedBrowser,
  Unknown
}

}