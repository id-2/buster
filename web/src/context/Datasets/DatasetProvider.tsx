import React, { PropsWithChildren, useContext, useRef, useState } from 'react';
import { useBusterWebSocket } from '../BusterWebSocket';
import { BusterDataset, BusterDatasetListItem } from '@/api/busterv2/datasets';
import { useMemoizedFn, useMount, useUnmount } from 'ahooks';
import { useParams } from 'next/navigation';
import {
  DatasetPostEmit,
  DatasetUpdateColumnEmit,
  DatasetUpdateEmit
} from '@/api/buster-socket/datasets';
import { useUserConfigContextSelector } from '../Users';
import { timeout } from '@/utils';
import { useBusterNotifications } from '../BusterNotifications';
import {
  ContextSelector,
  createContext,
  useContextSelector
} from '@fluentui/react-context-selector';
import { useIndividualDatasetHook } from './useIndividualDatasetHook';

export const useDatasets = () => {
  const busterSocket = useBusterWebSocket();
  const { openedDatasetId } = useParams<{ openedDatasetId: string }>();
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);
  const [datasetsList, setDatasetsList] = useState<BusterDatasetListItem[]>([]);
  const [importedDatasets, setImportingDatasets] = useState<BusterDatasetListItem[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [openNewDatasetModal, setOpenNewDatasetModal] = useState(false);
  const fetchedAt = useRef<number>(0);

  const onInitializeDatasetsList = (datasets: BusterDatasetListItem[]) => {
    setDatasetsList(datasets);
    setLoadingDatasets(false);
    fetchedAt.current = Date.now();
  };

  const onUpdateDatasetListItem = (newDataset: BusterDatasetListItem) => {
    setDatasetsList((prevDatasets) => {
      return prevDatasets.map((dataset) => {
        if (dataset.id === newDataset.id) return newDataset;
        return dataset;
      });
    });
  };

  const initDatasetsList = useMemoizedFn(
    async ({ threadModalView }: { threadModalView: boolean }, ts = 50): Promise<unknown> => {
      const isAdminView = !threadModalView || isAdmin;
      const listenerType = isAdminView
        ? '/datasets/list:listDatasetsAdmin'
        : '/datasets/list:listDatasets';

      busterSocket.emitAndOnce({
        emitEvent: {
          route: '/datasets/list',
          payload: {
            page_size: 2000,
            page: 0,
            admin_view: isAdminView
          }
        },
        responseEvent: {
          route: listenerType,
          callback: onInitializeDatasetsList
        }
      });

      return undefined;
    }
  );

  const initImportedDatasets = useMemoizedFn(async () => {
    const _onSetImportingDatasets = async (datasets: BusterDatasetListItem[]) => {
      setImportingDatasets(datasets);
    };
    await busterSocket.emitAndOnce({
      emitEvent: {
        route: '/datasets/list',
        payload: {
          page_size: 1000,
          page: 0,
          admin_view: true,
          imported: true
        }
      },
      responseEvent: {
        route: '/datasets/list:listDatasetsAdmin',
        callback: _onSetImportingDatasets
      }
    });
  });

  //INDIVIDUAL DATASET
  const individualOptions = useIndividualDatasetHook({
    initDatasetsList,
    setDatasetsList
  });

  return {
    datasetsList,
    initDatasetsList,
    onUpdateDatasetListItem,
    loadingDatasets,
    openedDatasetId,
    openNewDatasetModal,
    setOpenNewDatasetModal,
    initImportedDatasets,
    importedDatasets,
    fetchedAt,
    ...individualOptions
  };
};

const BusterDatasets = createContext<ReturnType<typeof useDatasets>>(
  {} as ReturnType<typeof useDatasets>
);

export const DatasetProviders: React.FC<PropsWithChildren> = ({ children }) => {
  const Datasets = useDatasets();

  return <BusterDatasets.Provider value={Datasets}>{children}</BusterDatasets.Provider>;
};

export const useDatasetContextSelector = <T,>(
  selector: ContextSelector<ReturnType<typeof useDatasets>, T>
) => useContextSelector(BusterDatasets, selector);
