import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDataSourceContextSelector } from '@/context/DataSources';
import { CircleSpinnerLoaderContainer, Text, Title } from '@/components';
import { useAntToken } from '@/styles/useAntToken';
import { formatDate, inputHasText, timeout } from '@/utils';
import { InputRef, Input, Button, ConfigProvider } from 'antd';
import { AppDataSourceIcon } from '@/components/icons/AppDataSourceIcons';
import { Card, List } from 'antd';
import { createStyles } from 'antd-style';
import { useMemoizedFn, useMount } from 'ahooks';
import { AnimatePresence, motion } from 'framer-motion';
import { useDatasetContextSelector } from '@/context/Datasets';
import { useAppLayoutContextSelector } from '@/context/BusterAppLayout';
import { BusterRoutes } from '@/routes';

export const NewDatasetInput: React.FC<{
  selectedDatasource: string;
  title: string;
  setTitle: (title: string) => void;
  setSelectedDatasource: (id: string | null) => void;
  onSubmit: () => Promise<void>;
}> = ({ onSubmit, selectedDatasource, setSelectedDatasource, title, setTitle }) => {
  const [selectFromExisting, setSelectFromExisting] = useState<'select' | 'new' | null>(null);
  const token = useAntToken();
  const dataSourcesList = useDataSourceContextSelector((state) => state.dataSourcesList);
  const dataSource = dataSourcesList.find((ds) => ds.id === selectedDatasource)!;

  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            actionsLiMargin: '0px',
            headerBg: token.controlItemBgActive,
            headerHeight: 36,
            headerFontSize: 13,
            padding: 12,
            paddingLG: 12
          }
        }
      }}>
      <div className="flex flex-col space-y-5">
        <div className="flex items-center space-x-3" style={{}}>
          <div
            style={{
              border: `0.5px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              padding: 6
            }}>
            <AppDataSourceIcon size={36} type={dataSource?.type} />
          </div>
          <div className="flex flex-col justify-center">
            <Title level={4}>{dataSource?.name}</Title>
            <Text type="tertiary" size="sm">{`Last updated: ${formatDate({
              date: dataSource?.updated_at,
              format: 'lll'
            })}`}</Text>
          </div>
        </div>

        {selectFromExisting === null && (
          <ChooseExistingDatasetFrame setSelectFromExisting={setSelectFromExisting} />
        )}

        {selectFromExisting === 'new' && (
          <NewDatasetInputFrame title={title} setTitle={setTitle} onSubmit={onSubmit} />
        )}

        {selectFromExisting === 'select' && (
          <ChooseFromExistingDatasetFrame
            setSelectFromExisting={setSelectFromExisting}
            selectedDatasource={selectedDatasource}
          />
        )}
      </div>
    </ConfigProvider>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 100%;
    display: flex;
    flex-direction: column;

    justify-content: space-between;
  `,
  existingTables: css`
    width: 100%;
  `
}));

const ChooseExistingDatasetFrame: React.FC<{
  setSelectFromExisting: (value: 'select' | 'new' | null) => void;
}> = ({ setSelectFromExisting }) => {
  const { styles, cx } = useStyles();

  return (
    <ConfigProvider
      theme={{
        components: {
          Button: { controlHeight: 36 }
        }
      }}>
      <div className="flex w-full space-x-4">
        <Card
          title="Choose existing dataset"
          className={cx(styles.card)}
          classNames={{
            body: 'h-full'
          }}
          actions={[
            <Button
              key="choose-existing-dataset"
              block
              type="text"
              onClick={() => {
                setSelectFromExisting('select');
              }}>
              Choose existing dataset
            </Button>
          ]}>
          <Text>Choose an existing dataset, table, or view to use for this new dataset</Text>
        </Card>

        <Card
          title="Create new dataset"
          className={cx(styles.card)}
          classNames={{
            body: 'h-full'
          }}
          actions={[
            <Button
              key="create-new-dataset"
              block
              type="text"
              onClick={() => {
                setSelectFromExisting('new');
              }}>
              Create new dataset
            </Button>
          ]}>
          <Text>Create a new dataset completely from scratch</Text>
        </Card>
      </div>
    </ConfigProvider>
  );
};

const NewDatasetInputFrame: React.FC<{
  title: string;
  setTitle: (title: string) => void;
  onSubmit: () => Promise<void>;
}> = ({ title, setTitle, onSubmit }) => {
  const inputRef = React.useRef<InputRef>(null);
  const [loading, setLoading] = useState(false);

  const disabled = !inputHasText(title);

  const onSubmitPreflight = useMemoizedFn(async () => {
    if (disabled) {
      return;
    }
    setLoading(true);
    await onSubmit();
    setLoading(false);
  });

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Text className="text-nowrap">Dataset name</Text>
        <Input
          value={title}
          ref={inputRef}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name your dataset"
          className="w-full"
          disabled={loading}
          onPressEnter={() => {
            onSubmit();
          }}
        />
      </div>

      <div className="flex w-full justify-end">
        <Button type="primary" disabled={disabled} onClick={onSubmitPreflight} loading={loading}>
          Create dataset
        </Button>
      </div>
    </div>
  );
};

const ChooseFromExistingDatasetFrame: React.FC<{
  setSelectFromExisting: (value: 'select' | 'new' | null) => void;
  selectedDatasource: string;
}> = ({ setSelectFromExisting, selectedDatasource }) => {
  const { styles, cx } = useStyles();
  const initImportedDatasets = useDatasetContextSelector((state) => state.initImportedDatasets);
  const importedDatasets = useDatasetContextSelector((state) => state.importedDatasets);
  const onUpdateDataset = useDatasetContextSelector((state) => state.onUpdateDataset);
  const [loading, setLoading] = useState(importedDatasets.length === 0);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const onChangePage = useAppLayoutContextSelector((s) => s.onChangePage);

  const onClickDataset = useMemoizedFn(async (datasetId: string) => {
    try {
      setSubmittingId(datasetId);
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

  useMount(async () => {
    setLoading(true);
    if (importedDatasets.length === 0) {
      await initImportedDatasets();
    }
    setLoading(false);
  });

  const datasetComputed = useMemo(() => {
    return importedDatasets.filter((dataset) => dataset.data_source?.id === selectedDatasource);
  }, [importedDatasets, selectedDatasource]);

  return (
    <div className={cx(styles.existingTables)}>
      <AnimatePresence mode="wait" initial={false}>
        {!loading && (
          <motion.div
            key="existing-tables"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <Card
              classNames={{
                body: '!p-0 max-h-[50vh] overflow-y-auto'
              }}
              title="Use an existing table, view, or dataset">
              <List
                dataSource={datasetComputed}
                renderItem={(item) => (
                  <List.Item>
                    <div className="flex w-full items-center justify-between space-x-2 px-3">
                      <Text>{item.name}</Text>
                      <div>
                        <Button
                          type="default"
                          loading={submittingId === item.id}
                          disabled={!!submittingId}
                          onClick={() => {
                            onClickDataset(item.id);
                          }}>
                          Use as a dataset
                        </Button>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            key="loading"
            className="flex min-h-[120px] items-center justify-center">
            <CircleSpinnerLoaderContainer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
