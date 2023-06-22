/**
 * linkageRequired
 * @description 表单联动必填-插件
 * @author moting.nq
 * @create 2022-08-02 14:28
 */

import { MutableRefObject } from 'react'
import { setSchemaAttr, linkage } from '../helper'
import { Apis } from '../onion-engine/types'
import { setLinkageFn } from '../helper/linkage'

export interface Options {
  setLinkageRequiredFnRef: MutableRefObject<setLinkageFn | undefined>
}

export default ({
  setLinkageRequiredFnRef,
}: Options) => (apis: Apis) => {
  apis.injectSchemaMiddleware(async (prevSchema, next) => {
    let schema = prevSchema

    // 先执行其它中间件，最后拿到 schema 来处理
    if (next) {
      schema = await next?.(schema)
    }

    const booleanEles = linkage({
      schema,
      linkageField: 'linkageRequired',
      linkageRuleField: 'linkageRequiredRule',
      // @ts-ignore
      setLinkageFn: setLinkageRequiredFnRef?.current ? (...args) => setLinkageRequiredFnRef.current?.(...args) : undefined,
    })

    booleanEles.truth.forEach(elementId => {
      schema = setSchemaAttr({
        type: 'cover',
        schema,
        keyPath: ['elements', elementId, 'props', 'formProps', 'required'],
        value: true,
      })
    })
    booleanEles.falsity.forEach(elementId => {
      schema = setSchemaAttr({
        type: 'cover',
        schema,
        keyPath: ['elements', elementId, 'props', 'formProps', 'required'],
        value: false,
      })
    })

    return schema
  })
}
