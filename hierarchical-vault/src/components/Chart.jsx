import React from 'react';

const Chart = ({ 
  data = [], 
  type = 'bar', 
  title = '', 
  height = 300,
  className = '' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-${height} bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">لا توجد بيانات للعرض</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));

  const renderBarChart = () => {
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const barHeight = Math.max((percentage / 100) * (height - 100), 20);
          
          return (
            <div key={index} className="flex items-end space-x-4 space-x-reverse">
              <div className="w-20 text-sm text-gray-600 text-right">
                {item.label}
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div 
                    className="bg-primary-500 rounded-t"
                    style={{ height: `${barHeight}px` }}
                  />
                  <div className="absolute top-0 right-0 transform translate-x-full -translate-y-1/2 text-xs text-gray-600">
                    {item.value}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = maxValue > 0 ? 100 - ((item.value - minValue) / (maxValue - minValue)) * 100 : 50;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={points}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = maxValue > 0 ? 100 - ((item.value - minValue) / (maxValue - minValue)) * 100 : 50;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <span key={index}>{item.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    let cumulativePercentage = 0;
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
    ];

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            cumulativePercentage += percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {data.reduce((sum, item) => sum + item.value, 0)}
            </div>
            <div className="text-xs text-gray-500">إجمالي</div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
      {type === 'pie' && (
        <div className="mt-4 space-y-2">
          {data.map((item, index) => {
            const colors = [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
            ];
            return (
              <div key={index} className="flex items-center space-x-2 space-x-reverse">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Chart;