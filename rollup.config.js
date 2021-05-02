import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

const outDir = 'build'

export default [
  {
    input: 'src/worker.ts',
    output: [
      {
        file: `${outDir}/worker.js`,
        format: 'es'
      },
      {
        file: `${outDir}/worker.min.js`,
        format: 'es',
        plugins: [
          terser()
        ]
      }
    ],
    plugins: [
      typescript()
    ]
  }
]