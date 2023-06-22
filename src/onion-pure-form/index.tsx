/**
 * OnionPureForm
 * @description 纯净 表单
 * @author moting.nq
 * @create 2022-06-13 19:18
 */

import React, { FC, useState, useMemo, useRef, useEffect } from 'react'
import { useFirstMountState } from 'white-react-use'
import BaseRenderer from '../base-renderer'
import useCallbackRef from '../hooks/use-callback-ref'
import useModules from '../hooks/use-modules'
import { FormInstance } from '../hooks/use-form'
import formDataPlugin, { FormValues } from '../plugins/form-data'
import linkageShowHidePlugin from '../plugins/linkage-show-hide'
import linkageRequiredPlugin from '../plugins/linkage-required'
import detailModePlugin, { Mode } from '../plugins/detail-mode'
import { Schema } from '../common-types'
import { IProps } from './types'

export type { IProps }

const OnionPureForm: FC<IProps> = ({
  mode = 'edit',
  initialFormValue,
  schema,
  form,
  plugins: propsPlugins = [],
  formModulesMap,
  modulesMap,
  formItemHoc: customFormItemHoc,
  setLinkageShowHideFn,
  setLinkageRequiredFn,
  onValuesChange,
}) => {
  const isFirstMount = useFirstMountState()

  // 表单值
  const formValuesRef = useRef<FormValues>({})
  // 表单元素
  const formItemsRef = useRef<Schema['elements']>({})
  // 设置表单值函数
  const setFieldsValueRef = useRef<FormInstance['setFieldsValue']>(() => { })
  // 验证表单字段值
  const validateFieldsRef = useRef<FormInstance['validateFields']>()
  const setLinkageShowHideFnRef = useCallbackRef(setLinkageShowHideFn)
  const setLinkageRequiredFnRef = useCallbackRef(setLinkageRequiredFn)
  const onValuesChangeRef = useCallbackRef(onValuesChange)
  const updateSchemaByModeRef = useRef<(mode: Mode) => Promise<void>>()

  const formInstance = useMemo<FormInstance>(() => ({
    validateFields() {
      return Promise.resolve(validateFieldsRef.current?.() as any)
    },
    setFieldsValue(values) {
      setFieldsValueRef.current(values)
    },
  }), [])

  const components = useModules({
    modulesMap,
    formModulesMap,
    customFormItemHoc,
  })

  const plugins = useMemo(() => {
    const innerPlugins: IProps['plugins'] = [
      [
        'detailModePlugin',
        detailModePlugin({
          mode,
          onGetUpdateSchemaByMode: callback => updateSchemaByModeRef.current = callback,
        }),
      ],
      [
        'formDataPlugin',
        formDataPlugin({
          formValuesRef,
          formItemsRef,
          setFieldsValueRef,
          validateFieldsRef: validateFieldsRef as any,
          initialFormValue,
          onValuesChange: (...args) => onValuesChangeRef.current?.(...args),
        }),
      ],
      [
        'linkageShowHide',
        linkageShowHidePlugin({
          setLinkageShowHideFnRef,
        }),
      ],
      [
        'linkageRequired',
        linkageRequiredPlugin({
          setLinkageRequiredFnRef,
        }),
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

  useEffect(() => {
    if (form) {
      Object.assign(form, formInstance);
    }
  }, [])

  // mode变化更新schema，触发更新
  useEffect(() => {
    if (isFirstMount) return
    updateSchemaByModeRef.current?.(mode)
  }, [mode])

  return schema ? (
    <BaseRenderer
      components={components}
      plugins={plugins}
      schema={schema}
    />
  ) : null
}

OnionPureForm.defaultProps = {}

export default OnionPureForm
