import { useMemo } from 'react'
import { NamePath } from '../common-types'

export type FieldError = {
  name: NamePath
  errors: string[]
}

export interface FormInstance {
  /** 触发表单验证 */
  validateFields: (nameList?: NamePath[]) => Promise<{
    values: Record<string, any>
    errorFields?: FieldError[]
  }>
  // 设置表单的值，注意：这里是增量更新
  setFieldsValue: (values: Record<string, any>) => void
  // getFieldsValue(): Values
  // resetFields: (fields?: NamePath[]) => void
  // getFormItems: () => Array<[ElementId, string | Record<string, string>, Element]>
  // getSchema: () => Schema
}

function getErrorMessage(functionName: string) {
  return `[${functionName}]: 请在 form instance 初始化之后再执行本方法。`
}

export default () => {
  const form: FormInstance = useMemo(() => {
    return [
      'validateFields',
      'setFieldsValue',
      // 'resetFields',
      // 'getFieldsValue',
    ].reduce<FormInstance>((result, api) => {
      result[api] = () => {
        throw new Error(getErrorMessage(api));
      }
      return result
    }, {} as FormInstance)
  }, [])

  return [form]
}
