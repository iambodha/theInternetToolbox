'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/ToolPageLayout';
import { styles } from '@/lib/styles';

interface VideoTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'edit' | 'convert' | 'enhance' | 'utility';
  route: string;
}

const videoTools: VideoTool[] = [
  // Edit Tools
  { id: 'speed-controller', title: 'Video Speed Controller', description: 'Change video playback speed - create slow motion or time-lapse effects', icon: '⏱️', category: 'edit', route: '/video-tools/speed-controller' },
  { id: 'trimmer', title: 'Video Trimmer', description: 'Cut and trim video segments to exact timestamps', icon: '✂️', category: 'edit', route: '/video-tools/trimmer' },
  { id: 'rotator', title: 'Video Rotator', description: 'Rotate videos by 90°, 180°, or 270° to correct orientation', icon: '🔄', category: 'edit', route: '/video-tools/rotator' },
  
  // Convert Tools
  { id: 'frame-extractor', title: 'Frame Extractor', description: 'Extract individual frames or thumbnails from videos as images', icon: '🖼️', category: 'convert', route: '/video-tools/frame-extractor' },
  
  // Enhance Tools
  { id: 'watermark', title: 'Video Watermark', description: 'Add text or image watermarks to protect your videos', icon: '💧', category: 'enhance', route: '/video-tools/watermark' },
  { id: 'compressor', title: 'Video Compressor', description: 'Reduce video file sizes while maintaining quality', icon: '🗜️', category: 'enhance', route: '/video-tools/compressor' },
];

const categories = [
  { id: 'all', name: 'All Tools', count: videoTools.length },
  { id: 'edit', name: 'Edit & Transform', count: videoTools.filter(t => t.category === 'edit').length },
  { id: 'convert', name: 'Convert & Extract', count: videoTools.filter(t => t.category === 'convert').length },
  { id: 'enhance', name: 'Enhance & Optimize', count: videoTools.filter(t => t.category === 'enhance').length },
];

export default function VideoToolsGrid() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? videoTools 
    : videoTools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (route: string) => {
    router.push(route);
  };

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
            onClick={() => handleToolClick(tool.route)}
          />
        ))}
      </ToolGrid>
    </div>
  );
}