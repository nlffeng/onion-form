/**
 * FormItem
 * @description 表单项组件
 * @author moting.nq
 * @create 2021-08-05 16:50
 */

import React, { FC } from 'react'
import cls from 'classnames'
import { View, Text } from '@tarojs/components'
import { IProps } from './types'
import './index.less'

export type { IProps }

const rootCls = 'm-onion-form-item'
const rootContCls = `${rootCls}-cont`

const FormItem: FC<IProps> = (props) => {

  let {
    className, children, label, required, hideLabel,
    info = {}, asteriskPosition, labelBlock, error,
  } = props
  const { help, desc, tips } = info
  hideLabel = hideLabel === true || !label

  return (
    <View className={cls([rootCls, className])}>
      <View className={cls([rootContCls, labelBlock ? 'labelBlock' : ''])}>
        {!hideLabel ? (
          <View className={cls(`${rootContCls}-label`)}>
            {asteriskPosition === 'front' && required && !hideLabel ? (
              <Text className={`${rootContCls}-label-required`}>*</Text>
            ) : null}
            {!hideLabel ? (
              <Text>{label || null}</Text>
            ) : null}
            {asteriskPosition === 'back' && required && !hideLabel ? (
              <Text className={`${rootContCls}-label-required`}>*</Text>
            ) : null}
            {help && !hideLabel ? (
              <Text className={`${rootContCls}-label-help`}>（{help}）</Text>
            ) : null}
          </View>
        ) : null}

        {(labelBlock && tips) ? (
          <View className={`${rootContCls}-tips`}>{tips}</View>
        ) : null}

        {children ? (
          <View
            className={cls(
              `${rootContCls}-children`,
              { 'w-100': labelBlock },
              { 'm-t-8': labelBlock }
            )}
          >{children}</View>
        ) : null}

        {(labelBlock && desc) ? (
          <View className={cls(`${rootContCls}-desc`)}>{desc}</View>
        ) : null}
      </View>

      {error ? (Array.isArray(error) ? error : [error]).map((err, index) => {
        return (
          <View
            className={`${rootCls}-error`}
            key={String(index)}
          >
            {err}
          </View>
        );
      }) : null}
    </View>
  )
}

FormItem.defaultProps = {}

export default FormItem

export function TextItem({ value = '-', options, ...others }: any) {
  const textValue = Array.isArray(value)
    ? value.map(getValue).join(', ')
    : getValue(value)

  function getValue(val: any) {
    if (options) {
      return options.find((_: any) => _.value === val)?.label || val || '-'
    }
    return val
  }

  return (
    <Text {...others}>
      {typeof textValue === 'object' ? JSON.stringify(textValue) : textValue}
    </Text>
  )
}
