import { createStyles } from 'antd-style';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const ShimmerText: React.FC<{
  className?: string;
  text: string;
  size?: number;
  onClick?: () => void;
}> = ({ className = '', text, size = 12, onClick }) => {
  const { cx, styles } = useStyles();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClick?.();
        }}
        transition={{ duration: 0.375 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        key={text}
        className={cx(styles.shimmer, className)}
        style={{
          fontSize: `${size}px`
        }}>
        {text}
      </motion.div>
    </AnimatePresence>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    shimmer: css`
      animation: shimmer 3s linear infinite;
      color: ${token.colorTextPlaceholder};
      background: linear-gradient(
        90deg,
        ${token.colorTextPlaceholder} 33%,
        ${token.colorText} 50%,
        ${token.colorTextPlaceholder} 67%
      );
      background-size: 300% 100%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      @keyframes shimmer {
        0% {
          background-position: right;
        }
        100% {
          background-position: left;
        }
      }
    `
  };
});
