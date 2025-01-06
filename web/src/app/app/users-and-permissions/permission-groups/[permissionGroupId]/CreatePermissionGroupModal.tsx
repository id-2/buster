import { useAppLayoutContextSelector } from '@/context/BusterAppLayout';
import { BusterRoutes } from '@/routes';
import { inputHasText } from '@/utils';
import { useMemoizedFn } from 'ahooks';
import { Input, InputRef } from 'antd';
import React, { useEffect } from 'react';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { AppModal } from '@/components';

export const CreatePermissionGroupModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = React.memo(({ open, onClose }) => {
  const [submitting, setSubmitting] = React.useState(false);
  const inputRef = React.useRef<InputRef>(null);
  const [title, setTitle] = React.useState('');
  const onChangePage = useAppLayoutContextSelector((s) => s.onChangePage);
  const createPermissionGroup = usePermissionsContextSelector((x) => x.createPermissionGroup);

  const disableApply = !inputHasText(title);

  const onClosePreflight = useMemoizedFn(() => {
    onClose();
  });

  const createNewPermissionGroupPreflight = useMemoizedFn(async () => {
    if (disableApply || submitting) return;
    setSubmitting(true);
    const res = await createPermissionGroup({ name: title });
    if (res) {
      onChangePage({
        route: BusterRoutes.APP_PERMISSIONS_ID,
        permissionId: res.id
      });
    }
    setTimeout(() => {
      onClose();
      setSubmitting(false);
    }, 250);
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [open]);

  return (
    <AppModal
      open={open}
      onClose={onClosePreflight}
      header={{
        title: 'Create permission group',
        description:
          'Once created, you will be able to add datsets, teams, and users to the permission group'
      }}
      footer={{
        primaryButton: {
          text: 'Create permission group',
          onClick: createNewPermissionGroupPreflight,
          loading: submitting,
          disabled: disableApply
        }
      }}>
      <Input
        ref={inputRef}
        value={title}
        disabled={submitting}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Permission group name"
        onPressEnter={createNewPermissionGroupPreflight}
      />
    </AppModal>
  );
});
CreatePermissionGroupModal.displayName = 'CreatePermissionGroupModal';
