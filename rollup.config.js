import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/worker.ts',
    output: [
      {
        file: 'build/worker.js',
        format: 'es'
      },
      {
        file: 'build/worker.min.js',
        format: 'es',
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
      dir: 'runtime'
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig-runtime.json'
      })
    ]
  }
]