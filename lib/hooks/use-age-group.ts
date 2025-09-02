import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { AgeGroup } from '@/types';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

export function useAgeGroup() {
  const {
    ageGroup: ageGroupFromStore,
    setAgeGroup: setAgeGroupInStore,
  } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side
    try {
      const storedAgeGroup = localStorage.getItem(
        LOCAL_STORAGE_KEYS.AGE_GROUP
      ) as AgeGroup;
      if (storedAgeGroup) {
        setAgeGroupInStore(storedAgeGroup);
      }
    } catch (error) {
      console.error('Failed to read age group from localStorage', error);
    }
    setIsInitialized(true);
  }, [setAgeGroupInStore]);

  const setAgeGroup = (newAgeGroup: AgeGroup) => {
    try {
      if (newAgeGroup) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.AGE_GROUP, newAgeGroup);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AGE_GROUP);
      }
      setAgeGroupInStore(newAgeGroup);
    } catch (error) {
      console.error('Failed to save age group to localStorage', error);
    }
  };

  return {
    ageGroup: isInitialized ? ageGroupFromStore : null,
    setAgeGroup,
    isInitialized,
  };
}
