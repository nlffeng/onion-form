import { Schema } from '../common-types'
import { Plugins } from '../onion-engine/types'
import { ReactRendererProps } from '../react-renderer'

export interface IProps {
  /** 表单 schema */
  schema?: Schema
  /** 插件 */
  plugins?: Plugins
  components: ReactRendererProps['components']
}
