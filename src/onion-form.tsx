/**
 * OnionForm
 * @description 洋葱流表单
 * @author moting.nq
 * @create 2022-06-13 19:18
 */

import React, { FC, useState, useMemo, useRef, useEffect } from 'react'

import * as pageContainerMaterial from './components/page-container/export-material'
import * as submitButtonMaterial from './components/submit-button/export-material'

import Input from '../input'
import RadioGroup from '../radio-group'
import Textarea from '../text-area'

import OnionPureForm from './onion-pure-form'
import useCallbackRef from './hooks/use-callback-ref'
import { FormInstance } from './hooks/use-form'
import dynamicDataPlugin from './plugins/dynamic-data'
import btnEventPlugin from './plugins/btn-event'
import linkageValuePlugin from './plugins/linkage-value'
import innerFormItemHoc from './hoc/form-item-hoc'
import { IProps } from './types'

export type { IProps }

const formModules = {
  input: { default: Input },
  radioGroup: { default: RadioGroup },
  textarea: { default: Textarea },
}

const OnionForm: FC<IProps> = ({
  initialFormValue,
  schema,
  mode,
  form,
  plugins: propsPlugins = [],
  formModulesMap,
  modulesMap,
  buttonTypeList,
  onEmit,
  onSubmit,
  dynamicRequest,
  setLinkageShowHideFn,
  onValuesChange,
}) => {

  const { formItem, ...otherFormModulesMap } = formModulesMap || {}

  const formRef = useRef<FormInstance>({} as FormInstance)
  if (form) {
    formRef.current = form
  }

  const onEmitRef = useCallbackRef(onEmit)
  const onSubmitRef = useCallbackRef(async () => {
    const { values, errorFields } = await formRef.current?.validateFields()

    onSubmit?.(values || {}, errorFields)
  })

  const plugins = useMemo(() => {
    const innerPlugins: IProps['plugins'] = [
      [
        'dynamicData',
        dynamicDataPlugin({
          dynamicRequest,
        }),
      ],
      [
        'btnEventPlugin',
        btnEventPlugin({
          onSubmitRef,
          onEmitRef,
          buttonTypeList,
        }),
      ],
      [
        'linkageValue',
        linkageValuePlugin,
      ],
    ]

    const outerPlugins = propsPlugins.filter(([pluginName, cb]) => {
      const t = innerPlugins.find(item => item[0] === pluginName)
      if (t) {
        t[1] = cb
        return false
      }
      return true
    })

    const ret: IProps['plugins'] = [
      ...innerPlugins,
      ...outerPlugins,
    ]

    return ret
  }, [])

  return (
    <OnionPureForm
      initialFormValue={initialFormValue}
      form={formRef.current}
      formModulesMap={{
        ...formModules,
        ...otherFormModulesMap,
      }}
      modulesMap={{
        pageContainer: pageContainerMaterial,
        submitButton: submitButtonMaterial,
        ...modulesMap,
      }}
      plugins={plugins}
      schema={schema}
      mode={mode}
      formItemHoc={innerFormItemHoc(formItem?.default, null, formRef.current)}
      setLinkageShowHideFn={setLinkageShowHideFn}
      onValuesChange={onValuesChange}
    />
  )
}

OnionForm.defaultProps = {}

export default OnionForm
