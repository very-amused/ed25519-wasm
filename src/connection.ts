import { ED25519 } from './ed25519'

/**
 * Wrap communication with a Web Worker in a promise based interface.
 */
export class WorkerConnection {
  private worker: Worker
  private resolve?: (value: ED25519.Response) => void

  constructor(worker: Worker) {
    this.worker = worker

    // Create an event listener to receive messages on
    this.worker.addEventListener('message', (evt: MessageEvent<ED25519.Response>) => {
      this.onMessage(evt)
    }, true)
  }

  private onMessage(evt: MessageEvent<ED25519.Response>): void {
    if (!this.resolve) {
      return
    }

    this.resolve(evt.data)
  }

  public postMessage(message: ED25519.Request, transfer: Transferable[] = []): Promise<ED25519.Response> {
    const p: Promise<ED25519.Response> = new Promise((resolve) => {
      this.resolve = resolve
    })
    this.worker.postMessage(message, transfer)
    return p
  }

  public deinit() {
    this.worker.removeEventListener('message', (evt: MessageEvent<ED25519.Response>) => {
      this.onMessage(evt)
    }, true)
    this.worker.terminate()
  }
}
