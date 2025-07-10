'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterButton } from '@/components/ui/Button';
import { ToolCard, ToolGrid, FilterGrid } from '@/components/ui/Card';
import { styles } from '@/lib/styles';

const physicsTools = [
	// Calculator Tools
	{
		id: 'kinematics-calculator',
		title: 'Kinematics Calculator',
		description:
			'Calculate motion parameters: displacement, velocity, acceleration, and time',
		icon: '🚀',
		category: 'calculator',
		route: '/physics-tools/kinematics-calculator',
	},
	{
		id: 'force-calculator',
		title: 'Force Calculator',
		description: "Calculate forces using Newton's laws and analyze force systems",
		icon: '⚡',
		category: 'calculator',
		route: '/physics-tools/force-calculator',
	},
	{
		id: 'energy-calculator',
		title: 'Energy Calculator',
		description: 'Calculate kinetic, potential, and mechanical energy',
		icon: '🔋',
		category: 'calculator',
		route: '/physics-tools/energy-calculator',
	},
	{
		id: 'wave-calculator',
		title: 'Wave Calculator',
		description: 'Calculate wave properties: frequency, wavelength, speed, and period',
		icon: '🌊',
		category: 'calculator',
		route: '/physics-tools/wave-calculator',
	},
];

const categories = [
	{ id: 'all', name: 'All Tools', count: physicsTools.length },
	{
		id: 'calculator',
		name: 'Calculators',
		count: physicsTools.filter(t => t.category === 'calculator').length,
	},
];

export default function PhysicsToolsGrid() {
	const router = useRouter();
	const [selectedCategory, setSelectedCategory] = useState('all');

	const filteredTools =
		selectedCategory === 'all'
			? physicsTools
			: physicsTools.filter(tool => tool.category === selectedCategory);

	const handleToolClick = (route: string) => {
		router.push(route);
	};

	return (
		<div className={styles.spacing.section}>
			{/* Category Filter */}
			<FilterGrid>
				{categories.map(category => (
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
				{filteredTools.map(tool => (
					<ToolCard
						key={tool.id}
						icon={tool.icon}
						title={tool.title}
						description={tool.description}
						category={
							categories.find(c => c.id === tool.category)?.name
						}
						onClick={() => handleToolClick(tool.route)}
					/>
				))}
			</ToolGrid>
		</div>
	);
}
