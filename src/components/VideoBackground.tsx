import React, { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  overlayOpacity?: number;
  className?: string;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl,
  overlayOpacity = 0.5,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 0.75;
    }

    return () => {
      if (video) {
        video.playbackRate = 1;
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta vídeos.
      </video>
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
} 