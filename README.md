# OnionForm schema表单

> OnionForm 移动端 Schema 表单

<code src="./demos/demo.tsx"></code>

## 注意事项

- 通过 useOnionForm() 获取的 form 实例目前有 validateFields 和 setFieldsValue 方法提供，validateFields 内部只校验了 required 必填
- onSubmit 事件回调，内部没有做 toast 提示，该方法返回了 表单值 和 校验字段信息，需自行判断校验是否通过，参考下面示例
- 其它 props 请先看 props 类型声明（导出的 OnionFormProps 字段）
- 动态数据插件已支持，可以满足一些动态变化的数据，比如下拉列表数据是动态变化的

## Demo

### 基本用法

```tsx
/**
 * Home
 * @description 示例页面
 */

import React, { FC, useState, useMemo, useRef, useEffect } from 'react'
import { View, Toast } from '@tarojs/components'
import OnionForm, { useOnionForm } from 'white-onion-form'
import * as titleMaterial from '@/components/title/export-material'
import { IProps } from './types'
import { schema1 } from './mock'
import styles from './index.module.less'

export type { IProps }

const Home: FC<IProps> = (props) => {

  // 获取表单组件实例，实例中有相关方法
  const [form] = useOnionForm()

  const [toastInfo, setToastInfo] = useState<{
    visible: boolean;
    title: string;
  }>()

  return (
    <View className={styles['container']}>
      <OnionForm
        form={form}
        initialFormValue={{
          q1: '11',
          q4: 'GB/T2261.1.9',
        }}
        schema={schema1}
        modulesMap={{
          title: titleMaterial,
        }}
        onSubmit={(values, errorFields) => {
          // 内部校验 required 必填，不通过
          if (errorFields?.length) {
            setToastInfo({
              title: errorFields[0].errors?.[0],
              visible: true,
            })
            return
          }
        }}
        // 动态数据请求方法，这里写请求逻辑，参数是 接口、接口参数，需要返回 Promise
        dynamicRequest={({ api, params, method, dynamicProps }) => {
          // 根据 api 判断是哪个接口

          // 请求方法
          return new Promise(resolve => {
            setTimeout(() => {
              resolve([
                {
                  "label": "男1",
                  "value": "GB/T2261.1.1"
                },
                {
                  "label": "女1",
                  "value": "GB/T2261.1.2"
                },
                {
                  "label": "不详1",
                  "value": "GB/T2261.1.9"
                },
                {
                  "label": "未知1",
                  "value": "GB/T2261.1.0"
                }
              ])
            }, 2000)
          })
        }}
      />

      <Toast
        title={toastInfo?.title}
        visible={!!toastInfo?.visible}
        onClose={() => {
          setToastInfo(undefined);
        }}
      />
    </View>
  )
}

Home.defaultProps = {}

export default Home
```

### 详情态模式

```tsx
/**
 * Home
 * @description 示例页面
 */

import OnionForm, { useOnionForm } from 'white-onion-form'

const Home: FC<IProps> = (props) => {
  return (
    <View>
      <OnionForm
        // 详情态
        mode='detail'
        schema={{
          "elements": {
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
                "relatedModelField": "field1"
              }
            },
            "btn-1000": {
              "type": "button",
              // 在详情态时隐藏该元素
              "isHiddenInDetailMode": true,
            }
          },
          "layout": {
            "root": "pageContainer-1000",
            "structure": {
              "pageContainer-608277b5": [
                "input-1000",
                "btn-1000"
              ]
            }
          }
        }}
      />
    </View>
  )
}

Home.defaultProps = {}

export default Home
```

### 联动显隐

联动显隐通常只需要 schema 配置即可

```JSON
{
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
          // 当输入值为 a 时，显示 input-1001 元素
          {
            "targetElements": ["input-1001"],
            "relatedValue": "a",
          },
          // 当输入值为 b 时，显示 input-1002 元素
          {
            "targetElements": ["input-1002"],
            "relatedValue": "b",
          }
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
      "pageContainer-608277b5": [
        "input-1000",
        "input-1001",
        "input-1002"
      ]
    }
  }
}
```

#### 自定义显隐逻辑

onion-form 对于联动显隐复杂联动逻辑透出了自定义方法，供开发者自定义处理

