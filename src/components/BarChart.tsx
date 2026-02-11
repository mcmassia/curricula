import React from 'react';

interface ChartData {
    label: string;
    value: number;
}

interface BarChartProps {
    data: ChartData[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const chartHeight = 150;
    const barWidth = 40;
    const barMargin = 20;
    const chartWidth = data.length * (barWidth + barMargin);

    return (
        <div className="w-full overflow-x-auto p-4">
            <svg width={chartWidth} height={chartHeight + 40} className="font-sans">
                <g>
                    {data.map((d, i) => {
                        const barHeight = (d.value / maxValue) * chartHeight;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight;

                        return (
                            <g key={d.label}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    rx="4"
                                    ry="4"
                                    className="fill-current text-gray-700 hover:text-gray-600 transition-colors"
                                />
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 8}
                                    textAnchor="middle"
                                    className="text-sm fill-current text-gray-200 font-semibold"
                                >
                                    {d.value}
                                </text>
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    className="text-xs fill-current text-gray-400"
                                >
                                    {d.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};
