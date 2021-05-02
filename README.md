# ed25519-wasm
Web bindings for Daniel J. Bernstein's ED25519 digital signature scheme.

## Building
Extract, prepare, and patch sources: `make prepare`

Build WebAssembly: `make`

Build Web Worker and runtime: `yarn build`

Equivalent to `make && yarn build`: `yarn build:all`