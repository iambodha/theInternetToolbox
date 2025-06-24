import Link from "next/link";

export default function Home() {
  const toolCategories = [
    {
      title: "PDF Tools",
      description: "Merge, split, compress, and convert PDF files",
      icon: "📄",
      tools: ["PDF Merger", "PDF Splitter", "PDF Compressor", "PDF Converter"],
      href: "/pdf-tools",
    },
    {
      title: "File Conversion",
      description: "Convert between different file formats",
      icon: "🔄",
      tools: [
        "Image Converter",
        "Document Converter",
        "Audio Converter",
        "Video Converter",
      ],
      href: "/file-conversion",
    },
    {
      title: "File Sharing",
      description: "Secure and easy file sharing solutions",
      icon: "📤",
      tools: [
        "Quick Share",
        "Secure Upload",
        "Link Generator",
        "Batch Transfer",
      ],
    },
    {
      title: "Image Tools",
      description: "Edit, optimize, and transform images",
      icon: "🖼️",
      tools: [
        "Image Optimizer",
        "Resize Tool",
        "Format Converter",
        "Background Remover",
      ],
    },
    {
      title: "Text Utilities",
      description: "Process and manipulate text content",
      icon: "📝",
      tools: [
        "Text Editor",
        "Word Counter",
        "Case Converter",
        "Text Formatter",
      ],
    },
    {
      title: "Generators",
      description: "Create QR codes, passwords, and more",
      icon: "⚡",
      tools: [
        "QR Generator",
        "Password Generator",
        "UUID Generator",
        "Color Palette",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
                <span className="text-background font-bold text-sm">IT</span>
              </div>
              <h1 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                The Internet Toolbox
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a
                href="#tools"
                className="text-sm hover:text-foreground/80 transition-colors"
              >
                Tools
              </a>
              <a
                href="#about"
                className="text-sm hover:text-foreground/80 transition-colors"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl sm:text-6xl font-bold font-[family-name:var(--font-geist-sans)] mb-6">
            Your Essential
            <br />
            <span className="text-foreground/60">Internet Toolbox</span>
          </h2>
          <p className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            A curated collection of powerful, free tools for your everyday internet
            needs. Convert files, edit documents, share content, and more—all in one
            place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#tools"
              className="rounded-full bg-foreground text-background px-8 py-3 font-medium hover:bg-foreground/90 transition-colors"
            >
              Explore Tools
            </a>
            <a
              href="#about"
              className="rounded-full border border-foreground/20 px-8 py-3 font-medium hover:bg-foreground/5 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section
        id="tools"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold font-[family-name:var(--font-geist-sans)] mb-4">
            Powerful Tools at Your Fingertips
          </h3>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Each tool is designed with simplicity and efficiency in mind. No accounts
            required, no complicated setups—just pure functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolCategories.map((category, index) => {
            if (category.href) {
              return (
                <Link
                  key={index}
                  href={category.href}
                  className="group p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25] transition-all duration-200 hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h4 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                      {category.title}
                    </h4>
                  </div>
                  <p className="text-foreground/70 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.tools.map((tool, toolIndex) => (
                      <div
                        key={toolIndex}
                        className="flex items-center space-x-2 text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors"
                      >
                        <span className="w-1 h-1 bg-foreground/40 rounded-full"></span>
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button className="w-full py-2 px-4 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors text-sm font-medium">
                      Explore Tools
                    </button>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={index}
                className="group p-6 rounded-lg border border-black/[.08] dark:border-white/[.145] hover:border-black/[.15] dark:hover:border-white/[.25] transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{category.icon}</span>
                  <h4 className="text-xl font-semibold font-[family-name:var(--font-geist-sans)]">
                    {category.title}
                  </h4>
                </div>
                <p className="text-foreground/70 mb-4 leading-relaxed">
                  {category.description}
                </p>
                <div className="space-y-2">
                  {category.tools.map((tool, toolIndex) => (
                    <div
                      key={toolIndex}
                      className="flex items-center space-x-2 text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors"
                    >
                      <span className="w-1 h-1 bg-foreground/40 rounded-full"></span>
                      <span>{tool}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <button className="w-full py-2 px-4 rounded-md bg-foreground/5 hover:bg-foreground/10 text-foreground/60 transition-colors text-sm font-medium">
                    Coming Soon
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-foreground/[.02] dark:bg-foreground/[.05]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h3 className="text-3xl font-bold font-[family-name:var(--font-geist-sans)] mb-6">
              Built for Everyone
            </h3>
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
              The Internet Toolbox brings together the most useful web tools in one
              clean, accessible interface. Whether you&apos;re a student, professional, or
              just someone who needs to get things done online, we&apos;ve got you covered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🚀</span>
                </div>
                <h4 className="font-semibold mb-2">Fast & Efficient</h4>
                <p className="text-sm text-foreground/60">
                  Optimized for speed with minimal loading times
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🔒</span>
                </div>
                <h4 className="font-semibold mb-2">Privacy First</h4>
                <p className="text-sm text-foreground/60">
                  Your files are processed locally when possible
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">💯</span>
                </div>
                <h4 className="font-semibold mb-2">Always Free</h4>
                <p className="text-sm text-foreground/60">
                  No subscriptions, no hidden fees, just tools
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[.08] dark:border-white/[.145]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-foreground rounded-sm flex items-center justify-center">
                <span className="text-background font-bold text-xs">IT</span>
              </div>
              <span className="font-semibold font-[family-name:var(--font-geist-sans)]">
                The Internet Toolbox
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-foreground/60">
              <a
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-black/[.08] dark:border-white/[.145] text-center text-sm text-foreground/60">
            <p>
              © 2025 The Internet Toolbox. Built with ❤️ for the internet community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
