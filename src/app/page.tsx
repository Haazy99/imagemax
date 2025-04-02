import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { Pricing } from "@/components/marketing/Pricing";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <footer className="bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">ImageMax</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Transform your images with AI-powered precision. Professional-grade editing tools at your fingertips.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.91-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-gray-600 hover:text-primary text-sm transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-primary text-sm transition-colors">Pricing</Link></li>
                <li><Link href="/tools" className="text-gray-600 hover:text-primary text-sm transition-colors">Tools</Link></li>
                <li><Link href="/api" className="text-gray-600 hover:text-primary text-sm transition-colors">API</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 hover:text-primary text-sm transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-primary text-sm transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-primary text-sm transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-primary text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary text-sm transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} ImageMax. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
