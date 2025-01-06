import { useDatasetContextSelector } from '@/context/Datasets';
import React, { useRef } from 'react';
import { Input, InputRef } from 'antd';
import { BusterDataset, BusterDatasetColumn } from '@/api/busterv2/datasets';
import { useMemoizedFn } from 'ahooks';
import { useAntToken } from '@/styles/useAntToken';
import { AppPopoverOption, AppPopoverOptions } from '@/components/tooltip/AppPopoverOptions';
import { BsDatabaseDown, BsDatabaseSlash } from 'react-icons/bs';
import { Text, Title } from '@/components';
import { useUserConfigContextSelector } from '@/context/Users';
import { useBusterNotifications } from '@/context/BusterNotifications';

export const DatasetDescriptions: React.FC<{
  selectedApp: string;
  selectedDataset: BusterDataset | undefined;
  sql: string | undefined;
  setSQL: (value: string) => void;
  isAdmin: boolean;
}> = ({ selectedDataset }) => {
  return (
    <div className="flex flex-col space-y-5">
      {selectedDataset ? (
        <>
          <DatasetHeader
            title="Dataset descriptions"
            editableDescription={false}
            description={
              'Dataset descriptions are used to identify which dataset should be used to answer a user’s question. These descriptions should very clearly describe what insights the dataset can provide.'
            }
          />
          <DatasetWhenToUseContainer dataset={selectedDataset} />
          <ColumnDescriptions dataset={selectedDataset} />
        </>
      ) : (
        <div>{/* <Skeleton /> */}</div>
      )}
    </div>
  );
};

const DatasetHeader: React.FC<{
  description: string;
  title: string;
  editableDescription?: boolean;
  onChange?: (value: string) => void;
}> = ({ onChange, editableDescription = true, title, description }) => {
  const [isEditingTitle, onSetIsEditTitle] = React.useState(false);
  const [definition, onChangeDefinition] = React.useState(description);
  const token = useAntToken();

  const handleClickAwayDescription = useMemoizedFn(() => {
    onSetIsEditTitle(false);
    const isChanged = definition !== description;
    if (isChanged) {
      onChange?.(definition);
    }
  });

  return (
    <div className="flex w-full justify-between space-x-2">
      <div className="flex w-full space-x-4">
        <div className="flex w-full flex-col space-y-2">
          <Title level={4}>{title}</Title>

          {editableDescription ? (
            <Input.TextArea
              variant="borderless"
              className={'w-full !pl-0'}
              autoSize={{ maxRows: 15, minRows: 2 }}
              style={{
                color: isEditingTitle ? token.colorText : token.colorTextDescription
              }}
              defaultValue={definition}
              onChange={(e) => {
                onChangeDefinition(e.target.value);
              }}
              placeholder="Add dataset description..."
              onFocus={() => {
                onSetIsEditTitle(true);
              }}
              onBlur={() => {
                handleClickAwayDescription();
              }}
            />
          ) : (
            <>
              <Text type="secondary">{definition}</Text>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DatasetWhenToUseContainer: React.FC<{ dataset: BusterDataset }> = ({ dataset }) => {
  const onUpdateDataset = useDatasetContextSelector((state) => state.onUpdateDataset);
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);

  const onUpdateWhenToUse = useMemoizedFn(
    (whenToUse: string, key: 'when_to_use' | 'when_not_to_use') => {
      const isChanged = whenToUse !== dataset[key];
      if (isChanged) {
        onUpdateDataset({
          id: dataset.id,
          [key]: whenToUse
        });
      }
    }
  );

  return (
    <div className="flex flex-col space-y-4">
      <WhenToUseItem
        title="When to use this dataset..."
        placeholder='For example, "This dataset should be used for customer data"'
        whenToUse={dataset.when_to_use}
        isAdmin={isAdmin}
        onChange={(v) => {
          onUpdateWhenToUse(v, 'when_to_use');
        }}
      />
      <WhenToUseItem
        title="When not to use this dataset..."
        placeholder='For example, "This dataset should not be used for customer data"'
        whenToUse={dataset.when_not_to_use}
        isAdmin={isAdmin}
        onChange={(v) => {
          onUpdateWhenToUse(v, 'when_not_to_use');
        }}
      />
    </div>
  );
};

const WhenToUseItem: React.FC<{
  whenToUse: string;
  title: string;
  placeholder: string;
  onChange: (value: string) => void;
  isAdmin: boolean;
}> = ({ title, isAdmin, whenToUse, placeholder, onChange }) => {
  const token = useAntToken();
  const inputRef = useRef<InputRef>(null);
  const [isEditingTitle, onSetIsEditTitle] = React.useState(false);

  const handleClickAwayDescription = useMemoizedFn(() => {
    const value = inputRef.current?.input?.value;

    if (value && value !== whenToUse) {
      onChange(value);
    }

    onSetIsEditTitle(false);
  });

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: `${token.borderRadius}px`,
        border: `0.5px solid ${token.colorBorder}`
      }}>
      <div
        className="px-4 py-2.5"
        style={{
          backgroundColor: token.controlItemBgActive,
          borderBottom: `0.5px solid ${token.colorSplit}`
        }}>
        <Text>{title}</Text>
      </div>
      <div className="px-4 py-5">
        <Input.TextArea
          ref={inputRef}
          variant="borderless"
          defaultValue={whenToUse}
          value={!isAdmin ? whenToUse : undefined}
          placeholder={placeholder}
          className={`!pl-0 ${!isAdmin ? '!cursor-text' : ''}`}
          disabled={!isAdmin}
          autoSize={{ maxRows: 8, minRows: 1 }}
          style={{
            color: isEditingTitle ? token.colorText : token.colorTextDescription
          }}
          onFocus={() => {
            if (isAdmin) onSetIsEditTitle(true);
          }}
          onBlur={() => {
            if (isAdmin) handleClickAwayDescription();
          }}
        />
      </div>
    </div>
  );
};

