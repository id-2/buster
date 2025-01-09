import { BusterDatasetData } from '@/api/busterv2/datasets';
import { createStyles } from 'antd-style';
import React from 'react';
import isEmpty from 'lodash/isEmpty';
import AppDataGrid from '@/components/table/AppDataGrid';

export const DataContainer: React.FC<{
  data: BusterDatasetData;
  className?: string;
}> = React.memo(({ data, className }) => {
  const { styles, cx } = useStyles();
  const hasData = !isEmpty(data);

  return (
    <div className={cx(styles.container, 'h-full w-full overflow-hidden', className)}>
      {hasData ? (
        <AppDataGrid rows={data} />
      ) : (
        <div className="flex justify-center py-24">No data returned</div>
      )}
    </div>
  );
});

DataContainer.displayName = 'DataContainer';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background: ${token.colorBgBase};
    border-radius: ${token.borderRadius}px;
    border: 0.5px solid ${token.colorBorder};
  `
}));
