/**
 * layout-engine
 * @description 布局引擎
 * @author moting.nq
 * @create 2022-06-08 11:31
 */

import { Layout } from '../common-types'
import type { LayoutStruct } from '../react-renderer/types'
import { ArrayItemType, Structure } from '../common-types'

export default class LayoutEngine {
  layout?: LayoutStruct

  public updateLayout(layout: Layout): void {
    const { root, structure } = layout
    const newLayout: LayoutStruct = []

    const v = resolveChidren(root, structure)
    if (Array.isArray(v)) {
      newLayout.push({
        el: root,
        children: v,
      })
    } else if (typeof v === 'object' && v !== null) {
      newLayout.push({
        el: root,
        slotChildren: v,
      })
    } else {
      newLayout.push(root)
    }

    this.layout = newLayout
  }
}

/** 解析布局结构，这里处理和 hyper-form 一致的布局结构模式 */
// TODO 后期可以通过插件来扩展布局结构解析
function resolveChidren(root: string, structure: Structure, deepLevel: number = 0): undefined | LayoutStruct | Record<string, LayoutStruct> {
  if (deepLevel >= 20) {
    console.warn('onion-form: schema 中 layout 字段可能存在循环嵌套，导致嵌套超过 20 层，请检查布局结构')
    return
  }

  const v = structure[root]
  if (!v) return

  if (Array.isArray(v)) {
    return v.map(elementId => {
      const child = resolveChidren(elementId, structure, deepLevel + 1)

      if (!child) return elementId
      if (Array.isArray(child)) {
        return {
          el: elementId,
          children: child,
        }
      }
      if (typeof child === 'object' && child !== null) {
        return {
          el: elementId,
          slotChildren: child,
        }
      }
      // 未知类型
      return elementId
    })
  }

  if (typeof v === 'object' && v !== null) {
    return Object.entries(v).reduce((result, [propName, propValue]) => {
      result[propName] = (propValue as string[]).map((elementId) => {
        const child = resolveChidren(elementId, structure, deepLevel + 1)

        if (!child) return elementId
        if (Array.isArray(child)) {
          return {
            el: elementId,
            children: child,
          }
        }
        if (typeof child === 'object' && child !== null) {
          return {
            el: elementId,
            slotChildren: child,
          }
        }
        // 未知类型
        return elementId
      })
      return result
    }, {})
  }

  return
}
