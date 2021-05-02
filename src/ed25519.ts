export namespace ED25519 {

export enum Methods {
  LoadED25519
}

export type Request = {
  method: Methods
  params: LoadED25519Params
}

export type Response = {
  code: ErrorCodes
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