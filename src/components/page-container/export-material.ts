import PageContainer from './index';
import defaultProps from './default-props';

export default PageContainer;
export const materialConfig: any = {
  title: '页面',
  defaultProps,
  hiddenInMaterialPanel: true,
  canDuplicate: false,
  draggable: false,
  removable: false,
  canFocus: false,
  focusToolPosition: 'innerTop',
};
