import { createStyles } from 'antd-style';

export const useFontStyles = createStyles(({ token, css }) => {
  return {
    default: {
      color: `${token.colorText} !important`
    },
    secondary: {
      color: `${token.colorTextSecondary} !important`
    },
    tertiary: {
      color: `${token.colorTextTertiary} !important`
    },
    primary: {
      color: `${token.colorPrimary} !important`
    },
    danger: {
      color: `${token.colorError} !important`
    },
    link: {
      color: `${token.colorPrimary} !important`,
      '&:hover': {
        color: `${token.colorPrimaryHover} !important`
      }
    },
    ellipsis: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  };
});
