import { ComponentType, MemoExoticComponent } from 'react'
import { IProps as PureFormProps } from './onion-pure-form'
import { FieldError } from './hooks/use-form'
import { Params as DynamicDataPluginProps } from './plugins/dynamic-data'

export interface IProps extends Omit<
  PureFormProps, 'formItemHoc' | 'formModulesMap' | 'modulesMap'
> {
  /** 表单物料注册表 */
  formModulesMap?: Record<string, {
    default: ComponentType | MemoExoticComponent<any>
    [key: string]: any
  }>
  /** 非表单物料注册表 */
  modulesMap?: Record<string, {
    default: ComponentType | MemoExoticComponent<any>
    [key: string]: any
  }>
  /**
   * 指定元素作为按钮
   * 该元素触发 onEmit 事件将被 onion-form 作为 onEmit 事件透出
   */
  buttonTypeList?: string[]
  /** 物料的 formItem 高阶组件、支持自定义 */
  // formItemHoc: (component: ComponentType, options?: any) => ComponentType<any>
  /**
   * 事件回调，目前仅“事件按钮”组件点击后可以触发本回调，并传入 eventName
   */
  onEmit?: (eventName: string, ...args: any[]) => void
  /**
   * 提交事件回调，需 schema 中有 type: 'submitButton' 的元素
   */
  onSubmit?: (formValue: Record<string, any>, errorFields?: FieldError[]) => void
  dynamicRequest?: DynamicDataPluginProps['dynamicRequest']
}
