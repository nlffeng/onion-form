/**
 * linkageShowHide
 * @description 表单联动显隐-插件
 * @author moting.nq
 * @create 2022-06-15 19:10
 */

import { MutableRefObject } from 'react'
import { setSchemaAttr, linkage } from '../helper'
import { setLinkageFn } from '../helper/linkage'
import { Apis } from '../onion-engine/types'

export interface Options {
  setLinkageShowHideFnRef: MutableRefObject<setLinkageFn | undefined>
}

const linkageShowHide = ({
  setLinkageShowHideFnRef,
}: Options) => (apis: Apis) => {
  apis.injectSchemaMiddleware(async (prevSchema, next) => {
    let schema = prevSchema

    // 先执行其它中间件，最后拿到 schema 来处理
    if (next) {
      schema = await next?.(schema)
    }

    const booleanEles = linkage({
      schema,
      linkageField: 'linkageShowHide',
      linkageRuleField: 'linkageShowHideRule',
      // @ts-ignore
      setLinkageFn: setLinkageShowHideFnRef?.current ? (...args) => setLinkageShowHideFnRef.current?.(...args) : undefined,
    })

    booleanEles.truth.forEach(elementId => {
      schema = setSchemaAttr({
        type: 'cover',
        schema,
        keyPath: ['elements', elementId, 'hidden'],
        value: false,
      })
    })
    booleanEles.falsity.forEach(elementId => {
      schema = setSchemaAttr({
        type: 'cover',
        schema,
        keyPath: ['elements', elementId, 'hidden'],
        value: true,
      })
    })

    return schema
  })
}

export default linkageShowHide
