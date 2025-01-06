import { ITooltipItem } from '@/components/charts/BusterChartTooltip/interfaces';
import { BusterChartConfigProps } from '@/components/charts/interfaces';
import type { Chart, ChartDataset, TooltipItem, ChartTypeRegistry } from 'chart.js';
import { formatChartLabel } from '../../../helpers';
import { formatChartValueDelimiter } from '@/components/charts/commonHelpers';
import { getPercentage } from './helper';

export const barAndLineTooltipHelper = (
  datasets: ChartDataset[],
  dataPoints: TooltipItem<keyof ChartTypeRegistry>[],
  chart: Chart,
  columnLabelFormats: NonNullable<BusterChartConfigProps['columnLabelFormats']>,
  hasMultipleMeasures: boolean,
  keyToUsePercentage: string[],
  hasCategoryAxis: boolean,
  hasMultipleShownDatasets: boolean
): ITooltipItem[] => {
  const dataPoint = dataPoints[0];
  const dataPointDataset = dataPoint.dataset;
  const dataPointDataIndex = dataPoint.dataIndex;
  const tooltipDatasets = datasets.filter((dataset) => dataset.hidden);
  const datapointIsInTooltip = tooltipDatasets.some(
    (dataset) => dataset.label === dataPointDataset.label
  );

  if (!datapointIsInTooltip) {
    return [];
  }

  const tooltipItems = tooltipDatasets.map<ITooltipItem>((tooltipDataset) => {
    const usePercentage = keyToUsePercentage.includes(tooltipDataset.label as string);
    const assosciatedData = datasets.find((dataset) => dataset.label === tooltipDataset.label);
    const colorItem = assosciatedData?.backgroundColor as string;
    const color = assosciatedData
      ? typeof colorItem === 'function'
        ? (assosciatedData?.borderColor as string)
        : (assosciatedData?.backgroundColor as string)
      : undefined;

    const rawValue = tooltipDataset.data[dataPoint.dataIndex] as number;

    const formattedPercentage = usePercentage
      ? getPercentage(
          rawValue,
          dataPointDataIndex,
          datasets.findIndex((dataset) => dataset.label === tooltipDataset.label),
          tooltipDataset.label as string,
          columnLabelFormats,
          chart,
          hasMultipleShownDatasets
        )
      : undefined;

    return {
      seriesType: 'bar',
      usePercentage,
      color,
      formattedLabel: formatChartLabel(
        tooltipDataset.label as string,
        columnLabelFormats,
        hasMultipleMeasures,
        hasCategoryAxis
      ),
      values: [
        {
          formattedValue: formatChartValueDelimiter(
            tooltipDataset.data[dataPoint.dataIndex] as number,
            tooltipDataset.label as string,
            columnLabelFormats
          ),
          formattedLabel: tooltipDataset.label as string,
          formattedPercentage
        }
      ]
    };
  });

  return tooltipItems;

  return datasets
    .map<ITooltipItem>((dataset, datasetIndex) => {
      const dataPointDataIndex = dataPoints[0]!.dataIndex;
      const isHiddenViaLegend = chart.getDatasetMeta(datasetIndex).hidden;

      const formattedLabel = formatChartLabel(
        dataset.label as string,
        columnLabelFormats,
        hasMultipleMeasures,
        hasCategoryAxis
      );
      const rawValue = dataset.data[dataPointDataIndex] as number;
      const formattedValue = formatChartValueDelimiter(
        rawValue,
        dataset.label as string,
        columnLabelFormats
      );

      const usePercentage = keyToUsePercentage.includes(dataset.label as string);
      const formattedPercentage = usePercentage
        ? getPercentage(
            rawValue,
            dataPointDataIndex,
            datasetIndex,
            dataset.label as string,
            columnLabelFormats,
            chart,
            hasMultipleShownDatasets
          )
        : undefined;

      //the line chart fill has a function and we fallback onto border color
      const color: string =
        typeof dataset.backgroundColor === 'function'
          ? (dataset.borderColor as string)
          : (dataset.backgroundColor as string);

      return {
        hidden: isHiddenViaLegend,
        seriesType: 'bar',
        usePercentage,
        color,
        formattedLabel,
        values: [{ formattedValue, formattedLabel, formattedPercentage }]
      };
    })
    .filter((v) => !v.hidden);
};
