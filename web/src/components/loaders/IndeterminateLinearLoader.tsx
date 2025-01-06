import React from 'react';

export const IndeterminateLinearLoader: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  height?: number;
  trackColor?: string;
  valueColor?: string;
}> = ({ className = '', trackColor, valueColor, style, height = 2 }) => {
  return (
    <div
      className={`indeterminate-progress-bar ${className}`}
      style={{ ...style, height, backgroundColor: trackColor }}>
      <div
        className="indeterminate-progress-bar-value bg-buster-purple"
        style={{
          backgroundColor: valueColor
        }}></div>
    </div>
  );
};