```typescript
const Home: FC<IProps> = (props) => {
  return (
    <View className={styles['container']}>
      <OnionForm
        // 其它属性
        // ...
        setLinkageShowHideFn={({ relatedElement, value, relatedValue }) => {
          // 该元素不需要自定义逻辑，直接跳过，使用内部判断逻辑
          if (relatedElement.type !== 'xxx') {
            return 'skip'
          }
          
          // 这里是自定义逻辑
          // 使用 value 和 relatedValue 来计算
          // 返回 true 表示显示联动的元素，否则隐藏
          return true
        }}
      />
    </View>
  )
}

Home.defaultProps = {}

export default Home
```

### 联动必填

联动必填通常只需要 schema 配置即可

```JSON
{
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
        // 联动必填设置
        "linkageRequired": [
          // 当输入值为 a 时，必填 input-1001 元素
          {
            "targetElements": ["input-1001"],
            "relatedValue": "a",
          },
          // 当输入值为 b 时，必填 input-1002 元素
          {
            "targetElements": ["input-1002"],
            "relatedValue": "b",
          }
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
        // 联动必填设置
        "linkageShowHide": [
          // 当输入值为 c 时，必填 input-1002 元素
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
        // 该元素被2个元素联动，需要制定规则，否则默认以 逻辑或 处理
        // 这表示使用 逻辑与 处理
        "linkageRequiredRule": "${input-1000} && ${input-1001}",
        "relatedModelField": "field3"
      }
    }
  },
  "layout": {
    "root": "pageContainer-1000",
    "structure": {
      "pageContainer-608277b5": [
        "input-1000",
        "input-1001",
        "input-1002"
      ]
    }
  }
}
```

### 动态数据

schema 相关属性

```JSON
{
  "elements": {
    // 其它元素...
    // ...
    "picker-1000000": {
      "type": "picker",
      "props": {
        "placeholder": "请选择",
        "options": [],
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
        "formProps": {
          "asteriskPosition": "front",
          "label": "性别4",
          "readOnly": false,
          "required": true,
          "labelBlock": true,
          "hideColon": true
        },
        "relatedModelField": "q4"
      }
    },
  },
  "layout": {
    // ...
  }
}
```

schema 中 dynamicProps 字段类型声明
> 注：有时请求参数(params)可能是其它表单项的值，此时需要使用联动值来设置，请参考以下【联动值】

```typescript
 export interface DynamicProps {
   /**
    * 动态请求数据后给到的字段
    * 限于 props 内属性，除了 value 属性
    * 比如动态请求下拉数据，指定 options 字段
    */
   field: string;
   /** 指定接口 */
   api: string;
   /** 请求方式 */
   method?: 'POST' | 'GET';
   /** 请求参数 */
   params?: Record<string, any>;
   /**
    * 默认值，当请求失败或接口返回的数据不可用时
    */
   defaultResponse?: any;
   /** 扩展字段 */
   extension?: Record<string, any>;
 }
```

入口代码需要添加 dynamicRequest 请求方法

```typescript
const Home: FC<IProps> = (props) => {
  return (
    <View className={styles['container']}>
      <OnionForm
        // 其它属性
        // ...
        // 动态数据请求方法，这里写请求逻辑，参数是 接口、接口参数，需要返回 Promise，如果请求很多，最好前置加 loading
        dynamicRequest={({ api, params, method, dynamicProps }) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve([
                {
                  "label": "男1",
                  "value": "GB/T2261.1.1"
                },
                {
                  "label": "女1",
                  "value": "GB/T2261.1.2"
                },
                {
                  "label": "不详1",
                  "value": "GB/T2261.1.9"
                },
                {
                  "label": "未知1",
                  "value": "GB/T2261.1.0"
                }
              ])
            }, 2000)
          })
        }}
      />
    </View>
  )
}

Home.defaultProps = {}

export default Home
```

### 联动值

schema 相关属性

```JSON
{
  "elements": {
    // 其它元素...
    // ...
    "picker-1000000": {
      "type": "picker",
      "props": {
        "placeholder": "请选择",
        "options": [],
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
        // 联动值
        "linkageValue": [
          {
            // 源元素id，即根据源元素的值(value 字段)联动，该值记为(sourceValue)
            "sourceElement": "input-1001",
            // 当前元素(picker-1000000)下 props 中 dynamicProps.params.a 字段的值为 sourceValue
            "targetField": "dynamicProps.params.a",
          },
          {
            // 源元素id，即根据源元素的值(value 字段)联动，该值记为(sourceValue)
            "sourceElement": "input-1002",
            // 当前元素(picker-1000000)下 props 中 dynamicProps.params.b 字段的值为 sourceValue
            "targetField": "dynamicProps.params.b",
          }
        ],
        "formProps": {
          "asteriskPosition": "front",
          "label": "性别4",
          "readOnly": false,
          "required": true,
          "labelBlock": true,
          "hideColon": true
        },
        "relatedModelField": "q4"
      }
    },
  },
  "layout": {
    // ...
  }
}
```

