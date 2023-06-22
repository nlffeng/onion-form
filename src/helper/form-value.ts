/**
 * 层级对象转平铺对象
 */
export function tierToTileObj(
  originValue: Record<string, any>,
  formFields: string[]
): Record<string, any> {
  if (!formFields.length) return originValue

  const ret = {}

  formFields.forEach(fieldPath => {
    const fieldArr = fieldPath.split('.')
    let temObj = originValue

    for (let i = 0; i < fieldArr.length; i++) {
      const field = fieldArr[i];
      const value = temObj[field]

      if (i === (fieldArr.length - 1)) {
        // if (!(field in temObj)) break

        ret[fieldPath] = value
        break
      }

      // 不符合对象形式，直接赋值为 undefined
      if (!(typeof value === 'object' && value !== null)) {
        ret[fieldPath] = undefined
        break
      }

      temObj = value
    }
  })

  return ret
}

/**
 * 平铺对象转层级对象
 */
export function tileToTierObj(
  originValue: Record<string, any>,
  formFields: string[]
): Record<string, any> {
  if (!formFields.length) return originValue

  const ret = {}

  formFields.forEach(fieldPath => {
    const fieldArr = fieldPath.split('.')

    // 值里面没有，直接跳过
    if (!(fieldPath in originValue)) return

    const value = originValue[fieldPath]

    let temObj = ret

    for (let i = 0; i < fieldArr.length; i++) {
      const field = fieldArr[i];

      // 最后一项
      if (i === (fieldArr.length - 1)) {
        temObj[field] = value
        break
      }

      // 没有时设置空对象
      if (!(field in temObj)) {
        temObj[field] = {}
        temObj = temObj[field]
        continue
      }

      // 判断原来是否为对象
      const v = temObj[field]
      if (!(typeof v === 'object' && v !== null)) {
        break
      }

      temObj = v
    }
  })

  return ret
}

/**
 * 设置平铺字段的表单值
 */
export function setObjValueByTileFile(
  originValue: Record<string, any>,
  field: string,
  value: any
): Record<string, any> {
  const ret = { ...originValue }
  const arr = field.split('.')

  let temObj = ret
  arr.forEach((k, i) => {
    if (i === (arr.length - 1)) {
      temObj[k] = value
      return
    }

    temObj[k] = { ...(temObj[k] || {}) }
    temObj = temObj[k]
  })

  return ret
}
