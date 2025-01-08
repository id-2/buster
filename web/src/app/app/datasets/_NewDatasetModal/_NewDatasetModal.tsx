import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Button, Select, SelectProps } from 'antd';
import { useMemoizedFn, useMount } from 'ahooks';
import { useDatasetContextSelector } from '@/context/Datasets';
import { useDataSourceContextSelector } from '@/context/DataSources';
import { BusterDataset, BusterDatasetListItem, useGetDatasets } from '@/api/busterv2/datasets';
import { useAppLayoutContextSelector } from '@/context/BusterAppLayout';
import { BusterRoutes, createBusterRoute } from '@/routes';
import { useRouter } from 'next/navigation';
import { AppModal, Text } from '@/components';
import { useAntToken } from '@/styles/useAntToken';
import { BusterList, BusterListColumn, BusterListRow } from '@/components/list';
import { formatDate } from '@/utils/date';
import { timeout } from '@/utils';

export const NewDatasetModal: React.FC<{
  open: boolean;
  onClose: () => void;
  beforeCreate?: () => void;
  afterCreate?: () => void;
  datasourceId?: string;
}> = React.memo(({ open, onClose, beforeCreate, afterCreate, datasourceId }) => {
  const router = useRouter();
  const createDataset = useDatasetContextSelector((state) => state.createDataset);
  const onChangePage = useAppLayoutContextSelector((s) => s.onChangePage);
  const forceInitDataSourceList = useDataSourceContextSelector(
    (state) => state.forceInitDataSourceList
  );
  const [creatingDataset, setCreatingDataset] = React.useState(false);
  const [selectedDatasource, setSelectedDatasource] = React.useState<string | null>(
    datasourceId || null
  );

  const disableSubmit = !selectedDatasource;

  const createNewDatasetPreflight = useMemoizedFn(async () => {
    if (creatingDataset || disableSubmit) return;
    setCreatingDataset(true);
    beforeCreate?.();
    const res = (await createDataset({
      data_source_id: selectedDatasource!
    })) as BusterDataset;
    if (res.id) {
      onChangePage({
        route: BusterRoutes.APP_DATASETS_ID_OVERVIEW,
        datasetId: res.id
      });
      forceInitDataSourceList();
      setTimeout(() => {
        onClose();
        afterCreate?.();
      }, 150);
    }
    setTimeout(() => {
      setCreatingDataset(false);
    }, 500);
  });

  const onAddDataSourceClick = useMemoizedFn(() => {
    onClose();
    setTimeout(() => {
      router.push(createBusterRoute({ route: BusterRoutes.SETTINGS_DATASOURCES_ADD }));
    }, 350);
  });

  useLayoutEffect(() => {
    if (open) {
      setSelectedDatasource(datasourceId || null);
    }
  }, [open]);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      header={{
        title: 'Create a dataset',
        description: 'Select a datasource to create or import your dataset from.'
      }}
      footer={{
        secondaryButton: {
          text: 'Add a datasource',
          onClick: onAddDataSourceClick
        },
        primaryButton: {
          text: 'Create dataset',
          onClick: createNewDatasetPreflight,
          loading: creatingDataset,
          disabled: disableSubmit
        }
      }}>
      {open && (
        <SelectDataSourceDropdown
          setSelectedDatasource={setSelectedDatasource}
          selectedDatasource={selectedDatasource}
        />
      )}

      {open && selectedDatasource && (
        <SelectFromExistingDataset selectedDatasource={selectedDatasource} />
      )}
    </AppModal>
  );
});

NewDatasetModal.displayName = 'NewDatasetModal';

const SelectDataSourceDropdown: React.FC<{
  setSelectedDatasource: (id: string) => void;
  selectedDatasource: string | null;
}> = React.memo(({ setSelectedDatasource, selectedDatasource }) => {
  const router = useRouter();
  const dataSourcesList = useDataSourceContextSelector((state) => state.dataSourcesList);
  const initDataSourceList = useDataSourceContextSelector((state) => state.initDataSourceList);

  const selectOptions: SelectProps['options'] = useMemo(() => {
    return dataSourcesList.map((dataSource) => ({
      label: dataSource.name,
      value: dataSource.id
    }));
  }, [dataSourcesList]);

  const selectedOption = useMemo(() => {
    return selectOptions.find((option) => option.value === selectedDatasource);
  }, [selectOptions, selectedDatasource]);

  useMount(() => {
    initDataSourceList();
    router.prefetch(
      createBusterRoute({
        route: BusterRoutes.APP_DATASETS_ID_OVERVIEW,
        datasetId: ''
      })
    );
  });

  return (
    <Select
      className="w-full"
      options={selectOptions}
      value={selectedOption}
      placeholder="Select datasources that this term pertains to"
      popupMatchSelectWidth={true}
      autoFocus={true}
      onChange={(value) => {
        setSelectedDatasource(value as unknown as string);
      }}
    />
  );
});
SelectDataSourceDropdown.displayName = 'SelectDataSourceDropdown';

const SelectFromExistingDataset: React.FC<{
  selectedDatasource: string;
}> = React.memo(({ selectedDatasource }) => {
  const token = useAntToken();
  const { data: importedDatasets, isFetched: isFetchedDatasets } = useGetDatasets({
    imported: true
  });
  const onUpdateDataset = useDatasetContextSelector((state) => state.onUpdateDataset);
  const onChangePage = useAppLayoutContextSelector((s) => s.onChangePage);

  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const columns: BusterListColumn[] = useMemo(() => {
    return [
      {
        title: 'Name',
        dataIndex: 'name'
      },
      {
        title: 'Updated at',
        dataIndex: 'updated_at',
        render: (v) => formatDate({ date: v, format: 'lll' }),
        width: 130
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        width: 100,
        render: (_, record: BusterDatasetListItem) => (
          <div className="flex items-center justify-end">
            <Button
              loading={submittingId === record.id}
              type="default"
              onClick={() => onSelectDataset(record.id)}>
              Use dataset
            </Button>
          </div>
        )
      }
    ];
  }, [submittingId]);

  const rows: BusterListRow[] = useMemo(() => {
    return importedDatasets.map((dataset) => ({
      id: dataset.id,
      data: dataset
    }));
  }, [importedDatasets]);

  const onSelectDataset = useMemoizedFn(async (datasetId: string) => {
    setSubmittingId(datasetId);
    try {
      await onUpdateDataset({
        id: datasetId,
        enabled: true
      });
      await timeout(500);
      onChangePage({
        route: BusterRoutes.APP_DATASETS_ID,
        datasetId
      });
    } catch (error) {
      setSubmittingId(null);
    }
  });

  return (
    <div
      className="mt-3 flex h-[250px] w-full flex-col"
      style={{
        border: `0.5px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius
      }}>
      <div
        className="flex"
        style={{
          padding: 12,
          background: token.controlItemBgActive,
          borderBottom: `0.5px solid ${token.colorBorder}`
        }}>
        <Text size="sm">Use an existing table or view as a dataset</Text>
      </div>
      <div className="h-full w-full">
        <BusterList
          columns={columns}
          rows={rows}
          showHeader={false}
          emptyState={
            !isFetchedDatasets ? (
              <div className="flex h-full w-full items-center justify-center">
                <Text>No datasets found</Text>
              </div>
            ) : (
              <></>
            )
          }
        />
      </div>
    </div>
  );
});
SelectFromExistingDataset.displayName = 'SelectFromExistingDataset';
