import { createContext, useState } from 'react';

export const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    vetClinics: null,
    myPets: null,
    favorites: null
  });

  const updateCache = (key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const getCachedData = (key) => {
    return cache[key];
  };

  const clearCache = (key) => {
    setCache(prev => ({
      ...prev,
      [key]: null
    }));
  };

  return (
    <CacheContext.Provider value={{ cache, updateCache, getCachedData, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
};
