/**
 * linkage
 * @description 联动函数，适用于 联动显隐、联动必填 等场景
 * @author moting.nq
 * @create 2022-08-02 15:34
 */

import isEqual from 'lodash/isEqual'
import merv from 'mervjs'
import { Schema, Element } from '../common-types'

type ValueType = string | number | boolean | Record<string, any> | Array<any>

/** 联动 */
export type Linkage = Array<{
  /** 关联目标，表示能够联动的目标元素 */
  targetElements: TargetElementId[]
  /** 关联值 */
  relatedValue: ValueType
}>

/**
 * 联动逻辑表达式规则
 * 表示应用到本元素上的表达式规则
 * 如 "(${input-1000} || ${radio-1000}) && ${checkbox-1000}"
 */
export type LinkageRule = string

/** 联动的目标元素集 */
export type LinkageTargetElements = Record<string, {
  linkageExpression: LinkageRule
  /** 联动源元素 */
  relatedElements: RelatedElementId[]
}>

/**
 * 真假值
 */
export type TruthFalsityEles = Record<TargetElementId, Record<RelatedElementId, boolean>>

/** 联动目标元素 */
type TargetElementId = string
/** 联动源元素 */
type RelatedElementId = string

/**
 * 计算源元素的值与关联值的关系
 * @params relatedElement 关联源元素，由这个元素变动触发联动计算
 * @params value 关联源元素的值，由这个值来计算
 * @params relatedValue 联动设置的关联值，即 schema 中已设置的
 * @return boolean 表示真假值
 * @return 'skip' 表示跳过这次自定义逻辑，使用内部计算逻辑
 */
export type setLinkageFn = (options: {
  relatedElement: Element,
  value: any,
  relatedValue: any
  targetElements?: string[]
}) => boolean | 'skip'

export default ({
  schema,
  linkageField,
  linkageRuleField,
  setLinkageFn,
}: {
  schema: Schema,
  linkageField: 'linkageRequired' | 'linkageShowHide',
  linkageRuleField: 'linkageRequiredRule' | 'linkageShowHideRule',
  setLinkageFn?: setLinkageFn,
}): { truth: string[], falsity: string[] } => {
  // 处理 schema，加入 联动 结果
  const elements = schema.elements
  const linkageTargetElements: LinkageTargetElements = {} as LinkageTargetElements
  const truthFalsityEles: TruthFalsityEles = {}

  // 遍历元素，处理其逻辑表达式的规则
  // 同时也是为了兼容没有逻辑表达式的 schema
  Object.entries(elements).forEach(([elementId, element]) => {
    const linkage: Linkage = element.props?.[linkageField] as Linkage

    if (!linkage?.length) return;

    // 兼容没有逻辑表达式的 schema
    linkage.forEach(item => {
      let { targetElements } = item

      targetElements?.forEach(targetElementId => {
        // 如果元素上有 expression 表达式，则不需要添加默认的
        const rule = elements[targetElementId]?.props?.[linkageRuleField] as LinkageRule
        if (rule) {
          if (!linkageTargetElements[targetElementId]) {
            linkageTargetElements[targetElementId] = {
              linkageExpression: rule,
              relatedElements: []
            }
          }

          if (!linkageTargetElements[targetElementId].relatedElements.includes(elementId)) {
            linkageTargetElements[targetElementId].relatedElements.push(elementId)
          }

          return
        }

        if (!linkageTargetElements[targetElementId]) {
          linkageTargetElements[targetElementId] = {
            linkageExpression: '',
            relatedElements: [],
          }
        }

        // 若有则无需重复添加，没有则添加进去
        if (!linkageTargetElements[targetElementId].relatedElements.includes(elementId)) {
          const linkageExpression = linkageTargetElements[targetElementId].linkageExpression
          linkageTargetElements[targetElementId].relatedElements.push(elementId)
          // 默认为逻辑或
          linkageTargetElements[targetElementId].linkageExpression += linkageExpression ? ` || \${${elementId}}` : `\${${elementId}}`
        }
      })
    })

    // 计算一次真假值
    setTruthFalsityEles()

    function setTruthFalsityEles() {
      const value = element.props?.value
      const _element = element
      const tem: Record<string, boolean> = {}

      linkage.forEach((item) => {
        let { targetElements, relatedValue } = item;

        let isTruth = false

        // 外层属性控制计算
        let skip: ReturnType<setLinkageFn> = 'skip'
        if (setLinkageFn) {
          skip = setLinkageFn({
            relatedElement: _element,
            value,
            relatedValue,
            targetElements,
          })
        }

        // 统一转成数组
        relatedValue = Array.isArray(relatedValue) ? relatedValue : [relatedValue];

        if (setLinkageFn && skip !== 'skip') {
          isTruth = skip
        }
        // 值为数组类型
        else if (Array.isArray(value)) {
          isTruth = relatedValue.every(v => value.includes(v))
        }
        // 值为对象类型
        else if (Object.prototype.toString.call(value) === '[object Object]') {
          isTruth = relatedValue.every(v => {
            // 必须都是对象
            if (Object.prototype.toString.call(v) !== '[object Object]') return false
            return isEqual(v, value);
          });
        }
        // 值为其它基本类型
        else {
          isTruth = relatedValue.every(v => v === value);
        }

        targetElements?.forEach(itemId => {
          // 如果一个元素有不同的值都联动同一个元素，这里表示逻辑或，也只能是逻辑或
          tem[itemId] = tem[itemId] || isTruth
          truthFalsityEles[itemId] = truthFalsityEles[itemId] || {}
          truthFalsityEles[itemId][elementId] = tem[itemId]
        })
      });
    }
  })

  function setLinkageLogic(): { truth: string[], falsity: string[] } {
    const booleanEles: { truth: string[], falsity: string[] } = {
      truth: [],
      falsity: []
    }

    Object.entries(linkageTargetElements).forEach(([targetElementId, rule]) => {

      let linkageExpression = rule.linkageExpression || ''

      rule?.relatedElements?.forEach(relatedEleId => {
        const reg = new RegExp(`\\\${${relatedEleId}}`, 'g')
        linkageExpression = linkageExpression.replace(
          reg,
          `${truthFalsityEles[targetElementId]?.[relatedEleId] || false}`
        )
      })

      if (linkageExpression) {
        let isTruth = false
        try {
          isTruth = merv({}).parse(linkageExpression)()
        } catch (error) {
          console.log(error)
        }
        const t = isTruth ? booleanEles.truth : booleanEles.falsity;
        t.push(targetElementId)
      }
    })

    return booleanEles
  }

  // 默认开始设置一次联动
  const booleanEles = setLinkageLogic()

  return booleanEles
}
