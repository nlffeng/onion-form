/**
 * SubmitButton
 * @description 提交按钮
 * @author moting.nq
 * @create 2021-08-06 11:42
 */

import React, { FC } from 'react'
import { View, Button } from '@tarojs/components'
import { CustomFooter } from 'white-m-components'
import { IProps } from './types'
import './index.less'

export type { IProps }

const rootCls = 'mobile-design-onion-form-submit-button'

const SubmitButton: FC<IProps> = ({ text, type, onEmit }) => {
  return (
    <View className={rootCls}>
      <View className={`${rootCls}__btn-wrap`}>
        <Button
          type={type}
          block
          onClick={() => onEmit('__onion-form-button-submit')}
        >{text}</Button>
      </View>
    </View>
  )
}

SubmitButton.defaultProps = {}

export default SubmitButton
