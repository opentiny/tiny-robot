declare module '@opentiny/tiny-schema-renderer' {
  import type { DefineComponent } from 'vue'
  import type { SchemaNode } from './genui/schema'
  const SchemaRenderer: DefineComponent<{ schema: SchemaNode }>
  export default SchemaRenderer
}
