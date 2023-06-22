/**
 * formDataPlugin
 * @description 表单数据-插件
 * @author moting.nq
 * @create 2022-06-14 00:47
 */

import { MutableRefObject } from 'react'
import {
  findFormItems, setSchemaElementsProps, nextTick,
  tierToTileObj, tileToTierObj, setObjValueByTileFile,
} from '../helper'
import { Apis } from '../onion-engine/types'
import { FormInstance, FieldError } from '../hooks/use-form'
import { Schema, Elements } from '../common-types'

export type FormValues = Record<string, any>

export type OnValuesChange = (changedValues: Record<string, any>, allValues: Record<string, any>) => void

const formData = ({
  formValuesRef,
  formItemsRef,
  setFieldsValueRef,
  validateFieldsRef,
  initialFormValue,
  onValuesChange,
}: {
  formValuesRef: MutableRefObject<FormValues>;
  formItemsRef: MutableRefObject<Elements>;
  setFieldsValueRef: MutableRefObject<FormInstance['setFieldsValue']>;
  validateFieldsRef: MutableRefObject<FormInstance['validateFields']>;
  initialFormValue?: Record<string, any>;
  onValuesChange?: OnValuesChange;
}) => (apis: Apis) => {

  // 平铺的表单值，和表单字段保持对应，比如 {'a.b.c': 12, d: '示例'}
  let formValues: FormValues = {}
  const removeCallbacks: Array<() => void> = []
  let isInjectInitialFormValue = false
  let setFieldsValueQueue: FormValues[] = []

  // 进来时直接赋初始值
  formValuesRef.current = { ...(initialFormValue || {}) }

  // 写入 setFieldsValue 方法
  setFieldsValueRef.current = (_values) => {
    setFieldsValueQueue.push(_values)

    nextTick(async () => {
      if (!setFieldsValueQueue.length) return

      let schema = await apis.getSchema()

      if (!schema) return

      const queue = setFieldsValueQueue
      setFieldsValueQueue = []

      // 合并
      const values = queue.reduce((result, item) => ({ ...result, ...item }), {})

      const formElements = findFormItems(schema, 'key-value')

      // 遍历设置的 字段 和 值，有可能存在 平铺 的字段
      const formElementsEntries = Object.entries(formElements)
      Object.entries(values).forEach(([fieldName, value]) => {
        // 更新层级表单值
        formValuesRef.current = setObjValueByTileFile(
          formValuesRef.current,
          fieldName,
          value
        )
      })

      // 保存平铺的表单值
      formValues = tierToTileObj(
        formValuesRef.current,
        // @ts-ignore
        formElementsEntries.map(item => item[1].props.relatedModelField)
      )

      Object.entries(formValues).forEach(([fieldName, value]) => {
        // 找到对应字段的元素
        const target = formElementsEntries.find(
          // @ts-ignore
          item => item[1].props.relatedModelField === fieldName
        )

        if (!target) return

        // 设置值
        schema = setSchemaElementsProps(schema!, {
          [target[0]]: {
            value,
          },
        })
      })

      // 触发一轮更新
      apis.updateSchema(schema)
    })
  }

  // 写入 validateFields 方法
  validateFieldsRef.current = async (nameList) => {
    // TODO nameList 处理
    // TODO 需要校验插件？还是这里来校验？
    const errorFields: FieldError[] = []

    if (!Object.keys(formItemsRef.current).length) {
      return {
        values: {},
        errorFields,
      }
    }

    // 处理隐藏元素的字段（需要考虑多个表单共用一个字段的情况）
    const values = {}
    const temObj = {}
    let schema = await apis.getSchema()

    if (!schema) {
      return {
        values: {},
        errorFields,
      }
    }

    const formElements = findFormItems(schema, 'key-value')
    const formItems = Object.entries(formElements)
    formItems.forEach(([, formItem]) => {
      if (formItem?.hidden) {
        return
      }

      const relatedModelField = formItem?.props?.relatedModelField!
      temObj[relatedModelField] = 1
    })
    Object.keys(temObj).forEach(k => {
      if (k in formValues) {
        values[k] = formValues[k]
      }
    })

    // 校验必填项
    formItems.forEach((item) => {
      const [, formItem] = item || []
      const field = formItem?.props?.relatedModelField

      if (!formItem) return
      if (!field) return
      if (formItem.hidden) return
      if (formItem?.props?.formProps?.required !== true) return

      const v = values[field as string]
      // TODO 这个判断可能不正确
      if (v === undefined || v === null || v === '') {
        // 校验不通过
        errorFields.push({
          name: formItem.props.relatedModelField!,
          errors: [`【${formItem.props.formProps?.label || ''}】为必填项，请完成该项！`]
        })
      }
    })

    return {
      values: tileToTierObj(values, Object.keys(values)),
      errorFields,
    };
  }

  // 注册更新 schema 中间件
  apis.injectSchemaMiddleware(async (prevSchema, next) => {
    let schema: Schema = prevSchema

    // 先注入初始值
    if (isInjectInitialFormValue === false) {
      isInjectInitialFormValue = true

      const elementsEntries = Object.entries(schema.elements)

      // 层级对象 转 平铺对象
      formValues = tierToTileObj(
        formValuesRef.current,
        elementsEntries.map(([, element]) => element.props?.relatedModelField).filter(k => k) as any
      )

      // 根据 平铺对象 和 表单字段 注入值
      Object.entries(formValues).forEach(([field, value]) => {
        const target = elementsEntries.find(([, element]) => {
          return element.props?.relatedModelField === field
        })

        if (!target) return
        const [elementId] = target

        schema = setSchemaElementsProps(schema, {
          [elementId]: {
            value,
          },
        })
      })
    }

    // 先执行其它中间件，最后拿到 schema 来处理
    if (next) {
      schema = await next?.(schema)
    }

    // 先移除掉上一次的回调函数
    removeCallbacks.forEach(cb => cb())

    // 重新注入 onChange 事件
    const formElements = findFormItems(schema, 'key-value')
    formItemsRef.current = formElements
    Object.entries(formElements).forEach(([elementId, element]) => {
      // @ts-ignore
      const fieldName = element.props.relatedModelField!
      // 为表单元素绑定 onChange 事件
      const remove = apis.injectElementCallback(elementId, 'onChange', async (v: any) => {
        // 保存平铺的表单值
        formValues[fieldName] = v

        // 该字段路径下的值
        const tierFormValues = tileToTierObj(formValues, Object.keys(formValues))

        // 合并到表单值
        formValuesRef.current = tierFormValues

        // 触发更新 schema
        const innerSchema = await apis.getSchema()
        // 设置值
        const newSchema = setSchemaElementsProps(innerSchema!, {
          [elementId]: {
            value: v,
          },
        })

        // 触发一轮更新
        apis.updateSchema(newSchema)

        // 触发改变事件
        onValuesChange?.({ [fieldName]: v }, formValuesRef.current)
      })

      if (typeof remove === 'function') {
        removeCallbacks.push(remove)
      }
    })

    return schema
  })
}

export default formData
