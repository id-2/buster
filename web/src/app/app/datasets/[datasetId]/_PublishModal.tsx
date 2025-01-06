import { BusterDataset } from '@/api/busterv2/datasets';
import { AppModal, ItemContainer, PulseLoader, Title } from '@/components';
import { useDatasetContextSelector } from '@/context/Datasets';
import { useAntToken } from '@/styles/useAntToken';
import { formatDate, inputHasText, makeHumanReadble } from '@/utils';
import { useMemoizedFn } from 'ahooks';
import { Input, Modal, Select, InputRef, Divider } from 'antd';
import React, { useContext, useEffect, useMemo } from 'react';
import { Text } from '@/components';
import { AppDataSourceIcon } from '@/components/icons/AppDataSourceIcons';
import { useBusterNotifications } from '@/context/BusterNotifications';

const gridClass = `grid grid-cols-[220px_1fr] items-center py-3 px-2.5`;

export const PublishDatasetModal: React.FC<{
  open: boolean;
  onClose: () => void;
  selectedDataset: BusterDataset | undefined;
  sql: string;
}> = React.memo(({ open, onClose, sql, selectedDataset }) => {
  const { openSuccessMessage } = useBusterNotifications();
  const inputRef = React.useRef<InputRef>(null);
  const onUpdateDataset = useDatasetContextSelector((state) => state.onUpdateDataset);
  const [schema, setSchema] = React.useState<string>('');
  const [identifier, setIdentifier] = React.useState<string>('');
  const [view, setView] = React.useState<'view' | 'materializedView'>('view');
  const [saving, setSaving] = React.useState(false);

  const showIdError = useMemo(() => {
    if (!inputHasText(identifier)) return false;
    return !/^[a-zA-Z0-9_]*$/.test(identifier);
  }, [identifier]);

  const onPublish = useMemoizedFn(async () => {
    if (!selectedDataset) return;
    setSaving(true);
    try {
      await onUpdateDataset({
        id: selectedDataset.id,
        enabled: true,
        dataset_definition: {
          sql,
          schema,
          identifier,
          type: view
        }
      });
      setTimeout(() => {
        setSchema('');
        setIdentifier('');
        setView('view');
        setSaving(false);
        openSuccessMessage('Dataset published successfully');
      }, 250);
      onClose();
    } catch {
      setSaving(false);
    }
  });

  const selectOptions = useMemo(() => {
    const options = ['view'];
    if (selectedDataset?.data_source.db_type !== 'mysql') {
      options.push('materializedView');
    }
    return options.map((v) => ({ label: makeHumanReadble(v), value: v }));
  }, [selectedDataset?.data_source.db_type]);

  useEffect(() => {
    if (selectedDataset?.data_source.db_type === 'mysql' && view === 'materializedView') {
      setView('view');
    }
  }, [selectedDataset?.data_source.db_type, view]);

  useEffect(() => {
    if (open && inputRef.current && selectedDataset?.id) {
      inputRef.current.focus();
    }
  }, [selectedDataset?.id]);

  if (!selectedDataset) return null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      header={{
        title: 'Publish your dataset',
        description: `Publishing your dataset will push your changes directly to your warehouse.`
      }}
      footer={{
        primaryButton: {
          text: 'Publish',
          onClick: onPublish,
          loading: saving,
          disabled: !inputHasText(identifier) || showIdError || saving
        }
      }}>
      <div className="flex w-full flex-col space-y-6">
        <ConnectionHeader selectedDataset={selectedDataset} />

        <ItemContainer title="Publish info" bodyClass="!px-0">
          <div className="flex w-full flex-col">
            <div className={`${gridClass}`}>
              <Text type="secondary">Schema</Text>
              <Input
                ref={inputRef}
                placeholder="Schema name"
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
              />
            </div>

            <Divider className="!my-0" />

            <div className="flex flex-col space-y-1">
              <div className={`${gridClass}`}>
                <div
                  className={`flex h-full space-x-1 ${showIdError ? 'mt-1.5 items-start' : 'items-center'}`}>
                  <Text type="secondary">{`Name (as will appear in your db)`}</Text>
                </div>

                <div className="flex flex-col space-y-1">
                  <Input
                    placeholder="Database identifier"
                    value={identifier}
                    onPressEnter={onPublish}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />

                  {showIdError && (
                    <Text type="danger" className="text-sm">
                      Identifier can only contain letters, numbers, and underscores.
                    </Text>
                  )}
                </div>
              </div>
            </div>

            <Divider className="!my-0" />

            <div className={`${gridClass}`}>
              <Text type="secondary">View type</Text>
              <Select
                className="w-full"
                options={selectOptions}
                value={view}
                onChange={(v) => {
                  setView(v);
                }}
              />
            </div>
          </div>
        </ItemContainer>
      </div>
    </AppModal>
  );
});

PublishDatasetModal.displayName = 'PublishDatasetModal';
const ConnectionHeader: React.FC<{ selectedDataset: BusterDataset }> = ({ selectedDataset }) => {
  const token = useAntToken();

  return (
    <div
      className="flex w-full items-center justify-between space-x-2.5 px-4 py-3"
      style={{
        border: `0.5px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius
      }}>
      <div className="flex items-center space-x-2.5">
        <div>
          <AppDataSourceIcon size={30} type={selectedDataset.data_source.db_type} />
        </div>
        <div className="flex flex-col justify-center space-y-0.5">
          <Text>{selectedDataset.data_source.name}</Text>
          <Text type="secondary">
            {`Connect by ${selectedDataset.created_by_name} (${formatDate({
              date: selectedDataset.data_source.created_at,
              format: 'll'
            })})`}
          </Text>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <PulseLoader color={token.colorSuccess} />
        <Text type="secondary">Connected</Text>
      </div>
    </div>
  );
};
