/**
 * onion-engine
 * @description 洋葱流引擎
 * @author moting.nq
 * @create 2022-06-08 11:29
 */

import Event from './event'
import ElementsEngine from './elements-engine'
import LayoutEngine from './layout-engine'
import { nextTick } from '../helper'
import { Plugins, MiddlewareCallback, Apis, Update } from './types'
import { Schema } from '../common-types'

export default class OnionEngine {
  // TODO 使用 Proxy 优化拦截这个的修改
  schema?: Schema
  event: Event<'onSchemaInput'>
  elementsEngine: ElementsEngine
  layoutEngine: LayoutEngine
  plugins: Plugins
  schemaMiddlewares: MiddlewareCallback[]
  updateQueue: Update | null
  /** 更新 schema 过程中  */
  updateSchemaPromise?: Promise<void>

  constructor({
    plugins,
  }: {
    plugins: Plugins,
  }) {
    this.event = new Event()
    this.elementsEngine = new ElementsEngine()
    this.layoutEngine = new LayoutEngine()
    this.plugins = plugins
    this.schemaMiddlewares = []
    this.updateQueue = null

    this.resolvePlugins()
  }

  private resolvePlugins() {
    const apis = this.initPluginApis()
    this.plugins.forEach(([key, plugin]) => {
      // TODO key 暂时还没什么用
      plugin(apis)
    })
  }

  private initPluginApis(): Apis {
    return {
      injectSchemaMiddleware: this.injectSchemaMiddleware.bind(this),
      injectElementCallback: this.elementsEngine.injectElementCallback.bind(this.elementsEngine),
      updateSchema: this.updateSchema.bind(this),
      getSchema: this.getSchema.bind(this)
    }
  }

  public updateSchema(schema: Schema): void {
    // 加入 更新队列 机制
    const update: Update = {
      action: schema,
      next: null,
    }

    const pending = this.updateQueue
    if (pending === null) {
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    this.updateQueue = update;

    // 非第一次调用，就直接返回
    if (pending) {
      return
    }

    // 用来定义更新 schema 是否更新完成
    let resolve
    this.updateSchemaPromise = new Promise((_resolve) => resolve = _resolve)

    nextTick(() => {
      if (!this.updateQueue) return

      const last = this.updateQueue
      this.updateQueue = null

      // TODO 先进行合并？还是直接使用最后一个 schema
      // 暂时用最后一个 schema
      const lastSchema = last.action

      // 处理 schema
      this.performSchemaMiddlewares(lastSchema).then(newSchema => {
        this.schema = newSchema
        this.elementsEngine.updateElements(newSchema.elements)
        this.layoutEngine.updateLayout(newSchema.layout)
        this.event.publish('onSchemaInput', newSchema)

        // 定义更新 schema 完成
        resolve?.()
        this.updateSchemaPromise?.then(() => {
          this.updateSchemaPromise = undefined
        })
      }).catch(err => {
        console.log(err)
      })
    })
  }

  /**
   * getSchema
   * 当获取 schema 时，可能正在更新 schema 即调用了 updateSchema
   * 这时应先等 updateSchema 更新结果之后再拿 schema
   */
  public async getSchema() {
    if (this.updateSchemaPromise) {
      // 等待更新 schema 完成
      await this.updateSchemaPromise
    }
    return this.schema
  }

  public register(
    eventName: 'onSchemaInput',
    callback: (schema: Schema) => void
  ): void {
    if (!eventName || (typeof callback !== 'function')) return
    this.event.subscribe(eventName, callback)
  }

  private injectSchemaMiddleware(callback: MiddlewareCallback) {
    this.schemaMiddlewares.push(callback)
  }

  private performSchemaMiddlewares(schema: Schema): Promise<Schema> {
    const dispatch = (i: number, _schema: Schema) => {
      const fn = this.schemaMiddlewares[i];

      if (!fn) return Promise.resolve(_schema)

      try {
        return Promise.resolve(fn(_schema, dispatch.bind(null, i + 1)))
      } catch (e) {
        return Promise.reject(e);
      }
    };

    return dispatch(0, schema)
  }

}
