/**
 * BaseRenderer
 * @description 基础渲染
 * @author moting.nq
 * @create 2022-06-13 19:18
 */

import React, { FC, useState, useMemo, useRef, useEffect } from 'react'
import { OnionEngine } from '../onion-engine'
import { ReactRenderer, ReactRendererProps } from '../react-renderer'
import { IProps } from './types'

export type { IProps }

const BaseRenderer: FC<IProps> = ({
  schema,
  plugins = [],
  components,
}) => {

  const [data, setData] = useState<{
    layout?: ReactRendererProps['layout'],
    elements?: ReactRendererProps['elements'],
  }>()

  const engine = useMemo(() => {
    const _engine = new OnionEngine({
      plugins,
    })
    return _engine
  }, [])

  useEffect(() => {
    engine.register('onSchemaInput', (newSchema) => {
      setData({
        layout: engine.layoutEngine.layout,
        elements: engine.elementsEngine.elements,
      })
    })
  }, [])

  useEffect(() => {
    if (!schema) return
    engine.updateSchema(schema)
  }, [schema])

  return (
    (data?.layout && data?.elements) ? (
      <ReactRenderer
        components={components}
        elements={data.elements}
        layout={data.layout}
      />
    ) : null
  )
}

BaseRenderer.defaultProps = {}

export default BaseRenderer
