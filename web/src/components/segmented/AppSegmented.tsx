import React from 'react';
import { ConfigProvider, Segmented, SegmentedProps, ThemeConfig } from 'antd';
import { createStyles } from 'antd-style';
import { busterAppStyleConfig } from '@/styles/busterAntDStyleConfig';
const token = busterAppStyleConfig.token!;
export interface AppSegmentedProps extends SegmentedProps {
  bordered?: boolean;
}

const useStyles = createStyles(({ css, token }) => {
  return {
    segmented: css``
  };
});

const THEME_CONFIG: ThemeConfig = {
  components: {
    Segmented: {
      itemColor: token.colorTextDescription,
      trackBg: 'transparent',
      itemSelectedColor: token.colorTextBase,
      itemSelectedBg: token.controlItemBgActive,
      colorBorder: token.colorBorder,
      boxShadowTertiary: 'none'
    }
  }
};

export const AppSegmented = React.memo<AppSegmentedProps>(
  ({ size = 'small', bordered = true, ...props }) => {
    const { cx, styles } = useStyles();

    return (
      <ConfigProvider theme={THEME_CONFIG}>
        <Segmented
          {...props}
          size={size}
          className={cx(
            styles.segmented,
            props.className,
            '!shadow-none',
            !bordered && 'no-border'
          )}
        />
      </ConfigProvider>
    );
  }
);
AppSegmented.displayName = 'AppSegmented';
