import { Schema, ElementId } from '../common-types'

interface FindFormItemsReturn {
  keys: string[];
  'key-value': Schema['elements'];
}

export const findFormItems = <Type extends 'keys' | 'key-value'>(
  schema: Schema,
  returnType: Type
): FindFormItemsReturn[Type] => {
  const elementIds: string[] = []
  const formElements = Object.entries(schema.elements).reduce((result, [elementId, element]) => {
    if (element.props?.relatedModelField) {
      result[elementId] = element
      elementIds.push(elementId)
    }
    return result
  }, {})
  if (returnType === 'keys') return (elementIds as any)
  return (formElements as any)
}

export const setSchemaAttr = (params: {
  type: 'cover' | 'merge',
  schema: Schema,
  keyPath: string[],
  value: any,
}): Schema => {
  const { type = 'cover', schema, keyPath, value } = params

  const newSchema = {
    ...schema,
  }

  let midValue: any = newSchema
  const lastI = keyPath.length - 1

  for (let i = 0; i < keyPath.length; i++) {
    const key = keyPath[i];
    const v = midValue[key]

    let vType: 'array' | 'object' | 'other' = 'other'
    if (Array.isArray(v)) {
      vType = 'array'
    } else if (typeof v === 'object' && v !== null) {
      vType = 'object'
    }

    if (lastI === i) {
      if (type === 'merge') {
        if (vType === 'array' && Array.isArray(value)) {
          midValue[key] = [
            ...v,
            ...value
          ]
        } else if (vType === 'object' && (typeof value === 'object' && value !== null)) {
          midValue[key] = {
            ...v,
            ...value,
          }
        } else {
          console.warn('setSchemaAttr: ', `当前指定路径（keyPath: ${keyPath.join('.')}）设置值不成功，请检查`)
          console.warn('setSchemaAttr: ', `当前返回输入的 schema，不作处理`)
          return schema
        }
      } else {
        midValue[key] = value
      }
      continue
    }

    if (vType === 'array') {
      midValue = midValue[key] = [...v]
    } else if (vType === 'object') {
      midValue = midValue[key] = { ...v }
    } else {
      console.warn('setSchemaAttr: ', `当前指定路径（keyPath: ${keyPath.join('.')}）不对，请检查`)
      console.warn('setSchemaAttr: ', `当前返回输入的 schema，不作处理`)
      return schema
    }
  }

  return newSchema
}

export const setSchemaElementsProps = (
  schema: Schema,
  elementsProps: Record<ElementId, Record<string, any>>
): Schema => {
  let newSchema: Schema = schema

  Object.entries(elementsProps).forEach(([elementId, newProps]) => {
    newSchema = setSchemaAttr({
      type: 'merge',
      schema: newSchema,
      keyPath: ['elements', elementId, 'props'],
      value: newProps,
    })
  })

  return newSchema
}
