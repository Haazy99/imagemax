import { Navigation } from "@/components/Navigation";
import {
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  ArrowPathRoundedSquareIcon,
  SwatchIcon,
  ScissorsIcon,
  SparklesIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { auth } from "@/lib/auth";

const tools = [
  {
    name: 'Basic Adjustments',
    description: 'Adjust brightness, contrast, saturation, and more',
    icon: AdjustmentsHorizontalIcon,
    href: '#',
    category: 'Essential',
  },
  {
    name: 'Smart Enhance',
    description: 'AI-powered automatic image enhancement',
    icon: SparklesIcon,
    href: '#',
    category: 'AI Tools',
  },
  {
    name: 'Background Remove',
    description: 'Automatically remove image backgrounds',
    icon: ScissorsIcon,
    href: '#',
    category: 'AI Tools',
  },
  {
    name: 'Batch Processing',
    description: 'Process multiple images at once',
    icon: PhotoIcon,
    href: '#',
    category: 'Workflow',
  },
  {
    name: 'Format Converter',
    description: 'Convert between different image formats',
    icon: ArrowPathRoundedSquareIcon,
    href: '#',
    category: 'Essential',
  },
  {
    name: 'Color Correction',
    description: 'Advanced color grading and correction',
    icon: SwatchIcon,
    href: '#',
    category: 'Professional',
  },
];

const recentProjects = [
  {
    name: 'Vacation Photos',
    date: '2 hours ago',
    imageCount: 24,
    status: 'Completed',
  },
  {
    name: 'Product Catalog',
    date: 'Yesterday',
    imageCount: 156,
    status: 'In Progress',
  },
  {
    name: 'Wedding Album',
    date: '3 days ago',
    imageCount: 342,
    status: 'Completed',
  },
];

export default async function MyToolsPage() {
  const session = await auth();
  const isAuthenticated = !!session;

  return (
    <div className="bg-white">
      <Navigation />
      <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-white to-white" />
          <div className="absolute left-0 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-50/50 blur-3xl" />
          <div className="absolute right-0 bottom-0 -z-10 h-[800px] w-[800px] translate-x-1/2 rounded-full bg-purple-50/50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Page Header */}
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">My Tools</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {isAuthenticated 
                ? "Access your image processing tools and recent projects all in one place."
                : "Sign in to access powerful image processing tools and manage your projects."}
            </p>
          </div>

          {!isAuthenticated ? (
            // Non-authenticated user view
            <div className="mx-auto max-w-7xl mt-16">
              <div className="rounded-2xl bg-white/60 ring-1 ring-gray-200 shadow-sm backdrop-blur-xl">
                <div className="px-6 py-24 sm:px-12 sm:py-32 lg:px-16">
                  <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      Ready to transform your images?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
                      Sign in to access our full suite of professional image processing tools, including AI-powered enhancements, batch processing, and more.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                      <a
                        href="/api/auth/signin"
                        className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Sign in
                      </a>
                      <a href="/pricing" className="text-sm font-semibold leading-6 text-gray-900">
                        View pricing <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview of Available Tools */}
              <div className="mt-32">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Available Tools</h3>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.slice(0, 3).map((tool) => (
                    <div key={tool.name} className="relative flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
                        <LockClosedIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-x-3">
                          <tool.icon className="h-6 w-6 text-primary" />
                          <h3 className="text-lg font-semibold leading-8 text-gray-900">{tool.name}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{tool.description}</p>
                        <span className="mt-4 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {tool.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Authenticated user view - existing content
            <>
              {/* Tools Grid */}
              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {tools.map((tool) => (
                  <div key={tool.name} className="flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-200">
                    <div className="p-6">
                      <div className="flex items-center gap-x-3">
                        <tool.icon className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-semibold leading-8 text-gray-900">{tool.name}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{tool.description}</p>
                      <span className="mt-4 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {tool.category}
                      </span>
                    </div>
                    <div className="mt-auto flex border-t border-gray-200">
                      <a
                        href={tool.href}
                        className="flex w-full items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                      >
                        Launch tool
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Projects */}
              <div className="mx-auto mt-32 max-w-7xl">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Recent Projects</h2>
                <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <ul role="list" className="divide-y divide-gray-200">
                    {recentProjects.map((project) => (
                      <li key={project.name} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{project.name}</p>
                              <div className="flex items-center gap-x-2 text-xs text-gray-500">
                                <span>{project.date}</span>
                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                  {project.imageCount} images
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-x-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                project.status === 'Completed'
                                  ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                  : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                              }`}
                            >
                              {project.status}
                            </span>
                            <a
                              href="#"
                              className="text-sm font-semibold leading-6 text-primary hover:text-primary/80"
                            >
                              View<span className="sr-only">, {project.name}</span>
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mx-auto mt-16 max-w-7xl">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Images Processed', value: '1,234' },
                    { label: 'Storage Used', value: '2.1 GB' },
                    { label: 'Active Projects', value: '3' },
                    { label: 'Plan Status', value: 'Pro' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
                      <dt className="text-sm font-medium leading-6 text-gray-600">{stat.label}</dt>
                      <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 