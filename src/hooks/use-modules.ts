import { ComponentType, useMemo } from 'react'
import { IProps } from '../types'
import { IProps as PureProps } from '../onion-pure-form/types'

type ComponentMap = Record<string, ComponentType<any>>;

export interface Params {
  modulesMap: IProps['modulesMap'],
  formModulesMap: IProps['formModulesMap'],
  customFormItemHoc: PureProps['formItemHoc']
}

export interface Return {
  [key: string]: ComponentType<any>
}

export default ({
  modulesMap = {},
  formModulesMap = {},
  customFormItemHoc,
}: Params): Return => {

  // TODO 优化判断 modulesMap 和 formModulesMap 中的组件元素是否变化

  const originModules: ComponentMap = useMemo(() => {
    return (
      Object.entries(modulesMap).reduce((result, [key, { default: Com }]) => {
        result[key] = Com
        return result
      }, {})
    )
  }, [modulesMap])

  const formModules: ComponentMap = useMemo(() => {
    return (
      Object.entries(formModulesMap).reduce((result, [key, { default: Com }]) => {
        result[key] = customFormItemHoc(Com, {})
        return result
      }, {})
    )
  }, [formModulesMap])

  return {
    ...originModules,
    ...formModules
  }
}
