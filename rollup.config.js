import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const banner = `/**
 * @license
 * ed25519-wasm v${pkg.version}
 * MIT License
 * Copyright (c) 2022 Keith Scroggs
 */`

export default [
  {
    input: 'src/worker.ts',
    output: [
      {
        file: 'build/worker.js',
        format: 'es',
        banner
      },
      {
        file: 'build/worker.min.js',
        format: 'es',
        banner,
        plugins: [
          terser()
        ]
      }
    ],
    plugins: [
      typescript()
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      dir: 'runtime',
      banner
    },
    plugins: [
      typescript({
        outDir: 'runtime',
        declaration: true,
        exclude: ['src/worker.ts']
      })
    ]
  }
]