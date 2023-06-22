/**
* formItemHoc
* @description 表单项包装器
* @author moting.nq
* @create 2021-08-05 16:31
*/

import React, { ComponentType } from 'react'
// import _FormItem, { IProps as FormItemProps, TextItem } from '../components/form-item'
import _FormItem, { IProps as FormItemProps } from '../../form-item'
import { FormInstance } from '../hooks/use-form'

interface WithFormItemProps {
  formProps?: FormItemProps & {
    disabled?: boolean
    readOnly?: boolean
  }
  relatedModelField?: string
  mode?: 'detail' | 'edit'
}

const TextItem = null

export default (
  FormItem: any,
  DefaultTextItem: any = TextItem,
  formContext?: FormInstance
) => {
  FormItem = FormItem || _FormItem;

  return function formItemHoc(
    Component: any,
    hocFormProps?: Partial<FormItemProps>
  ) {
    return function FormItemWrapper({
      formProps,
      relatedModelField,
      ...others
    }: WithFormItemProps): any {
      const { mode = 'edit', ...formItemProps } = {
        ...{
          ...formProps,
          ...hocFormProps,
          relatedModelField,
          schemaId: others['data-schema-id'],
        },
      }

      // 表单项组件，如果是详情态，则展示为详情组件
      let Com = Component
      // @ts-ignore
      if (mode === 'detail') {
        Com = Component.Detail || DefaultTextItem
      }

      return (
        <FormItem {...formItemProps} formContext={formContext}>
          <Com
            {...others}
            formContext={formContext}
            required={formProps?.required}
            disabled={formProps?.disabled || formProps?.readOnly}
            readOnly={formProps?.disabled || formProps?.readOnly}
          />
        </FormItem>
      )
    }
  }
}
