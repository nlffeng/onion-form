/**
 * btnEventPlugin
 * @description 按钮&事件 - 插件
 * @author moting.nq
 * @create 2022-06-15 00:33
 */

import { MutableRefObject } from 'react'
import { Apis } from '../onion-engine/types'
import { Schema } from '../common-types'

export interface Config {
  onEmitRef: MutableRefObject<((eventName: string, ...args: any[]) => void) | undefined>
  onSubmitRef: MutableRefObject<(() => void) | undefined>
  buttonTypeList?: string[]
}

const defaultEventButtonTypeList = [
  'eventButton',
  'submitButton',
  'resetButton',
];

export default ({ onEmitRef, onSubmitRef, buttonTypeList = [] }: Config) => (apis: Apis) => {
  const removeCallbacks: Array<() => void> = []

  const _btnTypeList = defaultEventButtonTypeList.concat(buttonTypeList)

  apis.injectSchemaMiddleware(async (prevSchema, next) => {
    let schema: Schema = prevSchema

    // 先执行其它中间件，后面拿到 schema 来处理
    if (next) {
      schema = await next?.(schema)
    }

    // 先移除掉上一次的回调函数
    removeCallbacks.forEach(cb => cb())

    const eventButtons = Object.entries(schema.elements).filter(
      ([, { type }]) => _btnTypeList.includes(type)
    )

    eventButtons.forEach(([elementId]) => {
      const remove = apis.injectElementCallback(elementId, 'onEmit', (eventName: string, ...args: any[]) => {
        if (eventName === '__onion-form-button-submit') {
          // 提交按钮
          onSubmitRef.current?.()
          return;
        }
        // if (eventName === '__onion-form-button-reset') {
        //   // 重置按钮
        //   resetFields(engine)();
        //   return;
        // }

        // 其他按钮直接抛出事件
        onEmitRef.current?.(eventName, ...args)
      })

      if (typeof remove === 'function') {
        removeCallbacks.push(remove)
      }
    })

    return schema
  })
}
