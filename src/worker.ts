import { ED25519 } from './ed25519'

// #region Global

let ed25519: ED25519.Exports

// #endregion

// #region IPC

/**
 * @internal
 * Get a detailed message from an error, sent in the message field when code === ARGON2WASM_UNKNOWN
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  } else if (typeof err === 'string') {
    return err
  } else {
    return 'An unknown error has occured, and a message was unable to be parsed from this error'
  }
}

/**
 * @internal
 * Parse an error object to post to the main thread
 */
function postError(err: unknown): void {
  if (typeof err === 'number' && err in ED25519.ErrorCodes) {
    postMessage({
      code: err
    })
  } else {
    postMessage({
      code: ED25519.ErrorCodes.Unknown,
      message: getErrorMessage(err)
    })
  }
}

/**
 * @internal 
 * @override
 */
const postMessage = (message: ED25519.Response, transfer: Transferable[] = []) => {
  self.postMessage(message, transfer)
}

// #endregion

async function loadED25519(wasmPath = '.'): Promise<ED25519.Exports> {
  if (typeof WebAssembly !== 'object') {
    throw ED25519.ErrorCodes.UnsupportedBrowser
  }

  let source: ED25519.Source
  if (typeof WebAssembly.instantiateStreaming === 'function') {
    source = await WebAssembly.instantiateStreaming(fetch(wasmPath)) as ED25519.Source
  } else {
    const res = await fetch(wasmPath)
    const raw = await res.arrayBuffer()
    source = await WebAssembly.instantiate(raw) as ED25519.Source
  }
  return source.instance.exports
}

onmessage = async function(evt: MessageEvent<ED25519.Request>): Promise<void> {
  const req = evt.data

  switch (req.method) {
  case ED25519.Methods.LoadED25519:
    try {
      ed25519 = await loadED25519()
    } catch (err) {
      postError(err)
      return
    }
    postMessage({
      code: ED25519.ErrorCodes.Success
    })
    break

  default:
    postMessage({
      code: ED25519.ErrorCodes.BadRequest
    })
  }

}