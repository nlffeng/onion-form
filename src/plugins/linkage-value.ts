/**
 * linkageValue
 * @description 联动值-插件
 * @author moting.nq
 * @create 2022-08-09 19:30
 */

import { setSchemaAttr } from '../helper'
import { Apis } from '../onion-engine/types'
import { Schema } from '../common-types'

export interface LinkageValueItem {
  /** 源元素id，即根据源元素的值(`value` 字段)联动，该值记为 `sourceValue` */
  sourceElement: string,
  /** 该元素下 props 中目标字段的值为 `sourceValue`，比如 `targetField` 为 `dynamicProps.params.b` */
  targetField: string,
}

export default (apis: Apis) => {
  apis.injectSchemaMiddleware(async (prevSchema, next) => {
    let schema: Schema = prevSchema

    // 先执行其它中间件，最后拿到 schema 来处理
    if (next) {
      schema = await next?.(schema)
    }

    // 处理逻辑
    const elementsEntries = Object.entries(schema.elements)
    for (let i = 0; i < elementsEntries.length; i++) {
      const [elementId, element] = elementsEntries[i]
      const linkageValue = element.props?.linkageValue as LinkageValueItem[]

      if (!Array.isArray(linkageValue)) continue

      linkageValue.forEach(({ sourceElement, targetField }) => {
        if (!targetField || typeof targetField !== 'string') return
        // 联动改变 linkageValue 字段的跳过，不允许改变自身
        if (targetField.indexOf('linkageValue') === 0) return

        const sourceElementObj = schema.elements[sourceElement]
        if (!sourceElementObj) return

        const relatedModelField = sourceElementObj.props?.relatedModelField
        if (!relatedModelField) return

        // TODO 增加缓存优化
        const sourceElementValue = sourceElementObj.props?.value
        const arr = targetField.split('.')

        schema = setSchemaAttr({
          type: 'cover',
          schema,
          keyPath: ['elements', elementId, 'props', ...arr],
          value: sourceElementValue,
        });
      })
    }

    return schema
  })
}
