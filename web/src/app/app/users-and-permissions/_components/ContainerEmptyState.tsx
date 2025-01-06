import React from 'react';
import { Text, Title } from '@/components';
import { Button } from 'antd';

export const ContainerEmptyState: React.FC<{
  title: string;
  description: string;
  onClick: () => void;
  buttonText: string;
}> = ({ title, buttonText, description, onClick }) => {
  return (
    <div className="flex h-[200px] w-full flex-col items-center justify-center space-y-4">
      <Title level={4}>{title}</Title>

      <Text type="secondary">{description}</Text>

      <Button type="default" onClick={onClick}>
        {buttonText}
      </Button>
    </div>
  );
};
