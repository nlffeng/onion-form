/**
 * PageContainer
 * @description 页面容器
 * @author moting.nq
 * @create 2021-08-06 11:42
 */

import React, { FC } from 'react'
import { View } from '@tarojs/components'
import { IProps } from './types'
import './index.less'

export type { IProps }

const rootCls = 'm-hyper-page-container'

const PageContainer: FC<IProps> = ({ children }) => {
  return (
    <View className={rootCls}>
      {children || null}
    </View>
  )
}

PageContainer.defaultProps = {}

export default PageContainer
