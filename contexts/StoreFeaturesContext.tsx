'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { StoreFeatures } from '@/lib/api';

const defaultFeatures: StoreFeatures = {
  enableCart: true,
  enableCheckout: true,
  enableAccountCreation: true,
  enableSignIn: true,
};

const StoreFeaturesContext = createContext<StoreFeatures>(defaultFeatures);

export function StoreFeaturesProvider({
  features,
  children,
}: {
  features?: StoreFeatures | null;
  children: ReactNode;
}) {
  const value: StoreFeatures = {
    ...defaultFeatures,
    ...features,
  };

  return (
    <StoreFeaturesContext.Provider value={value}>
      {children}
    </StoreFeaturesContext.Provider>
  );
}

export function useStoreFeatures(): StoreFeatures {
  return useContext(StoreFeaturesContext);
}
