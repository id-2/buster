import { AppMaterialIcons, Title } from '@/components';
import React from 'react';

import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css, token }) => ({
  icon: {
    color: token.colorIcon
  }
}));

export const AppSidebarTopSettings: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  onGoToHomePage: () => void;
}> = ({ style, onGoToHomePage, className = '' }) => {
  const { styles, cx } = useStyles();

  return (
    <div className={`${className}`} style={style}>
      <div className={cx('flex cursor-pointer items-center space-x-2.5')} onClick={onGoToHomePage}>
        <AppMaterialIcons className={cx(styles.icon)} icon="chevron_left" />

        <Title level={4}>Settings</Title>
      </div>
    </div>
  );
};
