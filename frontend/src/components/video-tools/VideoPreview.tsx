'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface VideoPreviewProps {
  file: { name: string; url: string; size: number };
  onDownload: (url: string, name: string) => void;
  showDownload?: boolean;
  title?: string;
  subtitle?: string;
  showControls?: boolean;
}

export default function VideoPreview({ 
  file, 
  onDownload, 
  showDownload = true, 
  title, 
  subtitle,
  showControls = true
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<{ width: number; height: number } | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      setVideoMetadata({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const openFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else {
      window.open(file.url, '_blank');
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleEnded = () => setIsPlaying(false);
      const handlePause = () => setIsPlaying(false);
      const handlePlay = () => setIsPlaying(true);
      
      video.addEventListener('ended', handleEnded);
      video.addEventListener('pause', handlePause);
      video.addEventListener('play', handlePlay);
      
      return () => {
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('play', handlePlay);
      };
    }
  }, []);

  // Set initial volume when video loads
  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.volume = volume;
    }
  }, [videoLoaded, volume]);

  return (
    <div className="border border-foreground/20 rounded-lg p-4 bg-foreground/5 mt-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-foreground/10">
        <div>
          <h4 className="font-medium text-foreground">
            {title || `Preview: ${file.name}`}
          </h4>
          <div className="flex items-center space-x-4 text-sm text-foreground/60 mt-1">
            <span>{formatFileSize(file.size)}</span>
            {videoMetadata && (
              <span>{videoMetadata.width} × {videoMetadata.height}px</span>
            )}
            {duration > 0 && <span>{formatTime(duration)}</span>}
          </div>
          {subtitle && (
            <p className="text-xs text-foreground/50 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={openFullscreen}
            variant="secondary"
            className="text-sm"
          >
            Fullscreen
          </Button>
          {showDownload && (
            <Button
              onClick={() => onDownload(file.url, file.name)}
              variant="secondary"
              className="text-sm"
            >
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Video Preview */}
      <div className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden">
          {!videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-white text-sm">Loading video...</p>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={file.url}
            onLoadedMetadata={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            className="w-full max-h-[400px] object-contain"
            style={{ opacity: videoLoaded ? 1 : 0 }}
            preload="metadata"
            muted={isMuted}
          />
          
          {/* Play/Pause Overlay */}
          {videoLoaded && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={handlePlayPause}>
              <div className="bg-white/20 rounded-full p-4 hover:bg-white/30 transition-colors">
                <div className="text-white text-3xl">▶️</div>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        {showControls && videoLoaded && (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-foreground/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #000 0%, #000 ${(currentTime / duration) * 100}%, #ddd ${(currentTime / duration) * 100}%, #ddd 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-foreground/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-4">
              {/* Skip Backward */}
              <button
                onClick={() => skipTime(-10)}
                className="text-foreground/70 hover:text-foreground transition-colors text-lg"
                title="Skip backward 10s"
              >
                ⏪
              </button>
              
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="bg-foreground text-background rounded-full w-12 h-12 flex items-center justify-center hover:bg-foreground/90 transition-colors text-lg"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              {/* Skip Forward */}
              <button
                onClick={() => skipTime(10)}
                className="text-foreground/70 hover:text-foreground transition-colors text-lg"
                title="Skip forward 10s"
              >
                ⏩
              </button>
              
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-foreground/70 hover:text-foreground transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-foreground/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Video Info */}
        {videoLoaded && (
          <div className="text-center text-sm text-foreground/60 pt-2 border-t border-foreground/10">
            <p>Click fullscreen to view in theater mode • Use space bar to play/pause when focused</p>
          </div>
        )}
      </div>
    </div>
  );
}
