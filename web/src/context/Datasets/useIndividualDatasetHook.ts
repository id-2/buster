import React from 'react';
import {
  DatasetPostEmit,
  DatasetUpdateEmit,
  DatasetUpdateColumnEmit
} from '@/api/buster-socket/datasets';
import { useGetDatasetData, useGetDatasetMetadata } from '@/api/busterv2/datasets';
import { useMemoizedFn } from 'ahooks';
import { useBusterWebSocket } from '../BusterWebSocket';
import { useBusterNotifications } from '../BusterNotifications';

export const useIndividualDatasetHook = ({}: {}) => {
  const busterSocket = useBusterWebSocket();
  const { openConfirmModal } = useBusterNotifications();

  const createDataset = useMemoizedFn(async (params: DatasetPostEmit['payload']) => {
    // const res = await busterSocket.emitAndOnce({
    //   emitEvent: {
    //     route: '/datasets/post',
    //     payload: params
    //   },
    //   responseEvent: {
    //     route: '/datasets/post:postDataset',
    //     callback: _onSetDataset
    //   }
    // });
    // return res as BusterDataset;

    return {
      id: 'nate_rulez'
    };
  });

  const onDeleteDataset = useMemoizedFn(async (datasetId: string, ignoreConfirm = false) => {
    const method = async () => {
      // await busterSocket.emitAndOnce({
      //   emitEvent: {
      //     route: '/datasets/delete',
      //     payload: {
      //       ids: [datasetId]
      //     }
      //   },
      //   responseEvent: {
      //     route: '/datasets/delete:deleteDatasets',
      //     callback: () => {
      //       setDatasets((prevDatasets) => {
      //         const newDatasets = { ...prevDatasets };
      //         delete newDatasets[datasetId];
      //         return newDatasets;
      //       });
      //       console.log('delete dataset', datasetId);
      //     }
      //   }
      // });
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
        // return await busterSocket.emitAndOnce({
        //   emitEvent: {
        //     route: '/datasets/update',
        //     payload
        //   },
        //   responseEvent: {
        //     route: '/datasets/update:updateDataset',
        //     callback: _onSetDataset
        //   }
        // });
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
      // return busterSocket.emitAndOnce({
      //   emitEvent: {
      //     route: '/datasets/column/update',
      //     payload: { ...params, id: columnId }
      //   },
      //   responseEvent: {
      //     route: '/datasets/column/update:updateDatasetColumn',
      //     callback: _onSetDataset
      //   }
      // });
    }
  );

  return {
    createDataset,
    onDeleteDataset,
    onUpdateDataset,
    onUpdateDatasetColumn
  };
};

export const useIndividualDataset = ({ datasetId }: { datasetId: string }) => {
  const { data: dataset } = useGetDatasetMetadata(datasetId);
  const { data: datasetData } = useGetDatasetData(datasetId);
  return { dataset, datasetData };
};
