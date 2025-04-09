import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  overlayOpacity?: number;
  className?: string;
}

export default function VideoBackground({ 
  videoUrl, 
  overlayOpacity = 0.5,
  className = ""
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
      
      const handleError = () => {
        console.error(`Erro ao carregar vídeo: ${videoUrl}`);
        setError(true);
      };

      videoRef.current.addEventListener('error', handleError);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [videoUrl]);

  if (error) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br from-[#FDF8F6] to-white ${className}`}>
        <div className="absolute inset-0 bg-[url('/texture-pattern.svg')] opacity-[0.03] bg-repeat bg-[length:200px_200px]" />
      </div>
    );
  }

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