'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ageGateVerified';

export const useAgeGate = () => {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    try {
      const storedValue = sessionStorage.getItem(STORAGE_KEY);
      if (storedValue === 'true') {
        setIsVerified(true);
      }
    } catch (error) {
      console.error('Could not access sessionStorage', error);
    }
  }, []);

  const verify = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsVerified(true);
    } catch (error) {
       console.error('Could not access sessionStorage', error);
    }
  }, []);

  return { isVerified, verify };
};
