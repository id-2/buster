import type { DatasetOption } from '@/components/charts/chartHooks';
import type { ChartProps } from '../../core/types';
import type { ChartType as ChartJSChartType } from 'chart.js';

export const defaultTooltipSeriesBuilder = ({
  datasetOptions,
  tooltipKeys
}: {
  datasetOptions: DatasetOption[];
  tooltipKeys: string[];
}): ChartProps<ChartJSChartType>['data']['datasets'] => {
  const selectedDataset = datasetOptions.at(-1)!;
  const tooltipSeries: ChartProps<ChartJSChartType>['data']['datasets'] = [];

  tooltipKeys.forEach((tooltipKey) => {
    const indexOfKey = selectedDataset.dimensions.indexOf(tooltipKey);
    tooltipSeries.push({
      hidden: true,
      label: tooltipKey,
      data: selectedDataset.source.map((item) => item[indexOfKey] as number)
    });
  });

  return tooltipSeries;
};
