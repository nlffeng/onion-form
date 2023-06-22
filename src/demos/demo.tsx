/**
 * title: FormItem 示例
 */

import React from 'react';
import { View } from '@tarojs/components'
import OnionForm, { useOnionForm } from 'white-onion-form'
// import './index.less';

const rootCls = 'm-comp-example-form-item'

export default () => {

  // 获取表单组件实例，实例中有相关方法
  const [form] = useOnionForm()

  return (
    <View className={rootCls}>
      <OnionForm
        form={form}
        initialFormValue={{
          field1: 'field1',
        }}
        schema={{
          "elements": {
            "pageContainer-1000": {
              "type": "pageContainer"
            },
            "input-1000": {
              "type": "input",
              "props": {
                "placeholder": "请输入",
                "formProps": {
                  "asteriskPosition": "front",
                  "label": "姓名",
                  "readOnly": false,
                  "required": true
                },
                // 联动设置
                "linkageShowHide": [
                  // 当输入值为 a 时，显示 input-1001 和 input-1002 元素
                  {
                    "targetElements": ["input-1001", "input-1002"],
                    "relatedValue": "a",
                  },
                ],
                "relatedModelField": "field1"
              }
            },
            "input-1001": {
              "type": "input",
              "props": {
                "placeholder": "请输入",
                "formProps": {
                  "asteriskPosition": "front",
                  "label": "姓名2",
                  "readOnly": false,
                  "required": true
                },
                // 联动设置
                "linkageShowHide": [
                  // 当输入值为 c 时，显示 input-1002 元素
                  {
                    "targetElements": ["input-1002"],
                    "relatedValue": "c",
                  }
                ],
                "relatedModelField": "field2"
              }
            },
            "input-1002": {
              "type": "input",
              "props": {
                "placeholder": "请输入",
                "formProps": {
                  "asteriskPosition": "front",
                  "label": "姓名3",
                  "readOnly": false,
                  "required": true
                },
                // 表示动态数据配置
                "dynamicProps": {
                  "field": "options",
                  "api": "/xxx/yyy",
                  "method": "GET",
                  "params": {
                    "a": [],
                    "b": 1,
                    "c": "3"
                  },
                  "defaultResponse": []
                },
                linkageValue: [
                  {
                    sourceElement: 'input-1001',
                    targetField: 'dynamicProps.params.a',
                  },
                ],
                // 该元素被2个元素联动显隐，需要制定规则，否则默认以 逻辑或 处理
                // 这表示使用 逻辑与 处理
                "linkageShowHideRule": "${input-1000} && ${input-1001}",
                "relatedModelField": "field3"
              }
            }
          },
          "layout": {
            "root": "pageContainer-1000",
            "structure": {
              "pageContainer-1000": [
                "input-1000",
                "input-1001",
                "input-1002"
              ]
            }
          }
        }}
        // modulesMap={}
        onSubmit={(values, errorFields) => {
          console.log(values, errorFields)

          // 内部校验 required 必填，不通过
          if (errorFields?.length) {
            // 弹窗提示校验问题
            // setToastInfo({
            //   title: errorFields[0].errors?.[0],
            //   visible: true,
            // })
            return
          }

          console.log(values, errorFields)
        }}
      />
    </View>
  );
};
