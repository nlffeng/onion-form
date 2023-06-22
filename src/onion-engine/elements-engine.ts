/**
 * elements-engine
 * @description 元素引擎
 * @author moting.nq
 * @create 2022-06-08 11:28
 */

import { Elements, ElementId } from '../common-types'

export default class ElementsEngine {
  elements?: Elements
  elementsCallback: Record<ElementId, Record<string, Array<(...args: any[]) => void>>>

  constructor() {
    this.elementsCallback = {}
  }

  public injectElementCallback(
    elementId: string,
    name: string,
    callback: (...args: any[]) => void
  ): void | (() => void) {
    if (!elementId || !name || (typeof callback !== 'function')) return

    if (!this.elementsCallback[elementId]) {
      this.elementsCallback[elementId] = {}
    }
    if (!this.elementsCallback[elementId][name]) {
      this.elementsCallback[elementId][name] = []
    }

    this.elementsCallback[elementId][name].push(callback)

    return () => this.removeElementCallback(elementId, name, callback)
  }

  public removeElementCallback(
    elementId: string,
    name: string,
    callback: (...args: any[]) => void
  ): void {
    if (!elementId || !name || (typeof callback !== 'function')) return

    const index = this.elementsCallback[elementId]?.[name]?.findIndex(cb => cb === callback)

    if (index !== -1) {
      this.elementsCallback[elementId][name].splice(index, 1)
    }
  }

  private execCallbacks(elementId: string, name: string, ...args: any[]) {
    const callbacks = this.elementsCallback[elementId]?.[name]
    if (!callbacks) return
    callbacks.forEach(cb => {
      cb(...args)
    })
  }

  public updateElements(elements: Elements): void {
    const newElements = Object.entries(elements).reduce((result, current) => {
      const [elementId, element] = current

      const nameCallbacks = this.elementsCallback[elementId]

      if (!nameCallbacks || !Object.keys(nameCallbacks).length) {
        result[elementId] = element
        return result
      }

      // TODO 优化：考虑如何注入不变引用的函数，高阶函数？
      const propsCallbacks = Object.entries(nameCallbacks).reduce((result, [name]) => {
        result[name] = (...args: any[]) => {
          this.execCallbacks(elementId, name, ...args)
        }

        return result
      }, {})

      const { props } = element
      result[elementId] = {
        ...element,
        props: {
          ...props,
          ...propsCallbacks,
        },
      }
      return result
    }, {})
    this.elements = newElements
  }
}
