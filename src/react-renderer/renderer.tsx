/**
 * Renderer
 * @description 渲染器
 * @author moting.nq
 * @create 2022-06-08 19:00
 */

import React, { FC, useMemo } from 'react'
import { View } from '@tarojs/components'
import { IProps } from './types'

const Renderer: FC<IProps> = ({
  components,
  elements,
  layout,
}) => {
  const nodes = useMemo(() => {
    const renderChildren = (node?: IProps['layout']) => {
      return node?.map(item => {
        if (typeof item === 'string') {
          const element = elements[item]
          const hidden = element?.hidden
          const Component: any = components[element?.type]

          if (!Component) return (
            <View key={item} style={{ padding: '20rpx', background: '#eee' }}>
              {`元素 '${item}' 对应的组件未注册到引擎中`}
            </View>
          )
          if (hidden) return null

          return (
            <Component
              key={item}
              {...element.props}
            />
          )
        }

        if (typeof item === 'object' && item !== null) {
          const element = elements[item.el]
          const hidden = element?.hidden
          const Component: any = components[element?.type]

          if (!Component) return (
            <View key={item.el} style={{ padding: '20rpx', background: '#eee' }}>
              {`元素 '${item.el}' 对应的组件未注册到引擎中`}
            </View>
          )
          if (hidden) return null

          const slot = Object.entries(item.slotChildren || {}).reduce((result, [propName, children]) => {
            if (!children?.length) return result
            result[propName] = renderChildren(children)
            return result
          }, {})

          return (
            <Component
              key={item.el}
              {...element.props}
              {...slot}
            >{renderChildren(item.children)}</Component>
          )
        }

        // 不符合的结构类型
        return null
      })
    }

    return renderChildren(layout)
  }, [layout, elements])

  return (
    <React.Fragment>
      {nodes}
    </React.Fragment>
  )
}

export default Renderer
