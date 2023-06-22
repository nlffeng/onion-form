export interface IProps {
  className?: string
  label?: string
  hideLabel?: boolean
  required?: boolean
  info?: {
    help?: string
    tips?: string
    desc?: string
  }
  asteriskPosition?: 'front' | 'back'
  /** 标签是否独占一行 */
  labelBlock?: boolean
  /** 错误信息 */
  error?: string | string[];
}
