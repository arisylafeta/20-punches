'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModelId } from '@/utils/models';
import { createClient } from '@/utils/supabase/client';
import { getSubscription } from '@/lib/db/users';

interface ModelContextType {
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => void;
  isPremium: boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelId>('base');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      const supabase = createClient();
      const subscription = await getSubscription(supabase);
      const premium = subscription?.prices?.products?.name?.toLowerCase().includes('premium') ?? false;
      setIsPremium(premium);
    }
    checkSubscription();
  }, []);

  const handleModelChange = (model: ModelId) => {
    setSelectedModel(model);
  };

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel: handleModelChange, isPremium }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}