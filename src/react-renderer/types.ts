import { ComponentType } from 'react'
import { Elements } from '../common-types'

export type LayoutStruct = Array<string | {
  el: string,
  children?: LayoutStruct,
  slotChildren?: Record<string, LayoutStruct>
}>

export interface IProps {
  /** 组件注入 */
  components: Components
  /** 元素集 */
  elements: Elements
  /** 布局结构 */
  layout: LayoutStruct
}

export type Components = {
  [type: string]: ComponentType<any>
}
