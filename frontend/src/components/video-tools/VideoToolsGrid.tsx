'use client';

import { useState } from 'react';
import { FilterButton, BackButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/ToolPageLayout';
import { styles } from '@/lib/styles';
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
      <div className={styles.spacing.section}>
        <BackButton onClick={() => setSelectedTool(null)}>
          Back to Video Tools
        </BackButton>

        <PageTitle
          icon={selectedToolData.icon}
          title={selectedToolData.title}
          description={selectedToolData.description}
          variant="tool"
        />

        <ToolComponent />
      </div>
    );
  }

  return (
    <div className={styles.spacing.section}>
      <PageTitle
        icon="🎬"
        title="Video Tools"
        description="Professional video editing tools for speed control, trimming, frame extraction, and more."
        variant="page"
      />

      {/* Category Filter */}
      <FilterGrid>
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            active={selectedCategory === category.id}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name} ({category.count})
          </FilterButton>
        ))}
      </FilterGrid>

      {/* Tools Grid */}
      <ToolGrid>
        {filteredTools.map((tool) => (
          <ToolCard
            key={tool.id}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            category={tool.category.replace('_', ' ')}
            onClick={() => setSelectedTool(tool.id)}
          />
        ))}
      </ToolGrid>
    </div>
  );
}