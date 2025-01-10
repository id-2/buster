import React from 'react';
import { Input } from 'antd';
import { AppMaterialIcons } from '@/components';
import { useMemoizedFn } from 'ahooks';

export const PermissionOverviewSearch: React.FC<{
  className?: string;
  searchText: string;
  setSearchText: (text: string) => void;
}> = ({ className = '', searchText, setSearchText }) => {
  const onChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  });

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      <Input
        className="max-w-[280px]"
        placeholder="Search by name or email"
        value={searchText}
        onChange={onChange}
        allowClear
        prefix={<AppMaterialIcons icon={'search'} />}
      />
    </div>
  );
};
PermissionOverviewSearch.displayName = 'PermissionOverviewSearch';
