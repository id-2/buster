import { createStyles } from 'antd-style';
import React from 'react';

export const BusterChartWrapper = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      children: React.ReactNode;
      id: string | undefined;
      className: string | undefined;
      bordered: boolean;
      loading: boolean;
      useTableSizing: boolean;
    }
  >(({ children, id, className, bordered, loading, useTableSizing }, ref) => {
    const { styles, cx } = useStyles();

    return (
      <div
        ref={ref}
        id={id}
        className={cx(
          styles.card,
          className,
          'flex w-full flex-col',
          'transition duration-300',
          useTableSizing ? 'h-full' : 'h-full max-h-[600px] p-[18px]',
          bordered ? styles.cardBorder : '',
          loading ? '!bg-transparent' : undefined,
          'overflow-hidden'
        )}>
        {children}
      </div>
    );
  })
);

BusterChartWrapper.displayName = 'BusterChartWrapper';

const useStyles = createStyles(({ token }) => {
  return {
    card: {
      borderRadius: token.borderRadius,
      background: token.colorBgContainer
    },
    cardBorder: {
      border: `0.5px solid ${token.colorBorder}`
    }
  };
});
