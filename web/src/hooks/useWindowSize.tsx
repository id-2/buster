import React from 'react';

export const useWindowSize = () => {
  const isServer = typeof window === 'undefined';

  const [windowSize, setWindowSize] = React.useState({
    width: isServer ? 0 : window.innerWidth,
    height: isServer ? 0 : window.innerHeight
  });

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
