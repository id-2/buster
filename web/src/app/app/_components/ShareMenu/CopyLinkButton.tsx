import { AppMaterialIcons } from '@/components';
import { Button } from 'antd';
import React from 'react';

export const CopyLinkButton: React.FC<{
  onCopyLink: () => void;
}> = React.memo(({ onCopyLink }) => {
  return (
    <Button type="text" onClick={onCopyLink} icon={<AppMaterialIcons icon="link" size={16} />}>
      Copy link
    </Button>
  );
});

CopyLinkButton.displayName = 'CopyLinkButton';