## API

### schema 规范

schema 是一个 JSON 对象，是用来渲染具体的表单的 JSON 描述结构

主要由 2 个部分组成：组件集合（elements）和布局（layout）

schema 示例：

```JSON
{
  "elements": {
    "pageContainer-608277b5": {
      "type": "pageContainer"
    },
    "title-4aed86d0": {
      "type": "title",
      "props": {
        "backgroundType": "secondary",
        "text": "一、信息",
        "textAlign": "left"
      }
    },
    "input-8693a7ed": {
      "type": "input",
      "props": {
        "placeholder": "请输入",
        "formProps": {
          "asteriskPosition": "front",
          "label": "姓名",
          "readOnly": false,
          "required": true,
          "labelBlock": true,
          "hideColon": true
        },
        "linkageShowHide": [
          {
            "targetElements": ["picker-0791d8c1"],
            "relatedValue": "a",
          },
        ],
        "relatedModelField": "patientName"
      }
    },
    "picker-0791d8c1": {
      "type": "picker",
      "props": {
        "placeholder": "请选择",
        "options": [
          {
            "label": "男",
            "value": "GB/T2261.1.1"
          },
          {
            "label": "女",
            "value": "GB/T2261.1.2"
          },
          {
            "label": "不详",
            "value": "GB/T2261.1.9"
          },
          {
            "label": "未知",
            "value": "GB/T2261.1.0"
          }
        ],
        "formProps": {
          "asteriskPosition": "front",
          "label": "性别",
          "readOnly": false,
          "required": true,
          "labelBlock": true,
          "hideColon": true
        },
        "relatedModelField": "genderCode"
      }
    }
  },
  "layout": {
    "root": "pageContainer-608277b5",
    "structure": {
      "pageContainer-608277b5": [
        "title-4aed86d0",
        "input-8693a7ed",
        "picker-0791d8c1"
      ]
    }
  }
}
```

#### 组件集合（elements）

elements 字段是一个对象，对象内表示所有组件元素；
elements 对象的每个 键名key 是一个随机值，只要保证在对象中是唯一的即可；
elements 对象的每个 键值value 是一个对象（记为 b），b 对象属性描述如下：

| 属性 | 必填 | 说明 | 类型 |
| - | - | - | - |
| type | 是 | 指定 OnionForm 内渲染已注册的组件，值为注册组件时的 key | string |
| hidden | 否 | 隐藏该元素 | boolean |
| isHiddenInDetailMode | 否 | 是否在 详情态 模式下隐藏该元素，为 true 时联动显隐规则无效 | boolean |
| props | 否 | 传递给组件的属性集，具体的值看 type 指定的组件需要的 props，但有几个属性是不会传递给组件的，如下表格：element-other-props | object |

##### element-other-props

| 属性 | 必填 | 说明 | 类型 |
| - | - | - | - |
| relatedModelField | 否 | 表示该元素是个表单项，同时表示该表单对应的字段;<br/>同时内部会对表单组件进行包装，用来展示每个表单的标题、必填标识等等，记为 form-item 组件 | string |
| formProps | 否 | relatedModelField 有值时则表示传递给 form-item 组件的属性，属性如下表格：formProps；<br />否则会直接传递给组件元素 | object |
| linkageShowHide | 否 | 联动显隐，是一个数组，多条表示多个联动，LinkageShowHide 属性如下表格 | Array\<LinkageShowHide\> |
| linkageShowHideRule | 否 | 联动显隐的规则，当联动出现【多对一】时，这个规则就会很有用，若【多对一】时没有这个规则，默认规则为逻辑或。<br/><br/>联动显隐时的逻辑表达式，比如 (\$\{input-dds33aa3\} \|\| \$\{radio-zza032dfe\}) && \$\{checkbox-iese032fdsa\}，使用多个元素 key 来制定规则。 | string |
| linkageRequired | 否 | 联动必填，是一个数组，多条表示多个联动，LinkageRequired 属性如下表格 | Array\<LinkageRequired\> |
| linkageRequiredRule | 否 | 联动必填的规则，当联动出现【多对一】时，这个规则就会很有用，若【多对一】时没有这个规则，默认规则为逻辑或。<br/><br/>联动必填时的逻辑表达式，比如 (\$\{input-dds33aa3\} \|\| \$\{radio-zza032dfe\}) && \$\{checkbox-iese032fdsa\}，使用多个元素 key 来制定规则。 | string |
| dynamicProps | 否 | 为动态请求数据配置，可以满足一些动态变化的数据，比如下拉列表数据是动态变化的；onion-form组件需要添加 dynamicRequest 属性 | DynamicProps |
| linkageValue | 否 | 联动值，将源元素的值设置为指定字段的值 | Array\<LinkageValue\> |

