'use client';

import React, { useContext, useMemo } from 'react';
import { useDatasetContextSelector } from '@/context/Datasets';
import { useDatasets } from '@/context/Datasets';
import { Button, Dropdown, MenuProps, Skeleton } from 'antd';
import { BusterDataset } from '@/api/busterv2/datasets';
import { useAntToken } from '@/styles/useAntToken';
import { formatDate } from '@/utils/date';
import { AppMaterialIcons, EditableTitle, PulseLoader } from '@/components';
import { DatasetApps } from './_config';
import { AppDataSourceIcon } from '@/components/icons/AppDataSourceIcons';
import { useUserConfigContextSelector } from '@/context/Users';
import { useDataSourceContextSelector } from '@/context/DataSources';
import { useMemoizedFn, useMount } from 'ahooks';
import { AppDropdownSelect } from '@/components/dropdown';
import { Text, Title } from '@/components';
import Link from 'next/link';
import { BusterRoutes, createBusterRoute } from '@/routes';
import AppDataGrid from '@/components/table/AppDataGrid';

export const DatasetIndividualContent: React.FC<{
  selectedApp: DatasetApps;
  selectedDataset: BusterDataset | undefined;
  sql: string | undefined;
  setSQL: (sql: string) => void;
}> = ({ selectedApp, selectedDataset }) => {
  const showSkeletonLoader = !selectedDataset || !selectedDataset?.id;

  return (
    <>
      {showSkeletonLoader ? (
        <SkeletonLoader />
      ) : (
        <div className="flex w-full flex-col space-y-5">
          <DatasetHeader dataset={selectedDataset} dataSource={selectedDataset} />
          <DatasetFormStatus dataset={selectedDataset} />
          <FormData dataset={selectedDataset} />
        </div>
      )}
    </>
  );
};

const DatasetHeader: React.FC<{ dataset: BusterDataset; dataSource: BusterDataset }> = ({
  dataset,
  dataSource
}) => {
  const onDeleteDataset = useDatasetContextSelector((state) => state.onDeleteDataset);
  const onUpdateDataset = useDatasetContextSelector((state) => state.onUpdateDataset);
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: 'Delete',
      icon: <AppMaterialIcons icon="delete" />,
      onClick: async () => {
        try {
          await onDeleteDataset(dataset.id);
        } catch (error) {
          //
        }
      }
    }
  ];

  return (
    <div className="flex justify-between space-x-2">
      <div className="flex space-x-4">
        <div className="flex flex-col space-y-1">
          <EditableTitle
            onChange={(value) => {
              if (value) {
                onUpdateDataset({
                  id: dataset.id,
                  name: value
                });
              }
            }}
            level={4}>
            {dataSource.name}
          </EditableTitle>
          <Text type="secondary">
            Last updated{': '}
            {formatDate({
              date: dataSource.updated_at || dataSource.created_at,
              format: 'LLL'
            })}
          </Text>
        </div>
      </div>

      {isAdmin && (
        <Dropdown trigger={['click']} placement="bottomRight" menu={{ items: dropdownItems }}>
          <Button
            type="text"
            icon={<AppMaterialIcons className="cursor-pointer" size={16} icon="more_horiz" />}
          />
        </Dropdown>
      )}
    </div>
  );
};

const DatasetFormStatus: React.FC<{ dataset: BusterDataset }> = ({ dataset }) => {
  const token = useAntToken();
  const onUpdateDataset = useDatasetContextSelector((state) => state.onUpdateDataset);

  return (
    <div
      className="flex w-full items-center justify-between space-x-3"
      style={{
        background: token.colorBgBase,
        border: `0.5px solid ${token.colorBorder}`,
        borderRadius: `${token.borderRadius}px`,
        padding: `${token.paddingContentVertical}px ${token.paddingContentHorizontal}px`
      }}>
      <div className="flex items-center space-x-4">
        <div
          style={{
            borderRadius: token.borderRadius,
            border: `0.5px solid ${token.colorBorder}`
          }}
          className="p-2">
          <AppDataSourceIcon size={26} type={dataset.data_source.db_type} />
        </div>
        <div className="flex flex-col">
          <Text>Connection status</Text>
          <Text type="secondary">{`Connected on ${formatDate({
            date: dataset.created_at,
            format: 'LL'
          })}`}</Text>
        </div>
      </div>
      <div className="h-fit">
        <FormStatusButton dataset={dataset} onUpdateDataset={onUpdateDataset} />
      </div>
    </div>
  );
};

