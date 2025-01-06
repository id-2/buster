import { BusterSocketError } from '@/api/buster-socket/baseInterfaces';
import { BusterDataset } from '@/api/busterv2/datasets';
import { AppMaterialIcons, AppTooltip } from '@/components';
import { AppCodeEditor } from '@/components/inputs/AppCodeEditor';
import { CircleSpinnerLoaderContainer } from '@/components/loaders';
import { useDataSourceContextSelector } from '@/context/DataSources';
import { useSQLContextSelector } from '@/context/SQL';
import { useAntToken } from '@/styles/useAntToken';
import { useMemoizedFn, useMount } from 'ahooks';
import { Button, Divider, Alert, Select } from 'antd';
import { createStyles } from 'antd-style';
import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import SplitPane, { Pane } from '@/components/layout/SplitPane';
import { AppDataSourceIcon } from '@/components/icons/AppDataSourceIcons';
import { DataSourceTypes } from '@/api/busterv2';
import { Text } from '@/components';
import AppDataGrid from '@/components/table/AppDataGrid';
import { formatNumber } from '@/utils';
import { useBusterNotifications } from '@/context/BusterNotifications';

const useStyles = createStyles(({ token, css }) => ({
  slider: css`
    height: 1px;
    background: ${token.colorBorder};
    &.active {
      background: ${token.colorPrimaryBorder};
    }
    &:hover {
      background: ${token.colorPrimaryBorderHover};
    }
  `,
  showSlider: css`
    background: ${token.colorBorder};
  `,
  dataGrid: css`
    .rdg-row {
      .rdg-cell {
        border-bottom: 0.5px solid ${token.colorBorder} !important;
      }
    }
  `
}));

export const DatasetSQL: React.FC<{
  selectedDataset: BusterDataset | undefined;
  sql: string;
  setSQL: (v: string) => void;
}> = ({ selectedDataset, sql, setSQL }) => {
  const { openInfoMessage } = useBusterNotifications();
  const runSQL = useSQLContextSelector((x) => x.runSQL);
  const [runningSQL, setRunningSQL] = React.useState(false);
  const [sqlQueue, setSQLQueue] = React.useState<string[]>([]);
  const [errorRes, setErrorRes] = React.useState<string | null>(null);
  const [tableData, setTableData] = React.useState<Record<string, string | null | number>[] | null>(
    selectedDataset?.data || null
  );
  const dataSourcesList = useDataSourceContextSelector((state) => state.dataSourcesList);
  const initDataSourceList = useDataSourceContextSelector((state) => state.initDataSourceList);

  const [selectedDataSource, setSelectedDataSource] = React.useState<string | undefined>(
    () =>
      dataSourcesList.find((v) => v.id === selectedDataset?.data_source_id)?.id ||
      dataSourcesList[0]?.id
  );
  const [timestampForQuery, setTimestampForQuery] = React.useState<number | null>(null);

  const disabled = runningSQL || !sql || !selectedDataSource || !!selectedDataset?.imported;

  const onRunSQL = useMemoizedFn(async () => {
    if (!sql || !selectedDataSource || runningSQL || !selectedDataset) {
      return;
    }
    const timestamp = performance.now();
    setTimestampForQuery(null);
    setRunningSQL(true);
    setErrorRes(null);
    setTableData([]);
    try {
      const indexOfCurrentSQL = sqlQueue.indexOf(sql);
      if (indexOfCurrentSQL === -1) {
        setSQLQueue([...sqlQueue, sql]);
      } else {
        setSQLQueue(sqlQueue.slice(0, indexOfCurrentSQL + 1));
      }
      const res = await runSQL({
        datasetId: selectedDataset?.id!,
        sql
      });
      setTableData(res.data);
      setTimestampForQuery(performance.now() - timestamp);
    } catch (error) {
      let _error = error as BusterSocketError;
      setErrorRes(_error.message);
    }
    setRunningSQL(false);
  });

  const onCopySQL = useMemoizedFn(() => {
    navigator.clipboard.writeText(sql);
    openInfoMessage('SQL copied to clipboard');
  });

  useLayoutEffect(() => {
    if (selectedDataset) {
      setSQL(selectedDataset?.definition || '');
      setSQLQueue([selectedDataset?.definition]);
    }
  }, [selectedDataset?.definition]);

  useLayoutEffect(() => {
    if (selectedDataset) {
      setSelectedDataSource(
        dataSourcesList.find((v) => v.id === selectedDataset.data_source_id)?.id ||
          dataSourcesList[0]?.id
      );
    }
  }, [dataSourcesList]);

  useHotkeys(
    'meta+enter',
    (e) => {
      onRunSQL();
    },
    { preventDefault: true }
  );

  useMount(() => {
    initDataSourceList();
  });

  return (
    <>
      <SQLPanels
        tableData={tableData}
        topPanel={
          !selectedDataset ? (
            <></>
          ) : (
            <SQLContainer
              sql={sql}
              dataset={selectedDataset}
              onChangeSQL={(v) => {
                setSQL(v);
              }}
              disabled={disabled}
              onRunSQL={onRunSQL}
            />
          )
        }
        bottomPanel={
          <RunSQLContainer
            sql={sql}
            disabled={disabled}
            dataset={selectedDataset}
            onRunSQL={onRunSQL}
            onCopySQL={onCopySQL}
            runningSQL={runningSQL}
            setSelectedDataSource={setSelectedDataSource}
            selectedDataSource={selectedDataSource!}
            errorRes={errorRes}
            tableData={tableData}
            sqlQueue={sqlQueue}
            setSQLQueue={setSQLQueue}
            setSQL={setSQL}
            timestampForQuery={timestampForQuery}
          />
        }
      />
    </>
  );
};

