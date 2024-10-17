import { useEffect } from 'react';

const useClickOutside = (elementRef, callback) => {
  useEffect(() => {
    const handleClickOutside = e => {
      if (elementRef.current && !elementRef.current.contains(e.target)) {
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
