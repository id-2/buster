import React from 'react';
import { Switch, SwitchProps } from 'antd';

export interface AppSwitchProps extends SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange: (checked: boolean) => void;
}

export const AppSwitch: React.FC<AppSwitchProps> = (props) => {
  return <Switch {...props} />;
};