const FormStatusButton: React.FC<{
  dataset: BusterDataset;
  onUpdateDataset: ReturnType<typeof useDatasets>['onUpdateDataset'];
}> = ({ dataset, onUpdateDataset }) => {
  const token = useAntToken();
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);
  const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
  const dataSourcesList = useDataSourceContextSelector((state) => state.dataSourcesList);
  const loadingDatasources = useDataSourceContextSelector((state) => state.loadingDatasources);
  const initDataSourceList = useDataSourceContextSelector((state) => state.initDataSourceList);

  const dropdownItems = useMemo(() => {
    return dataSourcesList.map((dataSource) => ({
      key: dataSource.id,
      label: dataSource.name,
      onClick: async () => {
        await onUpdateDataset({
          id: dataset.id,
          data_source_id: dataSource.id
        });
      }
    }));
  }, [dataSourcesList, dataset.id, onUpdateDataset]);

  const onOpenChange = useMemoizedFn((open: boolean) => {
    setIsOpenDropdown(open);
  });

  useMount(() => {
    if (isAdmin) initDataSourceList();
  });

  if (isAdmin) {
    return (
      <AppDropdownSelect
        trigger={['click']}
        items={dropdownItems}
        hideCheckbox={false}
        doNotSortSelected={true}
        selectedItems={[dataset.data_source.id]}
        onOpenChange={onOpenChange}>
        <Button
          type="text"
          iconPosition="end"
          loading={loadingDatasources}
          icon={
            <AppMaterialIcons
              className="transition"
              style={{
                transform: `rotate(${isOpenDropdown ? 0 : -90}deg)`
              }}
              icon="keyboard_arrow_down"
            />
          }>
          Change datasource
        </Button>
      </AppDropdownSelect>
    );
  }

  return (
    <div className="flex cursor-pointer items-center space-x-2">
      <PulseLoader color={token.colorSuccess} size={10} />
      <Text className="select-none">Connected</Text>
    </div>
  );
};

const FormData: React.FC<{
  dataset: BusterDataset;
}> = ({ dataset }) => {
  const token = useAntToken();
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);

  if (!dataset.id) return <div></div>;

  if (!dataset.definition) {
    return (
      <div className="flex justify-center pt-12">
        <div
          className="flex max-w-[300px] flex-col items-center justify-center space-y-5"
          style={{}}>
          <div className="flex flex-col items-center space-y-3">
            <Title level={4}>Build your dataset</Title>
            <Text
              type="secondary"
              className="text-center">{`To build your dataset, you’ll need to create a data model or view with our SQL editor.`}</Text>
          </div>
          <Link
            prefetch
            href={createBusterRoute({
              route: BusterRoutes.APP_DATASETS_ID_SQL,
              datasetId: dataset.id
            })}>
            <Button type="default" icon={<AppMaterialIcons icon="add" />}>
              Build dataset
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const defaultCellFormatter = (value: any, key: string): string => {
    return String(value);
  };

  return (
    <div
      className="buster-chart h-full w-full overflow-auto"
      style={{
        maxHeight: '500px',
        border: `0.5px solid ${token.colorBorder}`,
        borderRadius: `${token.borderRadius}px`
      }}>
      <AppDataGrid
        rows={dataset.data || []}
        headerFormat={isAdmin ? (v) => v : undefined}
        cellFormat={defaultCellFormatter}
      />
    </div>
  );
};

const SkeletonLoader: React.FC<{}> = () => {
  return <div>{/* <Skeleton /> */}</div>;
};
