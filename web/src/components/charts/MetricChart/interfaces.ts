import { IBusterThreadMessageChartConfig } from '@/api/busterv2';
import { BusterChartPropsBase, BusterChartProps, MetricChartProps } from '../interfaces';

export interface BusterMetricChartProps extends MetricChartProps, BusterChartPropsBase {
  columnLabelFormats: NonNullable<BusterChartProps['columnLabelFormats']>;
}
