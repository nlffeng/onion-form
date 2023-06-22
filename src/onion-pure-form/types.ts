import { ComponentType, MemoExoticComponent } from 'react'
import { Plugins } from '../onion-engine/types'
import { FormInstance } from '../hooks/use-form'
import { Schema } from '../common-types'
import { setLinkageFn } from '../helper/linkage'
import { OnValuesChange } from '../plugins/form-data'
import { Mode } from '../plugins/detail-mode'

export interface IProps {
  /**
   * 模式
   * @edit 编辑模式
   * @detail 详情模式
   */
  mode?: Mode
  /** 表单初始值 */
  initialFormValue?: Record<string, any>
  /** 表单 schema */
  schema?: Schema
  /** 经 useForm() 创建的 form 控制实例，提供了一些操作方法 */
  form?: FormInstance
  /** 插件 */
  plugins?: Plugins
  /** 表单物料注册表 */
  formModulesMap: Record<string, {
    default: ComponentType<any> | MemoExoticComponent<any>
    [key: string]: any
  }>
  /** 非表单物料注册表 */
  modulesMap: Record<string, {
    default: ComponentType<any> | MemoExoticComponent<any>
    [key: string]: any
  }>
  /** 物料的 formItem 高阶组件、支持自定义 */
  formItemHoc: (component: ComponentType, options?: any) => ComponentType<any>
  /**
   * 联动显隐，自定义显隐逻辑
   * 计算源元素的值与关联值的显隐关系
   */
  setLinkageShowHideFn?: setLinkageFn
    /**
   * 联动必填，自定义必填逻辑
   * 计算源元素的值与关联值的显隐关系
   */
  setLinkageRequiredFn?: setLinkageFn
  /**
   * 字段值更新时触发回调事件
   * 注意：setFieldsValue 不会触发 onValuesChange，change 事件仅当用户交互才会触发
   */
  onValuesChange?: OnValuesChange
}
