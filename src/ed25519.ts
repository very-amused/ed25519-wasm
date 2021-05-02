export namespace ED25519 {

export type Ptr = number

export type Source = WebAssembly.WebAssemblyInstantiatedSource & {
  instance: WebAssembly.Instance & {
    exports: Exports
  }
}

export type Exports = {
  malloc(size: number): Ptr
  free(ptr: Ptr): void
  ed25519_keypair(seed: Ptr, publicKey: Ptr, privateKey: Ptr): void
}

export const seedLen = 32
export const publicKeyLen = 32
export const privateKeyLen = 64

export enum Methods {
  LoadED25519
}

export type Request = {
  method: Methods
  params: LoadED25519Params
}

export type Response = {
  code: ErrorCodes
  message?: string
}

export type LoadED25519Params = {
  wasmPath: string
}

export enum ErrorCodes {
  Success = 0,
  BadRequest,
  UnsupportedBrowser,
  Unknown
}

}