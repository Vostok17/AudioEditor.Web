import { RefObject, useEffect } from 'react';

const useClickOutside = (elementRef: RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [callback, elementRef]);
};

export default useClickOutside;
