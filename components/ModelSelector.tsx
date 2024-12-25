'use client';

import { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getSubscription } from '@/lib/db/users';
import { MODEL_DETAILS, ModelId } from '@/utils/models';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onModelChange: (modelId: ModelId) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isPremium, setIsPremium] = useState(false);

  console.log('ModelSelector: Received selectedModel:', selectedModel);
  console.log('ModelSelector: Available models:', MODEL_DETAILS);

  // Set default model to 'base' if selectedModel is invalid
  useEffect(() => {
    if (!MODEL_DETAILS[selectedModel]) {
      console.log('ModelSelector: Invalid model, defaulting to base');
      onModelChange('base');
    }
  }, [selectedModel, onModelChange]);

  useEffect(() => {
    async function checkSubscription() {
      const supabase = createClient();
      const subscription = await getSubscription(supabase);
      const premium = subscription?.prices?.products?.name?.toLowerCase().includes('premium') ?? false;
      setIsPremium(premium);
    }
    checkSubscription();
  }, []);

  // Only render if we have a valid model
  if (!MODEL_DETAILS[selectedModel]) {
    console.log('ModelSelector: Model not found in MODEL_DETAILS, returning null');
    return null;
  }

  const handleModelChange = (modelId: ModelId) => {
    console.log('ModelSelector: Changing model to:', modelId);
    onModelChange(modelId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-[1.2rem] w-[1.2rem]" />
          {MODEL_DETAILS[selectedModel].name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(MODEL_DETAILS).map(([id, model]) => (
          <DropdownMenuItem
            key={id}
            onClick={() => isPremium || !model.premium ? handleModelChange(id as ModelId) : null}
            className={`
              ${(!isPremium && model.premium) ? 'opacity-50 cursor-not-allowed' : ''}
              ${selectedModel === id ? 'bg-accent' : ''}
            `}
          >
            <div className="flex items-center gap-2">
              {model.name}
              {model.premium && (
                <span className="text-xs text-muted-foreground">
                  {isPremium ? 'Premium' : 'Upgrade to Premium'}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}