// Shared styling configuration for consistent UI across all tools
export const styles = {
  // Layout
  layout: {
    page: "min-h-screen bg-background",
    main: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
    container: "space-y-8",
  },

  // Headers
  header: {
    border: "border-b border-black/[.15] dark:border-white/[.145]",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4",
    flex: "flex items-center justify-between",
    logoContainer: "flex items-center space-x-4",
    logo: "flex items-center space-x-3 hover:opacity-80 transition-opacity",
    logoIcon: "w-8 h-8 bg-foreground rounded-sm flex items-center justify-center",
    logoText: "text-background font-bold text-sm",
    title: "text-xl font-semibold font-[family-name:var(--font-geist-sans)]",
    breadcrumb: "text-foreground/40",
    subtitle: "text-lg font-medium text-foreground/80",
    nav: "hidden md:flex space-x-6",
    navLink: "text-sm hover:text-foreground/80 transition-colors",
  },

  // Page titles and descriptions
  pageTitle: {
    container: "text-center mb-12",
    titleWithIcon: "flex items-center justify-center space-x-3 mb-4",
    icon: "text-4xl",
    title: "text-4xl font-bold font-[family-name:var(--font-geist-sans)]",
    description: "text-lg text-foreground/70 max-w-3xl mx-auto",
  },

  // Tool specific page titles (smaller margin)
  toolTitle: {
    container: "text-center mb-8",
    titleWithIcon: "flex items-center justify-center space-x-3 mb-4",
    icon: "text-4xl",
    title: "text-4xl font-bold font-[family-name:var(--font-geist-sans)]",
    description: "text-lg text-foreground/70 max-w-2xl mx-auto",
  },

  // Buttons
  button: {
    primary: "bg-foreground text-background hover:bg-foreground/90 px-6 py-3 rounded-lg font-medium transition-all duration-200",
    secondary: "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 px-6 py-3 rounded-lg font-medium transition-all duration-200",
    filter: "px-4 py-2 rounded-full text-sm font-medium transition-all",
    filterActive: "bg-foreground text-background",
    filterInactive: "bg-foreground/5 text-foreground/70 hover:bg-foreground/10",
    back: "flex items-center space-x-2 text-foreground/70 hover:text-foreground transition-colors mb-6",
  },

  // Cards and grids
  grid: {
    tools: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    features: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-12",
    filters: "flex flex-wrap gap-2 justify-center",
  },

  card: {
    base: "group p-6 rounded-lg border border-black/[.15] dark:border-white/[.145] hover:border-black/[.25] dark:hover:border-white/[.25] transition-all duration-200 hover:shadow-lg cursor-pointer",
    content: "flex flex-col h-full",
    header: "flex items-center space-x-3 mb-4",
    icon: "text-2xl",
    title: "text-lg font-semibold font-[family-name:var(--font-geist-sans)] group-hover:text-foreground/80 transition-colors",
    description: "text-sm text-foreground/70 leading-relaxed flex-grow",
    footer: "mt-4 pt-4 border-t border-black/[.1] dark:border-white/[.1]",
    category: "text-xs text-foreground/50 uppercase tracking-wide",
    arrow: "text-foreground/40 group-hover:text-foreground/60 transition-colors",
  },

  // Feature highlights
  feature: {
    container: "text-center p-6 rounded-lg border",
    iconContainer: "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4",
    icon: "text-xl text-white",
    title: "font-semibold mb-2",
    description: "text-sm",
  },

  // Color variants for features
  colorVariants: {
    blue: {
      container: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-500",
      title: "text-blue-900 dark:text-blue-100",
      description: "text-blue-700 dark:text-blue-300",
    },
    green: {
      container: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      iconBg: "bg-green-500",
      title: "text-green-900 dark:text-green-100",
      description: "text-green-700 dark:text-green-300",
    },
    purple: {
      container: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-500",
      title: "text-purple-900 dark:text-purple-100",
      description: "text-purple-700 dark:text-purple-300",
    },
    orange: {
      container: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
      iconBg: "bg-orange-500",
      title: "text-orange-900 dark:text-orange-100",
      description: "text-orange-700 dark:text-orange-300",
    },
  },

  // Form elements
  form: {
    container: "space-y-6",
    group: "space-y-2",
    label: "block text-sm font-medium text-foreground/80",
    input: "w-full px-3 py-2 border border-black/[.15] dark:border-white/[.145] rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30",
    textarea: "w-full px-3 py-2 border border-black/[.15] dark:border-white/[.145] rounded-lg bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 resize-vertical min-h-[120px]",
    select: "w-full px-3 py-2 border border-black/[.15] dark:border-white/[.145] rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30",
    checkbox: "rounded border-black/[.15] dark:border-white/[.145] text-foreground focus:ring-foreground/20",
    radio: "border-black/[.15] dark:border-white/[.145] text-foreground focus:ring-foreground/20",
  },

  // Status and feedback
  status: {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-orange-600 dark:text-orange-400",
    info: "text-blue-600 dark:text-blue-400",
  },

  // Typography
  text: {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    muted: "text-foreground/70",
    subtle: "text-foreground/50",
    heading: "font-[family-name:var(--font-geist-sans)]",
    mono: "font-[family-name:var(--font-geist-mono)]",
  },

  // Spacing
  spacing: {
    section: "space-y-8",
    group: "space-y-4",
    tight: "space-y-2",
    loose: "space-y-12",
  },
} as const;

// Helper function to combine classes
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Common component patterns
export const patterns = {
  toolPageLayout: () => `
    <div className="${styles.layout.page}">
      {children}
    </div>
  `,
  
  toolPageMain: () => `
    <main className="${styles.layout.main}">
      {children}
    </main>
  `,
};