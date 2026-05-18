import React from 'react';

export const useScrollLock = () => {
  const lockScroll = React.useCallback(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
  }, []);

  const unlockScroll = React.useCallback(() => {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.paddingRight = '';
  }, []);

  return { lockScroll, unlockScroll };
};