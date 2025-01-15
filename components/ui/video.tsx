'use client';

import { useEffect, useState } from 'react';
import { getVideoUrl } from '@/lib/db/assets';

interface VideoAssetProps {
  fileName: string;
  className?: string;
  asGif?: boolean;
}

export function VideoAsset({ fileName, className, asGif = false }: VideoAssetProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const url = await getVideoUrl(fileName);
        setVideoUrl(url);
      } catch (error) {
        console.error('Error loading video:', error);
      }
    };

    loadVideo();
  }, [fileName]);

  if (!videoUrl) {
    return null;
  }

  return (
    <video
      className={className}
      autoPlay={asGif}
      loop={asGif}
      muted={asGif}
      playsInline={asGif}
      controls={!asGif}
      src={videoUrl}
    />
  );
}
