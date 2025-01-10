import React from 'react';
import { Title, Text } from '@/components';

export const HeaderExplanation: React.FC<{ className?: string }> = React.memo(
  ({ className = '' }) => {
    return (
      <div className={`flex flex-col space-y-1.5 ${className}`}>
        <Title level={4}>Access & lineage</Title>
        <Text type="secondary">
          {`View which users can query this dataset. Lineage is provided to show where each user’s
          access originates from.`}
        </Text>
      </div>
    );
  }
);
HeaderExplanation.displayName = 'HeaderExplanation';
