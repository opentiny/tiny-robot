interface BaseTextItem {
  id: string
  type: string
  content: string
}

export interface TextItem extends BaseTextItem {
  type: 'text'
}

export interface TemplateItem extends BaseTextItem {
  type: 'template'
  prefix: string
  suffix: string
}

export interface ExtendedTextItem extends BaseTextItem {
  type: 'text' | 'template' | 'prefix' | 'suffix'
}

export interface StructuredDataItem {
  id: string
  type: 'block' | 'text' | 'template' | 'prefix' | 'suffix'
  content: string | StructuredDataItem[]
  asChild?: boolean
  readonly?: boolean
}

export interface EditorRange extends StaticRange {
  readonly endEl?: HTMLElement | null
  readonly endId?: string
  readonly endType?: string
  readonly startEl?: HTMLElement | null
  readonly startId?: string
  readonly startType?: string
}

export interface SelectedItem {
  id: string
  type: ExtendedTextItem['type']
  startOffset: number
  endOffset: number
}

export interface CreateItem {
  tag: 'new'
  afterId?: string
  type: 'text'
  content: string
}

export interface DataItem {
  id: string
  type: 'block' | 'text' | 'template' | 'prefix' | 'suffix'
  content: string | DataItem[]
  readonly?: boolean
  asChild?: boolean
}
