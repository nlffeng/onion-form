/**
 * dynamicDataPlugin
 * @description 动态数据请求 - 插件
 * @author moting.nq
 * @create 2022-06-20 12:00
 */

import isEqual from 'lodash/isEqual';
import { setSchemaElementsProps } from '../helper'
import { Apis } from '../onion-engine/types'
import { Schema, ElementId } from '../common-types'

export interface Params {
  dynamicRequest?: (opitons: {
    api: string;
    params?: Record<string, any>;
    method?: 'POST' | 'GET';
    dynamicProps: DynamicProps;
  }) => Promise<any>
}

export interface DynamicProps {
  /**
   * 动态请求数据后给到的字段
   * 限于 props 内属性，除了 value 属性
   * 比如动态请求下拉数据，指定 options 字段
   */
  field: string;
  /** 指定接口 */
  api: string;
  /** 请求方式 */
  method?: 'POST' | 'GET';
  /** 请求参数 */
  params?: Record<string, any>;
  /**
   * 默认值，当请求失败或接口返回的数据不可用时
   */
  defaultResponse?: any
  /** 扩展字段 */
  extension?: Record<string, any>
}

export default ({ dynamicRequest }: Params) => (apis: Apis) => {
  // 缓存，用来判断是否变更，变更后可重新请求
  let dynamicCache: Record<
    ElementId,
    Record<DynamicProps['field'], Omit<DynamicProps, 'field'>>
  > = {}

  apis.injectSchemaMiddleware(async (prevSchema, next) => {
    let schema: Schema = prevSchema

    // 先执行其它中间件，后面拿到 schema 来处理
    if (next) {
      schema = await next?.(schema)
    }

    // 没有动态请求函数，直接跳过
    if (typeof dynamicRequest !== 'function') return schema

    // 处理逻辑
    const elementsEntries = Object.entries(schema.elements)
    for (let i = 0; i < elementsEntries.length; i++) {
      const [elementId, element] = elementsEntries[i]
      const dynamicProps = element.props?.dynamicProps as DynamicProps

      // 没有指定字段，不用请求
      if (!dynamicProps || !dynamicProps.field || !dynamicProps.api) continue

      // 缓存
      const a = dynamicCache[elementId]
      const b = a?.[dynamicProps.field]
      const { api, params } = b || {}

      // 和原来相同，不用重复请求
      if (
        api === dynamicProps.api &&
        (
          (!params && !dynamicProps.params) ||
          (params === dynamicProps.params) ||
          (params && dynamicProps.params && isEqual(params, dynamicProps.params))
        )
      ) {
        continue
      }

      // 不同，请求
      const res = await dynamicRequest({
        api: dynamicProps.api,
        params: dynamicProps.params,
        method: dynamicProps.method,
        dynamicProps,
      }).catch(err => {
        return
      })

      // 缓存起来
      dynamicCache[elementId] = dynamicCache[elementId] || {}
      dynamicCache[elementId][dynamicProps.field] = {
        api: dynamicProps.api,
        params: dynamicProps.params,
        defaultResponse: dynamicProps.defaultResponse,
      }

      schema = setSchemaElementsProps(schema, {
        [elementId]: {
          [dynamicProps.field]: res || dynamicProps.defaultResponse
        },
      })
    }

    return schema
  })
}
