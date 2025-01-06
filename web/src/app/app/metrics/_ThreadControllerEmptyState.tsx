import { Empty } from 'antd';
import React from 'react';

export const ThreadControllerEmptyState: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      <Empty description="No thread selected" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
};
