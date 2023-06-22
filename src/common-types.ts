import { Linkage, LinkageRule } from './helper/linkage'
import { DynamicProps } from './plugins/dynamic-data'
import { LinkageValueItem } from './plugins/linkage-value'
import { IProps as FormItemProps } from '../form-item'

export interface Schema {
  elements: Elements,
  layout: Layout,
}

export type Elements = Record<string, Element>

export interface Element {
  type: string,
  hidden?: boolean,
  /**
   * 是否在 详情态 模式下隐藏该元素
   * 注：为 true 时联动显隐规则无效
   */
  isHiddenInDetailMode?: boolean,
  props?: {
    formProps?: FormItemProps & {
      readOnly?: boolean
    }
    /** 联动显隐，是一个数组，多条表示多个联动 */
    linkageShowHide?: Linkage
    /**
     * 联动逻辑规则表达式
     * 当联动出现【多对一】时，这个规则就会很有用，若【多对一】时没有这个规则，默认规则为逻辑或
     * 表示应用到本元素上的显隐规则
     * 如 "(${input-dds33aa3} || ${radio-zza032dfe}) && ${checkbox-iese032fdsa}"
     */
    linkageShowHideRule?: LinkageRule
    /** 联动必填，是一个数组，多条表示多个联动 */
    linkageRequired?: Linkage
    /**
     * 联动逻辑规则表达式
     * 当联动出现【多对一】时，这个规则就会很有用，若【多对一】时没有这个规则，默认规则为逻辑或
     * 表示应用到本元素上的表达式规则
     * 如 "(${input-dds33aa3} || ${radio-zza032dfe}) && ${checkbox-iese032fdsa}"
     */
    linkageRequiredRule?: LinkageRule
    /** 联动值 */
    linkageValue?: LinkageValueItem[]
    /** 动态数据属性 */
    dynamicProps?: DynamicProps
    relatedModelField?: string
    [key: string]: any
  },
  // [key: string]: any
}

export interface Layout {
  root: string,
  structure: Structure,
}

export type Structure =
  | (string | Structure2)[]
  | Structure2

type Structure2 = { [elementId: ElementId]: (string | Structure2)[] | Structure2 }

export type ElementId = string

export type NamePath = string | number | (string | number)[]

export type ArrayItemType<T extends Array<any>> = T extends Array<infer R> ? R : any
