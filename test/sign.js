const fs = require('fs')
const crypto = require('crypto')

const file = fs.readFileSync('../ed25519.wasm')

;(async function() {
  const src = await WebAssembly.instantiate(file)
  const ed25519 = src.instance.exports

  const seedLen = 32
  const seedPtr = ed25519.malloc(seedLen)
  const seedView = new Uint8Array(ed25519.memory.buffer, seedPtr, seedLen)
  crypto.randomFillSync(seedView)

  const privateKeyLen = 64
  const publicKeyLen = 32
  const privateKeyPtr = ed25519.malloc(privateKeyLen)
  const publicKeyPtr = ed25519.malloc(publicKeyLen)

  ed25519.ed25519_keypair(seedPtr, publicKeyPtr, privateKeyPtr)

  const messageLen = 32
  const messagePtr = ed25519.malloc(messageLen)
  const messageView = new Uint8Array(ed25519.memory.buffer, messagePtr, messageLen)
  crypto.randomFillSync(messageView)

  const signedMessageLen = 64 + messageLen
  const signedMessagePtr = ed25519.malloc(signedMessageLen)
  const signedMessageView = new Uint8Array(ed25519.memory.buffer, signedMessagePtr, signedMessageLen)
  ed25519.ed25519_sign(signedMessagePtr, messagePtr, messageLen, privateKeyPtr)

  const encodedMessage = Buffer.from(messageView).toString('base64')
  const encodedSignature = Buffer.from(new Uint8Array(ed25519.memory.buffer, signedMessagePtr, 64)).toString('base64')
  const publicKeyView = new Uint8Array(ed25519.memory.buffer, publicKeyPtr, publicKeyLen)
  const encodedPublicKey = Buffer.from(publicKeyView).toString('base64')

  ed25519.free(seedPtr)
  ed25519.free(privateKeyPtr)
  ed25519.free(publicKeyPtr)
  ed25519.free(messagePtr)
  ed25519.free(signedMessagePtr)

  fs.writeFileSync('./message.txt', `${encodedMessage}\n${encodedSignature}\n${encodedPublicKey}`)
})()

