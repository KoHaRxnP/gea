import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import _generate from '@babel/generator'
import { convertFunctionalToClass } from '../../src/preprocess/functional-to-class.js'
import { emitSlot } from '../../src/closure-codegen/emit/emit-slot.js'
import { t } from '../../src/utils/babel-interop.js'

const generate = (_generate as any).default ?? _generate

describe('emitSlot and functional components - missing children & props fallback', () => {
  it('uses void 0 for missing slot attributes', () => {
    const mockContext = {
      bindings: new Map(),
      reactiveRoot: t.identifier('root'),
      importsNeeded: new Set(),
      directFnComponentParams: new Map([['FooButton', { props: ['someProp'] }]]),
    } as any

    const slot = {
      kind: 'direct-fn',
      index: 1,
      payload: {
        tag: 'FooButton',
        attrs: [],
      },
    }

    const stmts: any[] = []
    emitSlot(slot as any, stmts, mockContext)

    const generatedCode = stmts.map((s) => generate(s).code).join('\n')
    assert.ok(generatedCode.includes('void 0'))
  })

  it('does not render placeholder 0 when children are omitted in functional components', () => {
    const code = `
      export default function FooButton({ children }) {
        return <button>{children}</button>;
      }

      const element = <FooButton />;
    `
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] })
    convertFunctionalToClass(ast, { name: 'FooButton', kind: 'default' }, new Map())
    const output = generate(ast).code
    assert.ok(!output.includes('>0<'), 'Missing children should not result in static 0 placeholder')
  })
})
