'use client';

import React from 'react';

import type { TitleProps as AntDTextProps } from 'antd/es/typography/Title';
import { useFontStyles } from './useFontStyles';
import { Typography } from 'antd';

const { Title: AntTitle } = Typography;

interface TitleProps extends Omit<AntDTextProps, 'type'> {
  type?: 'secondary' | 'tertiary' | 'default';
}

export const Title = React.memo<
  {
    children: React.ReactNode | string;
  } & TitleProps
>(({ children, type = 'default', ...props }) => {
  const { cx, styles } = useFontStyles();

  return (
    <AntTitle
      ellipsis={{
        tooltip: children
      }}
      {...props}
      className={cx(
        type === 'default' && styles.default,
        type === 'secondary' && styles.secondary,
        type === 'tertiary' && styles.tertiary,
        props.className
      )}>
      {children}
    </AntTitle>
  );
});
Title.displayName = 'Title';
