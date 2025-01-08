import { createBusterRoute, BusterRoutes } from '@/routes';
import { BreadcrumbSeperator } from '@/styles/context/useBreadcrumbStyles';
import { Breadcrumb } from 'antd';
import Link from 'next/link';
import React, { useMemo } from 'react';

export const DatasetBreadcrumb: React.FC<{
  datasetName?: string;
}> = React.memo(({ datasetName }) => {
  const breadcrumbItems = useMemo(
    () =>
      [
        {
          title: (
            <Link prefetch href={createBusterRoute({ route: BusterRoutes.APP_DATASETS })}>
              Datasets
            </Link>
          )
        },
        {
          title: datasetName
        }
      ].filter((item) => item.title),
    [datasetName]
  );

  return (
    <>
      <Breadcrumb
        className="flex items-center"
        items={breadcrumbItems}
        separator={<BreadcrumbSeperator />}
      />
    </>
  );
});
