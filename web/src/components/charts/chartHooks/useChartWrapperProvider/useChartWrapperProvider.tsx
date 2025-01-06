import {
  createContext,
  ContextSelector,
  useContextSelector
} from '@fluentui/react-context-selector';
import React, { PropsWithChildren } from 'react';

interface IChartWrapperContext {
  width: number;
  inactiveDatasets: Record<string, boolean>;
}

const ChartWrapperContext = createContext<IChartWrapperContext>({} as IChartWrapperContext);

export const ChartWrapperProvider: React.FC<PropsWithChildren<IChartWrapperContext>> = ({
  children,
  width,
  inactiveDatasets
}) => {
  return (
    <ChartWrapperContext.Provider value={{ inactiveDatasets, width }}>
      {children}
    </ChartWrapperContext.Provider>
  );
};

export const useChartWrapperContextSelector = <T,>(
  selector: ContextSelector<IChartWrapperContext, T>
) => useContextSelector(ChartWrapperContext, selector);
