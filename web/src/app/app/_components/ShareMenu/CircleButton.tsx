import { useAntToken } from '@/styles/useAntToken';
import React from 'react';

export const CircleButton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAntToken();

  return (
    <div
      className="flex w-fit items-center justify-center rounded-full p-1.5"
      style={{
        height: 24,
        width: 24,
        color: token.colorIcon,
        border: `0.5px solid ${token.colorBorder}`
      }}>
      {children}
    </div>
  );
};
