import { ButtonProps } from '@tarojs/components'
export interface IProps extends Record<string, any> {
  text: string;
  type: ButtonProps['type']
}
