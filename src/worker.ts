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

function memCopy(dest: Uint8Array, src: Uint8Array): void {
  for (let i = 0; i < src.length; i++) {
    dest[i] = src[i]
  }
}

function zeroBytes(view: Uint8Array, passes = 1): void {
  for (let i = 0; i < passes; i++) {
    for (let j = 0; j < view.length; j++) {
      view[j] = 0x00
    }
  }
}

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

async function generate(seed: Uint8Array, omitPublicKey = true): Promise<ED25519.GenerateResult> {
  const { seedLen, publicKeyLen, privateKeyLen } = ED25519

  // Copy the seed into wasm memory
  const seedPtr = ed25519.malloc(seedLen)
  const seedView = new Uint8Array(ed25519.memory.buffer, seedPtr, seedLen)
  memCopy(seedView, seed)

  // Allocate memory for the generated keypair
  const publicKeyPtr = ed25519.malloc(publicKeyLen)
  const privateKeyPtr = ed25519.malloc(privateKeyLen)

  // Call ed25519_keypair
  ed25519.ed25519_keypair(seedPtr, publicKeyPtr, privateKeyPtr)

  // Immediately overwrite and free the seed
  zeroBytes(seedView)
  ed25519.free(seedPtr)

  // Copy the keys into JS memory
  const privateKeyView = new Uint8Array(ed25519.memory.buffer, privateKeyPtr, privateKeyLen)
  const privateKey = new Uint8Array(privateKeyLen)
  memCopy(privateKey, privateKeyView)

  // Only copy the public key if omitPublicKey is false
  let publicKey: Uint8Array|null = null
  const publicKeyView = new Uint8Array(ed25519.memory.buffer, publicKeyPtr, publicKeyLen)
  if (!omitPublicKey) {
    publicKey = new Uint8Array(publicKeyLen)
    memCopy(publicKey, publicKeyView)
  }

  // Zero and free public and private key memory
  zeroBytes(publicKeyView)
  ed25519.free(publicKeyPtr)
  zeroBytes(privateKeyView)
  ed25519.free(privateKeyPtr)

  return {
    body: {
      publicKey,
      privateKey,
    },
    transfer: publicKey !== null ? [publicKey.buffer, privateKey.buffer] : [privateKey.buffer]
  }
}

async function sign(message: Uint8Array, privateKey: Uint8Array): Promise<Uint8Array> {
  const { privateKeyLen, signatureLen } = ED25519

  // Copy message and private key into WASM memory
  const messageLen = message.length
  const messagePtr = ed25519.malloc(messageLen)
  const messageView = new Uint8Array(ed25519.memory.buffer, messagePtr, messageLen)
  memCopy(messageView, message)

  const privateKeyPtr = ed25519.malloc(privateKeyLen)
  const privateKeyView = new Uint8Array(ed25519.memory.buffer, privateKeyPtr, privateKeyLen)
  memCopy(privateKeyView, privateKey)

  // Allocate buffer for signature result
  const signedMessagePtr = ed25519.malloc(signatureLen + messageLen)

  // Sign the message
  ed25519.ed25519_sign(signedMessagePtr, messagePtr, messageLen, privateKeyPtr)

  // Zero out and free the copied message and private key
  zeroBytes(messageView)
  ed25519.free(messagePtr)
  zeroBytes(privateKeyView)
  ed25519.free(privateKeyPtr)

  // Copy the first 64 bytes of the signed message (the signature alone) to JS memory
  const signedMessageView = new Uint8Array(ed25519.memory.buffer, signedMessagePtr, signatureLen + messageLen)
  const signature = new Uint8Array(signatureLen)
  memCopy(signature, signedMessageView.slice(0, 64))

  zeroBytes(signedMessageView)
  ed25519.free(signedMessagePtr)

  return signature
}

onmessage = async function(evt: MessageEvent<ED25519.Request>): Promise<void> {
  const req = evt.data

  switch (req.method) {
  case ED25519.Methods.LoadED25519:
    try {
      const params = req.params as ED25519.LoadParameters
      ed25519 = await loadED25519(params.wasmPath)
      postMessage({
        code: ED25519.ErrorCodes.Success
      })
    } catch (err) {
      postError(err)
    }
    break
  
  case ED25519.Methods.GenerateKeypair:
    try {
      const params = req.params as ED25519.GenerateParameters
      const result = await generate(params.seed, params.omitPublicKey)
      postMessage({
        code: ED25519.ErrorCodes.Success,
        body: result.body
      }, result.transfer)
    } catch (err) {
      postError(err)
    }
    break
  
  case ED25519.Methods.SignMessage:
    try {
      const params = req.params as ED25519.SignParameters
      const signature = await sign(params.message, params.privateKey)
      postMessage({
        code: ED25519.ErrorCodes.Success,
        body: {
          signature
        }
      }, [signature.buffer])
    } catch (err) {
      postError(err)
    }
    break

  default:
    postMessage({
      code: ED25519.ErrorCodes.BadRequest
    })
  }

}
