import React from 'react';
import {
  DatasetPostEmit,
  DatasetUpdateEmit,
  DatasetUpdateColumnEmit
} from '@/api/buster-socket/datasets';
import { BusterDataset } from '@/api/busterv2/datasets';
import { useMemoizedFn, useMount, useUnmount } from 'ahooks';
import { useState, useRef } from 'react';
import { useBusterWebSocket } from '../BusterWebSocket';
import { useBusterNotifications } from '../BusterNotifications';
import { useDatasetContextSelector } from './DatasetProvider';

export const useIndividualDatasetHook = ({}: {}) => {
  const busterSocket = useBusterWebSocket();

  const { openConfirmModal } = useBusterNotifications();
  const [datasets, setDatasets] = useState<Record<string, BusterDataset>>({});
  const subscribedDatasets = useRef<Record<string, boolean>>({});

  const subscribeToDataset = useMemoizedFn((datasetId: string) => {
    if (subscribedDatasets.current[datasetId] || !datasetId) return;
    busterSocket.emitAndOnce({
      emitEvent: {
        route: '/datasets/get',
        payload: {
          id: datasetId
        }
      },
      responseEvent: {
        route: '/datasets/get:getDataset',
        callback: _onSetDataset
      }
    });
    subscribedDatasets.current[datasetId] = true;
  });

  const unsubscribeFromDataset = useMemoizedFn((datasetId: string) => {
    busterSocket.off({
      route: '/datasets/get:getDataset',
      callback: _onSetDataset
    });
  });

  const _onSetDataset = useMemoizedFn((dataset: BusterDataset) => {
    setDatasets((prevDatasets) => {
      const previousDataset = prevDatasets[dataset.id];
      return {
        ...prevDatasets,
        [dataset.id]: { ...dataset, data: dataset.data || previousDataset?.data }
      };
    });
  });

  const createDataset = useMemoizedFn(async (params: DatasetPostEmit['payload']) => {
    const res = await busterSocket.emitAndOnce({
      emitEvent: {
        route: '/datasets/post',
        payload: params
      },
      responseEvent: {
        route: '/datasets/post:postDataset',
        callback: _onSetDataset
      }
    });

    return res as BusterDataset;
  });

  const onDeleteDataset = useMemoizedFn(async (datasetId: string, ignoreConfirm = false) => {
    const method = async () => {
      await busterSocket.emitAndOnce({
        emitEvent: {
          route: '/datasets/delete',
          payload: {
            ids: [datasetId]
          }
        },
        responseEvent: {
          route: '/datasets/delete:deleteDatasets',
          callback: () => {
            setDatasets((prevDatasets) => {
              const newDatasets = { ...prevDatasets };
              delete newDatasets[datasetId];
              return newDatasets;
            });
            console.log('delete dataset', datasetId);
          }
        }
      });
    };

    if (ignoreConfirm) {
      await method();
    } else {
      await openConfirmModal({
        title: 'Delete dataset',
        content: 'Are you sure you want to delete this dataset?',
        onOk: method
      });
    }
  });

  const onUpdateDataset = useMemoizedFn(
    async (payload: Partial<DatasetUpdateEmit['payload']> & { id: string }) => {
      try {
        return await busterSocket.emitAndOnce({
          emitEvent: {
            route: '/datasets/update',
            payload
          },
          responseEvent: {
            route: '/datasets/update:updateDataset',
            callback: _onSetDataset
          }
        });
      } catch (error) {
        throw error;
      }
    }
  );

  const onUpdateDatasetColumn = useMemoizedFn(
    async ({
      columnId,
      ...params
    }: Omit<DatasetUpdateColumnEmit['payload'], 'id'> & { columnId: string }) => {
      return busterSocket.emitAndOnce({
        emitEvent: {
          route: '/datasets/column/update',
          payload: { ...params, id: columnId }
        },
        responseEvent: {
          route: '/datasets/column/update:updateDatasetColumn',
          callback: _onSetDataset
        }
      });
    }
  );

  return {
    datasets,
    subscribeToDataset,
    unsubscribeFromDataset,
    createDataset,
    onDeleteDataset,
    onUpdateDataset,
    onUpdateDatasetColumn
  };
};

export const useIndividualDataset = ({ datasetId }: { datasetId: string }) => {
  const subscribeToDataset = useDatasetContextSelector((state) => state.subscribeToDataset);
  const unsubscribeFromDataset = useDatasetContextSelector((state) => state.unsubscribeFromDataset);
  const dataset = useDatasetContextSelector((state) => state.datasets[datasetId]);

  useMount(() => {
    subscribeToDataset(datasetId);
  });

  useUnmount(() => {
    unsubscribeFromDataset(datasetId);
  });

  return { dataset };
};
