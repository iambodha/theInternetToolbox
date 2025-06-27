'use client';

import { useState } from 'react';
import VideoSpeedController from './tools/VideoSpeedController';
import VideoFrameExtractor from './tools/VideoFrameExtractor';
import VideoTrimmer from './tools/VideoTrimmer';
import VideoRotator from './tools/VideoRotator';
import VideoWatermark from './tools/VideoWatermark';
import VideoCompressor from './tools/VideoCompressor';

interface VideoTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'edit' | 'convert' | 'enhance' | 'utility';
  component: React.ComponentType;
}

const videoTools: VideoTool[] = [
  // Edit Tools
  { id: 'speed-controller', title: 'Video Speed Controller', description: 'Change video playback speed - create slow motion or time-lapse effects', icon: '⏱️', category: 'edit', component: VideoSpeedController },
  { id: 'trimmer', title: 'Video Trimmer', description: 'Cut and trim video segments to exact timestamps', icon: '✂️', category: 'edit', component: VideoTrimmer },
  { id: 'rotator', title: 'Video Rotator', description: 'Rotate videos by 90°, 180°, or 270° to correct orientation', icon: '🔄', category: 'edit', component: VideoRotator },
  
  // Convert Tools
  { id: 'frame-extractor', title: 'Frame Extractor', description: 'Extract individual frames or thumbnails from videos as images', icon: '🖼️', category: 'convert', component: VideoFrameExtractor },
  
  // Enhance Tools
  { id: 'watermark', title: 'Video Watermark', description: 'Add text or image watermarks to protect your videos', icon: '💧', category: 'enhance', component: VideoWatermark },
  { id: 'compressor', title: 'Video Compressor', description: 'Reduce video file sizes while maintaining quality', icon: '🗜️', category: 'enhance', component: VideoCompressor },
];

const categories = [
  { id: 'all', name: 'All Tools', count: videoTools.length },
  { id: 'edit', name: 'Edit & Transform', count: videoTools.filter(t => t.category === 'edit').length },
  { id: 'convert', name: 'Convert & Extract', count: videoTools.filter(t => t.category === 'convert').length },
  { id: 'enhance', name: 'Enhance & Optimize', count: videoTools.filter(t => t.category === 'enhance').length },
];

export default function VideoToolsGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filteredTools = selectedCategory === 'all' 
    ? videoTools 
    : videoTools.filter(tool => tool.category === selectedCategory);

  const selectedToolData = videoTools.find(tool => tool.id === selectedTool);

  if (selectedTool && selectedToolData) {
    const ToolComponent = selectedToolData.component;
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedTool(null)}
          className="flex items-center space-x-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Video Tools</span>
        </button>

        {/* Tool Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{selectedToolData.icon}</span>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
              {selectedToolData.title}
            </h1>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            {selectedToolData.description}
          </p>
        </div>

        {/* Tool Component */}
        <ToolComponent />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-4xl">🎬</span>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-geist-sans)]">
            Video Tools
          </h1>
        </div>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
          Professional video editing tools for speed control, trimming, frame extraction, and more.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-foreground text-background'
                : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground'
            }`}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className="group p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25] transition-all duration-200 hover:shadow-lg text-left"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {tool.icon}
              </span>
              <h3 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                {tool.title}
              </h3>
            </div>
            <p className="text-foreground/70 leading-relaxed">
              {tool.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                {tool.category.replace('_', ' ')}
              </span>
              <span className="text-foreground/40 group-hover:text-foreground/60 transition-colors">
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl text-white">⚡</span>
          </div>
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Fast Processing</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Client-side video processing for speed and privacy
          </p>
        </div>
        <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl text-white">🔒</span>
          </div>
          <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">Privacy First</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your videos never leave your browser - completely secure
          </p>
        </div>
        <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl text-white">🎯</span>
          </div>
          <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Professional Quality</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            High-quality output with customizable settings
          </p>
        </div>
      </div>
    </div>
  );
}