##### formProps

> formProps 为内置的表单项组件 [FormItem 属性](http://ironm.cfuture.shop/mobile-design/components/form-item)
除了这些 FormItem 属性外，另外增加了禁用的属性，如下

| 属性 | 必填 | 说明 | 类型 |
| - | - | - | - |
| readOnly | 否 | 是否只读(禁用) | boolean |
| 其它 FormItem 属性... | - | - | - |

##### LinkageShowHide

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| - | - | - | - | - |
| targetElements | 是 | 关联目标，表示能够联动的目标元素，string 为目标元素的 key 即 schema.elements.[key] | string[] | - |
| relatedValue | 是 | 关联值，表示当前表单的值和该值进行判断触发该条规则；<br/>为基本类型时判断相等；<br/>为对象时深度比较；<br/>为数组时判断是否包含在内； | 基本类型 \| 对象类型 \| 数组类型 | - |

##### LinkageRequired

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| - | - | - | - | - |
| targetElements | 是 | 关联目标，表示能够联动的目标元素，string 为目标元素的 key 即 schema.elements.[key] | string[] | - |
| relatedValue | 是 | 关联值，表示当前表单的值和该值进行判断触发该条规则；<br/>为基本类型时判断相等；<br/>为对象时深度比较；<br/>为数组时判断是否包含在内； | 基本类型 \| 对象类型 \| 数组类型 | - |

##### DynamicProps

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| - | - | - | - | - |
| field | 是 | 动态请求数据后给到的字段，限于 props 内属性，除了 value 属性，比如动态请求下拉数据，指定 options 字段 | string | - |
| api | 是 | 指定接口 | string | - |
| method | 否 | 请求方式 | POST \| GET | - |
| params | 否 | 请求参数 | Record<string, any> | - |
| defaultResponse | 否 | 默认值返回值，当请求失败或接口返回的数据不可用时 | any | - |
| extension | 否 | 扩展字段 | Record<string, any> | - |

##### LinkageValue

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| - | - | - | - | - |
| sourceElement | 是 | 源元素id，即根据源元素的值(`value` 字段)联动，该值记为 `sourceValue` | string | - |
| targetField | 是 | 该元素下 props 中目标字段的值为 `sourceValue`，比如 `targetField` 为 `dynamicProps.params.b` | string | - |

#### 布局（layout）

| 属性 | 必填 | 说明 | 类型 |
| - | - | - | - |
| root | 是 | 根节点元素 key | string |
| structure | 是 | 布局结构 | object |

如下示例：

```json
{
  "layout": {
    // 指定根元素
    "root": "pageContainer-608277b5",
    // 组件结构关系
    "structure": {
      // 根元素
      "pageContainer-608277b5": [
        // 子组件1
         "title-4aed86d0",
        // 子组件2
        "input-8693a7ed",
        // 子组件3
        "picker-0791d8c1",
      ]
    }
  }
}
```

### OnionForm

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| - | - | - | - | - |
| mode | 否 | 模式<br>edit 编辑态<br>detail 详情态 | edit \| detail | edit |
| initialFormValue | 否 | 初始化值 | object | - |
| schema | 是 | 一个 JSON 对象，是用来渲染具体的表单的 JSON 描述结构，具体看如上 schema 规范 | Schema |
| formModulesMap | 否 | 表单物料注册表，接收一个对象，对象键名key为注册组件的唯一key，键值value为一个对象记为 formModule，formModule 参数如下表格；<br>目前内置注册的表单组件如下 innerModules 表格 | object | - |
| modulesMap | 否 | 非表单物料注册表，接收一个对象，对象键名key为注册组件的唯一key，键值value为一个对象记为 normalModule，normalModule 参数如下表格；<br>目前内置注册的表单组件如下 innerModules 表格 | object | - |
| form | 否 | 表单实例，通过 useForm() 获取，提供触发校验、设置表单值等能力 | - | - |
| onEmit | 否 | 事件回调，需要 schema 中加入 type 为 eventButton 的组件元素，同时 eventButton 组件元素需要在 modulesMap 中注册自定义的组件，组件还要透出 onEmit 事件 | (eventName: string) => void | - |
| onSubmit | 否 | 提交事件回调，需要 schema 中定义了 type 为 submitButton 的组件元素，这个事件内部会先对表单进行校验，通过后会触发该事件，否则不触发；如果不想要内置的提交按钮，可以在 schema 中去掉 submitButton 组件元素，然后在页面上其它地方写自定义按钮组件，通过拿到表单实例中 getFieldsValue 方法拿到表单值，但需要自定义校验逻辑  | (formValue: object, errorFields?: FieldError[]) => void | - |
| dynamicRequest | 否 | 动态数据请求方法 | (opitons: DynamicRequestOptions) => Promise\<any\> | - |
| setLinkageShowHideFn | 否 | 联动显隐，自定义显隐逻辑，计算源元素的值与关联值的显隐关系 | (options: setLinkageShowHideFnOptions) => boolean \| 'skip' | - |
| onValuesChange | 否 | 字段值更新时触发回调事件<br/>注意：setFieldsValue 不会触发 onValuesChange，change 事件仅当用户交互才会触发 | (changedValues: Record<string, any>, allValues: Record\<string, any\>) => void | - |

#### FieldError

| 属性 | 说明 | 类型 |
| - | - | - |
| name | 字段 | string |
| errors | 错误信息 | string[] |

#### DynamicRequestOptions

| 属性 | 说明 | 类型 |
| - | - | - |
| api | 接口地址 | string |
| params | 请求参数 | object |
| method | 错误信息 | POST \| GET |
| dynamicProps | schema中动态请求数据配置对象 | DynamicProps |

#### setLinkageShowHideFnOptions

| 属性 | 说明 | 类型 |
| - | - | - |
| relatedElement | 关联源元素，由这个元素变动触发联动显隐计算 | Element |
| value | 关联源元素的值，由这个值来计算 | any |
| relatedValue | 联动显隐设置的关联值，即 schema 中已设置的 | any |

#### formModule

| 属性 | 必填 | 说明 | 类型 |
| - | - | - | - |
| default | 是 | 自定义的表单组件，组件必须满足2个属性：value 和 onChange，比如：<br/> formModulesMap = { input: { default: Input } } | React ComponentType |

#### normalModule

| 属性 | 必填 | 说明 | 类型 |
| - | - | - | - |
| default | 是 | 自定义的组件，比如：<br/> modulesMap = { title: { default: Title } } | React ComponentType |

#### innerModules

OnionForm 内置注册的组件

> 目前新规范的表单组件正在开发中，只有如下部分内置组件，开发者可先通过 formModulesMap 自定义注册表单组件 和 modulesMap 自定义注册非表单组件

| 物料 key | 类型 | 描述 | 属性 |
| - | - | - | - |
| pageContainer | 非表单物料 | 外层容器组件，没有什么属性，目前就是单纯的在最外层 | - |
| submitButton | 非表单物料 | 提交按钮组件，内部监听了这个组件的 click 事件做了一些 require 校验逻辑，如果 schema 中没有定义 type 为 submitButton 的元素，则这个内部校验不会有效 | SubmitButtonProps |
| formItem | 表单包装物料 | 该组件包装了表单组件，实现了布局、提示、高亮等功能 |  |
| input | 表单物料 | 输入框组件 | [查看 Input 组件属性](http://ironm.cfuture.shop/mobile-design/components/input) |
| textarea | 表单物料 | 输入域组件 | [查看 Textarea 组件属性](http://ironm.cfuture.shop/mobile-design/components/text-area) |
| radioGroup | 表单物料 | 单选组组件 | [查看 RadioGroup 组件属性](http://ironm.cfuture.shop/mobile-design/components/radio-group) |

##### SubmitButtonProps

| 物料 key | 类型 | 描述 | 属性 |
| - | - | - | - |
| type | default \| primary \| success \| warning \| error \| gradient | 按钮类型 | - |
| text | string | 按钮文案 | - |
