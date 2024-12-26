import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Box } from '@chakra-ui/react';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface ChartProps {
  timeLabels: string[];
  priceData: { [key: string]: number[] };
  selectedPair: string[];
  coin1Price: number;
  coin2Price: number;
  coin1Symbol: string;
  coin2Symbol: string;
}

export interface ChartRef {
  updateChart: () => void;
}

const MAX_DATA_POINTS = 60;

const Chart = forwardRef<ChartRef, ChartProps>(
  (
    {
      timeLabels,
      priceData,
      selectedPair,
      coin1Price,
      coin2Price,
      coin1Symbol,
      coin2Symbol,
    },
    ref
  ) => {
    const chartRef = React.useRef<ChartJS<'line'> | null>(null);
    const [chartData, setChartData] = useState<ChartData<'line'>>({
      labels: [],
      datasets: [],
    });
    // {When BCH or SOL is on Y axis, displaying 1 decimal place}
    const formatTickValue = (value: string | number, symbol: string) => {
      if (typeof value === 'number') {
        if (symbol === 'SOL' || symbol === 'BCH') {
          return Number(value.toFixed(1)).toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          });
        }
        return value.toLocaleString(undefined);
      }
      return value;
    };

    useImperativeHandle(ref, () => ({
      updateChart: () => {
        if (chartRef.current) {
          chartRef.current.update();
        }
      },
    }));

    useEffect(() => {
      const newLabels = timeLabels.slice(-MAX_DATA_POINTS);
      const newData1 =
        priceData[selectedPair[0]]?.slice(-MAX_DATA_POINTS) || [];
      const newData2 =
        priceData[selectedPair[1]]?.slice(-MAX_DATA_POINTS) || [];

      setChartData({
        labels: newLabels,
        datasets: [
          {
            label: selectedPair[0],
            data: newData1,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.5,
            yAxisID: 'y-axis-1',
          },
          {
            label: selectedPair[1],
            data: newData2,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.5,
            yAxisID: 'y-axis-2',
          },
        ],
      });

      if (chartRef.current) {
        chartRef.current.update('none');
      }
    }, [timeLabels, priceData, selectedPair, coin1Price, coin2Price]);

    // Y1: Top 0.0625%, Bottom 0.1875%
    // Y2: Top 0.1875%, Bottom 0.0625%
    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'linear',
      },

      scales: {
        x: {
          type: 'category' as const,
          ticks: {
            maxTicksLimit: window.innerWidth < 768 ? 15 : 30,
            font: {
              weight: 'bold',
            },
            callback: function (val, index) {
              return index === 0 ? '' : this.getLabelForValue(val as number);
            },
          },
          grid: {
            drawOnChartArea: true,
            color: 'rgba(226, 232, 240, 0.6)',
            lineWidth: 0.75,
          },
        },
        'y-axis-1': {
          type: 'linear' as const,
          position: 'left',
          ticks: {
            maxTicksLimit: 7,
            callback: (value) => formatTickValue(value, coin1Symbol),
            font: {
              family: 'Arial, sans-serif',
              weight: 'bold',
            },
          },
          grid: { drawOnChartArea: false },
          beginAtZero: false,
          suggestedMin: coin1Price * 0.998125,
          suggestedMax: coin1Price * 1.000625,
        },
        'y-axis-2': {
          type: 'linear' as const,
          position: 'right',
          ticks: {
            maxTicksLimit: 7,
            callback: (value) => formatTickValue(value, coin2Symbol),
            font: {
              family: 'Arial, sans-serif',
              weight: 'bold',
            },
          },
          grid: { drawOnChartArea: false },
          beginAtZero: false,
          suggestedMin: coin2Price * 0.999375,
          suggestedMax: coin2Price * 1.001875,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${coin1Symbol}/${coin2Symbol} Gap Index Chart`,
          font: {
            family: 'Arial, sans-serif',
            size: 15,
            weight: 'bold',
          },
          color: '#062127',
          padding: {
            top: 15,
            bottom: 15,
          },
        },
        annotation: {
          annotations: {
            coin1Line: {
              type: 'line',
              yMin: coin1Price,
              yMax: coin1Price,
              yScaleID: 'y-axis-1',
              borderColor: '#E53E3E',
              borderWidth: 2,
              borderDash: [5, 5],
            },
            coin2Line: {
              type: 'line',
              yMin: coin2Price,
              yMax: coin2Price,
              yScaleID: 'y-axis-2',
              borderColor: '#3182CE',
              borderWidth: 2,
              borderDash: [5, 5],
            },
            coin1Zone: {
              type: 'box',
              yMin: coin1Price,
              yMax: Infinity,
              yScaleID: 'y-axis-1',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderWidth: 0,
            },
            coin2Zone: {
              type: 'box',
              yMin: -Infinity,
              yMax: coin2Price,
              yScaleID: 'y-axis-2',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              borderWidth: 0,
            },
          },
        },
      },
    };

    return (
      <Box
        position="relative"
        w="100%"
        h="400px"
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </Box>
    );
  }
);

Chart.displayName = 'Chart';

export default Chart;
