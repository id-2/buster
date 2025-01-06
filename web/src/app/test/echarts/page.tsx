'use client';

import { BusterThreadMessage } from '@/api/busterv2';
import {
  BusterChartProps,
  BusterChart,
  CategoryAxisStyleConfig,
  IColumnLabelFormat,
  ViewType
} from '@/components/charts';
import { ChartType } from '@/components/charts/';
import { faker } from '@faker-js/faker';
import { useMount } from 'ahooks';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

const categories = ['January', 'February', 'March'];
const secondaryCategories = ['Category 1', 'Category 2', 'Category 3'];
const twoNames = ['John', 'Jane', 'Jim'];
const data = twoNames.flatMap((name, nameIndex) =>
  categories.flatMap((category, categoryIndex) =>
    Array.from({ length: 1 }, () => ({
      name,
      category,
      sales: faker.number.int({ min: 100, max: 1000 }),
      expenses: faker.number.int({ min: 50, max: 150 }),
      date: faker.date.past({ years: 2 }).toISOString(),
      secondary: secondaryCategories[categoryIndex % secondaryCategories.length],
      employee_count: faker.number.int({ min: 10, max: 14 })
    }))
  )
);

const tenDates = Array.from({ length: 30 }, () =>
  faker.date.past({ years: 1 }).toISOString()
).sort();
const lineData = twoNames.flatMap((name, nameIndex) =>
  tenDates.map((date, index) => ({
    date,
    sales: faker.number.int({
      min: (nameIndex + 1) * 20 * 100 + index * 1.73,
      max: (nameIndex + 1) * 20 * 100 + index * 50
    }),
    expenses: faker.number.int({ min: 150, max: 3550 }),
    category: name
  }))
);

// data.push({
//   name: 'John',
//   category: 'January',
//   sales: 2000,
//   expenses: 50,
//   date: faker.date.recent().toISOString(),
//   secondary: secondaryCategories[0],
//   employee_count: 10
// });
const scatterData = Array.from({ length: 9 }, (_, index) => ({
  employee_count: faker.number.int({ min: 10, max: 20 }),
  sales: faker.number.int({ min: 10, max: 50 }),
  name: faker.person.fullName(),
  category: faker.helpers.arrayElement(categories),
  expenses: faker.number.int({ min: 1, max: 30 }),
  sizeSwag: faker.number.int({ min: 100, max: 190 })
}));

const columnLabelFormats: Record<string, IColumnLabelFormat> = {
  sales: { style: 'currency', currency: 'USD', columnType: 'number' },
  expenses: { style: 'currency', currency: 'EUR', columnType: 'number' },
  date: { style: 'date', dateFormat: undefined, columnType: 'date' },
  name: { style: 'string', columnType: 'string' },
  category: { style: 'string', columnType: 'string' },
  employee_count: {
    style: 'currency',
    currency: 'MXN',
    compactNumbers: false,
    columnType: 'number'
  }
};

const columnSettings: BusterChartProps['columnSettings'] = {
  sales: { showDataLabels: true, columnVisualization: 'bar' },
  expenses: { showDataLabels: true, columnVisualization: 'bar' },
  employee_count: { showDataLabels: false, columnVisualization: 'bar' },
  sizeSwag: { showDataLabels: false, columnVisualization: 'bar' }
};

export default function EChartsPage() {
  const [category, setCategory] = useState<string[]>([]);
  const [type, setType] = useState<ChartType>(ChartType.Pie);
  useHotkeys('up', (event) => {
    setCategory((prev) => {
      if (prev.length === 0) {
        return ['category'];
      }
      return [];
    });
  });

  useHotkeys('left', (event) => {
    setType((prev) => {
      if (prev === ChartType.Line) {
        return ChartType.Bar;
      }
      if (prev === ChartType.Bar) {
        return ChartType.Scatter;
      }
      if (prev === ChartType.Scatter) {
        return ChartType.Pie;
      }
      return ChartType.Line;
    });
  });

  const chartType: ChartType = type;

  const chartData = useMemo(() => {
    if (chartType === ChartType.Line) {
      return lineData;
    }
    return chartType === ChartType.Scatter ? scatterData : data;
  }, [chartType]);

  const barAndLineAxis = useMemo(() => {
    return {
      x: ['date'],
      y: ['sales', 'expenses'],
      category
      //   tooltip: ['employee_count', 'sales', 'expenses', 'name']
    };
  }, [category]);

  const scatterAxis = useMemo(() => {
    return {
      x: ['employee_count'],
      y: ['sales'],

      category,
      size: ['sizeSwag'] as [string]
    };
  }, [category]);

  const pieConfig = useMemo(() => {
    return {
      axis: {
        x: ['date'],
        y: ['sales']
        //   tooltip: ['sales', 'expenses', 'employee_count']
      },
      minimumPiePercentage: 5
    };
  }, []);

  return (
    <div className="flex h-[1000px] w-[90vw] flex-col rounded bg-white">
      <div className="h-[500px] w-full p-3">
        <BusterChart
          data={chartData}
          selectedChartType={chartType as ChartType.Bar}
          selectedView={ViewType.Chart}
          //barSortBy={['desc', 'asc']}
          loading={false}
          barAndLineAxis={barAndLineAxis}
          pieChartAxis={pieConfig.axis}
          scatterAxis={scatterAxis}
          comboChartAxis={barAndLineAxis}
          columnLabelFormats={columnLabelFormats}
          scatterDotSize={[10, 20]}
          columnSettings={columnSettings}
          metricColumnId="sales"
          barLayout="vertical"
          xAxisShowAxisLabel={true}
          yAxisShowAxisLabel={true}
          xAxisAxisTitle="Date"
          yAxisAxisTitle="Sales"
          columnMetadata={undefined}
        />
      </div>
    </div>
  );
}
