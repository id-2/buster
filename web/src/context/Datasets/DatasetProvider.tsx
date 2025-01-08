import React, { PropsWithChildren, useState } from 'react';
import { BusterDatasetListItem } from '@/api/busterv2/datasets';
import { useParams } from 'next/navigation';
import {
  ContextSelector,
  createContext,
  useContextSelector
} from '@fluentui/react-context-selector';
import { useIndividualDatasetHook } from './useIndividualDatasetHook';

export const useDatasets = () => {
  const { openedDatasetId } = useParams<{ openedDatasetId: string }>();
  const [openNewDatasetModal, setOpenNewDatasetModal] = useState(false);

  const onUpdateDatasetListItem = (newDataset: BusterDatasetListItem) => {
    // setDatasetsList((prevDatasets) => {
    //   return prevDatasets.map((dataset) => {
    //     if (dataset.id === newDataset.id) return newDataset;
    //     return dataset;
    //   });
    // });
  };

  //INDIVIDUAL DATASET
  const individualOptions = useIndividualDatasetHook({});

  return {
    onUpdateDatasetListItem,
    openedDatasetId,
    openNewDatasetModal,
    setOpenNewDatasetModal,
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
