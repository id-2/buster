'use client';

import { ENABLE_DARK_MODE } from '@/context/BusterStyles/BusterStyles';
import { useMemoizedFn, useMount, useUnmount } from 'ahooks';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

//DO NOT USE
export const useThemeDetector = ({ addDarkClass }: { addDarkClass?: boolean }) => {
  const isServer = typeof window === 'undefined';
  const MEDIA = '(prefers-color-scheme: dark)';

  const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent) => {
    if (!ENABLE_DARK_MODE) return false;
    if (isServer) return false;
    if (!e) e = window.matchMedia(MEDIA);
    const isDark = e.matches;
    return isDark;
  };

  const getCurrentTheme = useMemoizedFn(() => {
    if (!isServer) {
      document.documentElement.style.display = 'none';

      const isDarkMode = getSystemTheme();

      if (addDarkClass) {
        const d = document.documentElement;
        d.classList.toggle('dark', isDarkMode);
        d.classList.toggle('bg-black', isDarkMode);
        d.setAttribute('data-color-scheme', !isDarkMode ? 'light' : 'dark');
      }

      // trigger reflow so that overflow style is applied
      document.documentElement.style.display = '';

      return isDarkMode;
    }
    return false;
  });
  const [isDarkTheme, setIsDarkTheme] = useState(() => getSystemTheme());

  const mqListener = useMemoizedFn(() => {
    setIsDarkTheme(getCurrentTheme());
  });

  useEffect(() => {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    darkThemeMq.addEventListener('change', mqListener);
    return () => darkThemeMq.removeEventListener('change', mqListener);
  }, []);

  useLayoutEffect(() => {
    setIsDarkTheme(getCurrentTheme());
  }, []);

  return isDarkTheme;
};

export const usePreventBackwardNavigation = () => {
  useMount(() => {
    document.documentElement.style.overscrollBehaviorX = 'none';
    document.body.style.overscrollBehaviorX = 'none';
  });

  useUnmount(() => {
    document.documentElement.style.overscrollBehaviorX = 'auto';
    document.body.style.overscrollBehaviorX = 'auto';
  });
};

export const useIsShowingEllipsis = (
  textRef: React.RefObject<HTMLDivElement>,
  text: string,
  maxLength = 25,
  width?: number
): boolean => {
  const isShowingEllipsis = useMemo(() => {
    if (textRef.current) {
      return textRef.current?.scrollWidth > textRef.current?.clientWidth;
    }
    if (!text) return false;
    return text.length > maxLength;
  }, [text, textRef.current, width, maxLength]);
  return isShowingEllipsis;
};

export const useListenToWindowEvent = (eventName: string, callback: (event: Event) => void) => {
  useEffect(() => {
    window.addEventListener(eventName, callback);

    return () => window.removeEventListener(eventName, callback);
  }, [eventName, callback]);
};

export const useBeforeUnload = (callback: (event: BeforeUnloadEvent) => void) => {
  useListenToWindowEvent('beforeunload', callback);
};