const SQLContainer: React.FC<{
  dataset: BusterDataset;
  sql: string;
  onChangeSQL: (sql: string) => void;
  onRunSQL: () => void;
  disabled: boolean;
}> = ({ onRunSQL, disabled, onChangeSQL, dataset, sql }) => {
  return (
    <div className="h-full w-full">
      <AppCodeEditor
        defaultValue={dataset.definition}
        value={sql}
        readOnly={dataset.imported}
        readOnlyMessage="Editing code is not allowed with imported datasets"
        onChange={(v) => {
          onChangeSQL(v);
        }}
        onMount={(editor, monaco) => {
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            onRunSQL();
          });
        }}
      />
    </div>
  );
};

const RunSQLContainer: React.FC<{
  dataset?: BusterDataset;
  disabled: boolean;
  onRunSQL: () => void;
  onCopySQL: () => void;
  sql: string;
  runningSQL: boolean;
  selectedDataSource: string;
  errorRes: string | null;
  tableData: Record<string, string | null | number>[] | null;
  setSelectedDataSource: (v: string) => void;
  sqlQueue: string[];
  setSQLQueue: (v: string[]) => void;
  setSQL: (v: string) => void;
  timestampForQuery: number | null;
}> = (params) => {
  const { errorRes, runningSQL, tableData } = params;
  const showLoader = runningSQL;
  const showErrorRes = errorRes && !runningSQL;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <RunSQLBar {...params} />

      <div className="h-full w-full overflow-hidden">
        {showLoader && <RunSQLContainerLoader />}
        {showErrorRes && <RunSQLContainerError errorRes={errorRes} />}
        {!showLoader && !showErrorRes && <RunSQLContainerTable tableData={tableData} />}
      </div>
    </div>
  );
};

const RunSQLContainerLoader: React.FC<{}> = () => {
  return <CircleSpinnerLoaderContainer />;
};

const RunSQLContainerError: React.FC<{
  errorRes: string;
}> = ({ errorRes }) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="max-w-[450px]">
        <Alert message="Error" closable description={errorRes} type="error" showIcon />
      </div>
    </div>
  );
};

const RunSQLContainerTable: React.FC<{
  tableData: Record<string, string | null | number>[] | null;
}> = ({ tableData }) => {
  const hasData = !!tableData && tableData.length > 0;
  const token = useAntToken();
  const { styles, cx } = useStyles();

  if (tableData === null) {
    return null;
  }

  if (!hasData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-[450px]">No data</div>
      </div>
    );
  }

  return (
    <div
      className={cx('h-full w-full overflow-hidden', styles.dataGrid)}
      style={{
        borderBottom: `0.5px solid ${token.colorBorder}`
      }}>
      <AppDataGrid rows={tableData} headerFormat={(v) => v} />
    </div>
  );
};

