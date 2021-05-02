import { ED25519 } from './ed25519'

const postMessage = (message: ED25519.Response, transfer: Transferable[] = []) => {
  self.postMessage(message, transfer)
}

onmessage = async function(evt: MessageEvent<ED25519.Request>): Promise<void> {
  // Make sure the message data is a key value object
  if (Array.isArray(evt.data) || typeof evt.data !== 'object') {
    postMessage({
      code: ED25519.ErrorCodes.BadRequest
    })
    return
  }

  const req = evt.data

  switch (req.method) {
    case ED25519.Methods.LoadED25519:
      break

    default:
      postMessage({
        code: ED25519.ErrorCodes.BadRequest
      })
  }

}