const ColumnDescriptions: React.FC<{ dataset: BusterDataset }> = ({ dataset }) => {
  const columns = dataset.columns;
  const onUpdateDatasetColumn = useDatasetContextSelector((state) => state.onUpdateDatasetColumn);
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);
  const { openSuccessMessage } = useBusterNotifications();

  return (
    <div
      className="flex flex-col space-y-6"
      style={{
        marginTop: 64
      }}>
      <DatasetHeader
        editableDescription={false}
        title="Column descriptions"
        description={`We’ve generated descriptions for each of the columns in your dataset. You can edit these descriptions to explain business acronyms, when a column should be used, or how the data should be queried. You can also edit the column title to make them more descriptive & human-friendly.`}
      />

      <div>
        {columns.map((column) => (
          <ColumnDescription
            isAdmin={isAdmin}
            key={column.id}
            column={column}
            first={column.id === columns[0].id}
            last={column.id === columns[columns.length - 1].id}
            onEditDescription={(value) => {
              const isChanged = value !== column.name;
              if (isChanged) {
                onUpdateDatasetColumn({
                  columnId: column.id,
                  description: value
                });
              }
            }}
            onToggleStoredValues={async (value) => {
              const isChanged = value !== column.stored_values;
              if (isChanged) {
                await onUpdateDatasetColumn({
                  columnId: column.id,
                  stored_values: value
                });
                openSuccessMessage('Column updated');
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ColumnDescription: React.FC<{
  first: boolean;
  last: boolean;
  column: BusterDataset['columns'][0];
  onEditDescription: (value: string) => void;
  onToggleStoredValues: (value: boolean) => void;
  isAdmin: boolean;
}> = ({ column, isAdmin, first, onToggleStoredValues, last, onEditDescription }) => {
  const token = useAntToken();
  const [isEditing, onSetIsEditing] = React.useState(false);

  return (
    <div
      className="flex w-full justify-between space-x-3 px-4 py-3"
      style={{
        borderRadius:
          first && last
            ? `${token.borderRadius}px`
            : first
              ? `${token.borderRadius}px ${token.borderRadius}px 0 0`
              : last
                ? `0 0 ${token.borderRadius}px ${token.borderRadius}px`
                : 0,
        border: `0.5px solid ${token.colorBorder}`,
        borderBottom: !last ? `0.5px solid transparent` : `0.5px solid ${token.colorBorder}`
      }}>
      <div className="flex w-full flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <Title level={4}>{column.name}</Title>

          <div
            className="flex items-center"
            style={{
              height: 26,
              padding: '0px 6px ',
              color: token.colorTextDescription,
              borderRadius: `${token.borderRadius}px`,
              border: `0.5px solid ${token.colorSplit}`
            }}>
            {column.type}
          </div>
        </div>

        <Input.TextArea
          className={`w-full !pl-0 ${!isAdmin ? '!cursor-text' : ''}`}
          disabled={!isAdmin}
          defaultValue={column.description || ''}
          value={!isAdmin ? column.description || '' : undefined}
          style={{
            color: isEditing ? token.colorText : token.colorTextDescription
          }}
          variant="borderless"
          onFocus={() => {
            if (isAdmin) onSetIsEditing(true);
          }}
          autoSize={{ maxRows: 12, minRows: 1 }}
          placeholder={isAdmin ? 'Add column description...' : 'No description'}
          onBlur={(e) => {
            if (isAdmin) {
              const value = e.target.value;
              onSetIsEditing(false);
              onEditDescription(value);
            }
          }}
        />
      </div>

      {isAdmin && (
        <StoredValuesDropdown
          enabled={column.stored_values}
          onToggleStoredValues={onToggleStoredValues}
        />
      )}
    </div>
  );
};

const StoredValuesDropdown: React.FC<{
  enabled: BusterDatasetColumn['stored_values'];
  onToggleStoredValues: (value: boolean) => void;
}> = ({ enabled, onToggleStoredValues }) => {
  const positiveIcon = <BsDatabaseDown size={18} />;
  const negativeIcon = <BsDatabaseSlash size={18} />;

  const storedValuesOptions: AppPopoverOption[] = [
    {
      key: 'not_selected',
      label: 'Don’t index this column’s data',
      description: 'This column will not be indexed and it’s data should never be stored.',
      icon: negativeIcon,
      onClick: () => {
        onToggleStoredValues(false);
      }
    },
    {
      key: 'selected',
      label: 'Index this column’s data',
      description:
        'This column will be indexed. This column contains distinct string or enum values. This column doesn’t include any PII.',
      icon: positiveIcon,
      onClick: () => {
        onToggleStoredValues(true);
      }
    }
  ];

  const selectedOption = enabled ? storedValuesOptions[1]! : storedValuesOptions[0]!;

  return (
    <AppPopoverOptions
      options={storedValuesOptions}
      value={selectedOption}
      showCheckIcon={false}
      trigger={'click'}
      placement="bottomRight"
      footer={
        <div className="ml-10">
          Not sure?{' '}
          <a className="" target="_blank">
            Read the docs
          </a>
        </div>
      }>
      <div className={`relative h-fit cursor-pointer opacity-80 transition hover:opacity-100`}>
        {enabled ? positiveIcon : negativeIcon}
      </div>
    </AppPopoverOptions>
  );
};