const RunSQLBar: React.FC<{
  timestampForQuery: number | null;
  dataset?: BusterDataset;
  onRunSQL: () => void;
  onCopySQL: () => void;
  sql: string;
  runningSQL: boolean;
  selectedDataSource: string;
  errorRes: string | null;
  setSelectedDataSource: (v: string) => void;
  sqlQueue: string[];
  setSQLQueue: (v: string[]) => void;
  setSQL: (v: string) => void;
}> = ({
  timestampForQuery,
  sqlQueue,
  setSelectedDataSource,
  runningSQL,
  selectedDataSource,
  sql,
  onRunSQL,
  onCopySQL,
  setSQL,
  dataset
}) => {
  const token = useAntToken();
  const indexOfCurrentSQL = sqlQueue.indexOf(sql);
  const dataSourcesList = useDataSourceContextSelector((state) => state.dataSourcesList);
  const dataSourceItems = dataSourcesList.map((v) => ({
    label: v.name,
    value: v.id,
    type: v.updated_at
  }));
  const disabled =
    runningSQL || !sql || !selectedDataSource || dataset?.imported || dataSourcesList.length === 0;

  useEffect(() => {
    if (dataSourcesList.length > 0) {
      const datasetDataSource = dataset?.data_source?.id;
      setSelectedDataSource(selectedDataSource ?? datasetDataSource ?? dataSourcesList[0].id);
    }
  }, [dataSourcesList]);

  return (
    <div
      className="flex items-center justify-between space-x-4 px-3 py-2.5"
      style={{
        height: 38,
        background: token.colorBgContainerDisabled,
        borderBottom: `0.5px solid ${token.colorBorder}`
      }}>
      <div className="flex items-center space-x-2">
        <Button onClick={onCopySQL} disabled={!sql}>
          Copy SQL
        </Button>

        {timestampForQuery && (
          <AppTooltip title={'Time taken to run the query'}>
            <Text className="cursor-pointer" type="tertiary">
              {formatNumber(timestampForQuery, { maximumDecimals: 2, useGrouping: false })}ms
            </Text>
          </AppTooltip>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <UndoToggle
          canRedo={indexOfCurrentSQL < sqlQueue.length - 1}
          canUndo={sqlQueue.length > 1 && indexOfCurrentSQL > 0}
          onRedo={() => {
            const selectedSQL = sqlQueue[indexOfCurrentSQL + 1];
            if (selectedSQL) {
              setSQL(selectedSQL);
            }
          }}
          onUndo={() => {
            const selectedSQL = sqlQueue[indexOfCurrentSQL - 1];
            if (selectedSQL) {
              setSQL(selectedSQL);
            }
          }}
        />

        <Select
          className="w-[200px] max-w-[320px]"
          defaultActiveFirstOption
          options={dataSourceItems}
          disabled={disabled}
          loading={dataSourcesList.length === 0}
          value={selectedDataSource}
          onChange={(v) => setSelectedDataSource(v as string)}
          labelRender={(v) => {
            const assosciated = dataSourcesList.find((d) => d.id === v.value);

            return (
              <div
                style={{
                  opacity: disabled ? 0.55 : 1
                }}
                className="flex items-center space-x-1.5 overflow-hidden">
                <Text type="tertiary">Source:</Text>
                <div className="flex h-full items-center justify-center">
                  {assosciated && (
                    <AppDataSourceIcon size={14} type={assosciated.type as DataSourceTypes} />
                  )}
                </div>
                <Text ellipsis className="">
                  {v.label}
                </Text>
              </div>
            );
          }}
          optionRender={(v) => {
            return (
              <div className="flex items-center space-x-1.5">
                <div className="flex h-full items-center">
                  <AppDataSourceIcon size={14} type={v.data.type as DataSourceTypes} />
                </div>
                <Text>{v.label}</Text>
              </div>
            );
          }}
        />
        <Button
          disabled={disabled}
          loading={runningSQL}
          type="primary"
          onClick={onRunSQL}
          className="flex space-x-0">
          <span>Run</span>
          <AppMaterialIcons icon="keyboard_command_key" />
          <AppMaterialIcons icon="keyboard_return" />
        </Button>
      </div>
    </div>
  );
};

const UndoToggle: React.FC<{
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}> = ({ onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center justify-center space-x-2">
        <Button
          type="text"
          icon={<AppMaterialIcons size={20} icon="undo" />}
          disabled={!canUndo}
          onClick={onUndo}></Button>
        <Button
          type="text"
          icon={<AppMaterialIcons size={20} icon="redo" />}
          disabled={!canRedo}
          onClick={onRedo}></Button>
      </div>

      <Divider type="vertical" className="!h-6" />
    </div>
  );
};

const SQLPanels: React.FC<{
  bottomPanel: React.ReactNode;
  topPanel: React.ReactNode;
  tableData: Record<string, string | null | number>[] | null;
}> = ({ tableData, bottomPanel, topPanel }) => {
  const bottomPanelMinSizePixels = 220; //37;
  const ref = useRef<HTMLDivElement>(null);
  const { styles, cx } = useStyles();
  const [isDragging, setIsDragging] = React.useState(false);
  const [sizes, setSizes] = React.useState<(number | string)[]>([
    'auto',
    `${bottomPanelMinSizePixels}px`
  ]);
  const tableDataLength = tableData?.length || 0;

  useEffect(() => {
    if (ref.current && tableDataLength > 0) {
      const panelGroup = ref.current.querySelector('.buster-data-panel-group') as HTMLDivElement;
      const predicatedSizePixels = tableDataLength * 46 + 49 + 50;
      if (predicatedSizePixels < panelGroup.clientHeight - 200) {
        setSizes(['auto', `${predicatedSizePixels}px`]);
      } else {
        setSizes(['auto', `${panelGroup.clientHeight / 2}px`]);
      }
    }
  }, [tableDataLength]);

  return (
    <div className="h-full w-full" id="sql-resize" ref={ref}>
      <SplitPane
        className="buster-data-panel-group"
        split="horizontal"
        sizes={sizes}
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDragEnd={() => {
          setIsDragging(false);
        }}
        onChange={(sizes) => {
          setSizes(sizes);
        }}
        resizerSize={1.2}
        sashRender={(index, active) => {
          return (
            <div
              className={cx(
                styles.slider,
                isDragging || active ? styles.showSlider : '',
                active ? 'active' : ''
              )}></div>
          );
        }}>
        <Pane minSize={'50px'}>{topPanel}</Pane>
        <Pane minSize={bottomPanelMinSizePixels}>{bottomPanel}</Pane>
      </SplitPane>
    </div>
  );
};
