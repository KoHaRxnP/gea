import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { transformCompiledStoreModule } from '../../src/closure-codegen/transform/transform-store.ts'

describe('transformCompiledStoreModule', () => {
  it('should transform to CompiledStore without false positives from JSDoc comments containing Store.', () => {
    const input = `
      import { Store } from '@geajs/core'
      /**
       * JSDoc comment test: Store.property
       * This is Store.
       * .Store
       */
      export class MyStore extends Store {
        data = []
        selected = null
        run() {}
        runLots() {}
        add() {}
        update() {}
        clear() {}
        swapRows() {}
        select() {}
        remove() {}
      }
      export default new MyStore()
    `

    const result = transformCompiledStoreModule(input, 'MyStore.ts')
    assert.ok(result)
    assert.strictEqual(result.changed, true)
    assert.match(result.code, /Compiled/)
  })

  it('should fall back when source code contains static Store. calls', () => {
    const input = `
      import { Store } from '@geajs/core'
      Store.someMethod()
      export class MyStore extends Store {}
      export default new MyStore()
    `

    const result = transformCompiledStoreModule(input, 'MyStore.ts')
    assert.ok(result)
    assert.strictEqual(result.changed, false)
    assert.doesNotMatch(result.code, /CompiledStore/)
  })
})