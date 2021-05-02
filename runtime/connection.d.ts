import { ED25519 } from './ed25519';
export declare class WorkerConnection {
    private worker;
    private resolve?;
    constructor(worker: Worker);
    private onMessage;
    postMessage(message: ED25519.Request, transfer?: Transferable[]): Promise<ED25519.Response>;
    deinit(): void;
}
