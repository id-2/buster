import { useCreatePermissionGroup } from '@/api/busterv2/permission_groups/queryRequests';
import { AppModal } from '@/components';
import { useMemoizedFn } from 'ahooks';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input, InputRef } from 'antd';
import { useBusterNotifications } from '@/context/BusterNotifications';

interface NewPermissionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
}

export const NewPermissionGroupModal: React.FC<NewPermissionGroupModalProps> = React.memo(
  ({ isOpen, onClose, datasetId }) => {
    const { mutateAsync, isPending } = useCreatePermissionGroup(datasetId);
    const inputRef = useRef<InputRef>(null);
    const { openInfoMessage } = useBusterNotifications();

    const onCreateNewPermissionGroup = useMemoizedFn(async () => {
      const inputValue = inputRef.current?.input?.value;
      if (!inputValue) {
        openInfoMessage('Please enter a name for the permission group');
        inputRef.current?.focus();
        return;
      }
      await mutateAsync({
        name: inputValue
      });
      onClose();
    });

    const header = useMemo(() => {
      return {
        title: 'New permission group',
        description: 'Create a new permission group'
      };
    }, []);

    const footer = useMemo(() => {
      return {
        secondaryButton: {
          text: 'Cancel',
          onClick: onClose
        },
        primaryButton: {
          text: 'Create permission group',
          onClick: onCreateNewPermissionGroup,
          loading: isPending
        }
      };
    }, [isPending]);

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, [isOpen]);

    return (
      <AppModal open={isOpen} onClose={onClose} header={header} footer={footer}>
        <Input ref={inputRef} placeholder="Name of permission group" />
      </AppModal>
    );
  }
);

NewPermissionGroupModal.displayName = 'NewPermissionGroupModal';
