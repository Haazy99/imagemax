import { Navigation } from "@/components/Navigation";
import {
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  ArrowPathRoundedSquareIcon,
  SwatchIcon,
  ScissorsIcon,
  SparklesIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from "next/link";

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

export default async function ToolsPage() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
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
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Image Processing Tools</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {isAuthenticated 
                ? "Access our full suite of professional image processing tools."
                : "Explore our powerful image processing tools. Sign in to start using them."}
            </p>
          </div>

          {/* Tools Grid */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tools.map((tool) => (
              <div key={tool.name} className="relative flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 group">
                {!isAuthenticated && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <LockClosedIcon className="h-8 w-8 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4 text-center px-4">Sign up to unlock this tool</p>
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Sign up now
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                )}
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
                  {isAuthenticated ? (
                    <a
                      href={tool.href}
                      className="flex w-full items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      Launch tool
                    </a>
                  ) : (
                    <a
                      href="/auth/signin"
                      className="flex w-full items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-primary hover:bg-gray-50"
                    >
                      Sign in to use
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-32 rounded-2xl bg-white/60 ring-1 ring-gray-200 shadow-sm backdrop-blur-xl">
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
                      href="/auth/signin"
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
          )}
        </div>
      </div>
    </div>
  );
} 