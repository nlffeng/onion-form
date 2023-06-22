/**
 * detailModePlugin
 * @description 详情模式 - 插件
 * @author moting.nq
 * @create 2022-08-22 10:34
 */

import { Apis } from '../onion-engine/types'
import { Schema } from '../common-types'

export type FormValues = Record<string, any>
export type Mode = 'edit' | 'detail'

export type OnValuesChange = (changedValues: Record<string, any>, allValues: Record<string, any>) => void

const detailMode = ({ mode, onGetUpdateSchemaByMode }: {
  mode: Mode,
  onGetUpdateSchemaByMode: (callback: (mode: Mode) => Promise<void>) => void,
}) => (apis: Apis) => {
  // 记录初始值
  let isFirst = true
  const disabledValues: Record<string, undefined | boolean> = {}

  // 注册更新 schema 中间件
  apis.injectSchemaMiddleware(async (prevSchema, next) => {
    let schema: Schema = prevSchema

    // 先执行其它中间件，最后拿到 schema 来处理
    if (next) {
      schema = await next?.(schema)
    }

    const newElements = Object.entries(schema.elements).reduce((result, [elementId, element]: any[]) => {
      // 禁用表单元素
      if (element.props?.relatedModelField) {
        if (isFirst) {
          disabledValues[elementId] = element.props?.formProps?.disabled
        }

        result[elementId] = {
          ...element,
          props: {
            ...element.props,
            formProps: {
              ...element.props?.formProps,
              // 如果为 edit 恢复到初始的禁用状态
              disabled: mode === 'detail' ? true : disabledValues[elementId],
            },
          },
        }
        return result
      }

      // 隐藏元素
      if (mode === 'detail' && element.isHiddenInDetailMode === true) {
        result[elementId] = {
          ...element,
          hidden: true,
        }
        return result
      }

      result[elementId] = element
      return result
    }, {});

    isFirst = false;

    schema = {
      ...schema,
      elements: newElements,
    }

    return schema
  })

  // 将回调函数外借
  onGetUpdateSchemaByMode(async function updateSchemaByMode(_mode: Mode) {
    mode = _mode
    const schema = await apis.getSchema()
    apis.updateSchema(schema!)
  })
}

export default detailMode
