import { Navigation } from "@/components/Navigation";
import {
  SparklesIcon,
  PhotoIcon,
  CpuChipIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: 'AI-Powered Enhancement',
    description: 'Our advanced AI algorithms automatically enhance your images, adjusting lighting, color, and sharpness for optimal results.',
    icon: SparklesIcon,
  },
  {
    name: 'Batch Processing',
    description: 'Process multiple images simultaneously with consistent quality and style across your entire collection.',
    icon: PhotoIcon,
  },
  {
    name: 'Smart Object Removal',
    description: 'Seamlessly remove unwanted objects from your images with our intelligent content-aware fill technology.',
    icon: CpuChipIcon,
  },
  {
    name: 'Cloud Storage',
    description: 'Securely store and access your images from anywhere with our integrated cloud storage solution.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Enterprise Security',
    description: 'Bank-level encryption and security measures to protect your valuable images and data.',
    icon: LockClosedIcon,
  },
  {
    name: 'Real-time Preview',
    description: 'See changes in real-time as you adjust settings and apply enhancements to your images.',
    icon: ArrowPathIcon,
  },
]

const workflows = [
  {
    name: 'Professional Photography',
    description: 'Perfect for wedding photographers, event photographers, and professional studios.',
    benefits: [
      'Bulk process entire photoshoots',
      'Consistent style across all images',
      'Advanced retouching tools',
      'Custom presets for your style'
    ]
  },
  {
    name: 'E-commerce',
    description: 'Optimize product photos for your online store quickly and efficiently.',
    benefits: [
      'Automatic background removal',
      'Product photo enhancement',
      'Batch resize for different platforms',
      'Consistent product presentation'
    ]
  },
  {
    name: 'Social Media',
    description: 'Create stunning social media content in seconds.',
    benefits: [
      'Quick resizing for all platforms',
      'Trending filter presets',
      'One-click enhancement',
      'Built-in content templates'
    ]
  }
]

export default function FeaturesPage() {
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
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Advanced Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to perfect your images
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              ImageMax combines cutting-edge AI technology with an intuitive interface to provide professional-grade image editing capabilities.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Workflow Examples */}
          <div className="mx-auto mt-32 max-w-7xl">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Workflows</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Tailored for your needs
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Whether you're a professional photographer, e-commerce business, or social media creator, ImageMax has the tools you need.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {workflows.map((workflow) => (
                  <div key={workflow.name} className="flex flex-col">
                    <dt className="flex items-center text-base font-semibold leading-7 text-gray-900">
                      {workflow.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{workflow.description}</p>
                      <ul role="list" className="mt-4 space-y-2">
                        {workflow.benefits.map((benefit) => (
                          <li key={benefit} className="flex gap-x-3">
                            <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 rounded-2xl bg-gray-50 py-10 px-6 sm:py-16 sm:px-12 lg:flex lg:items-center lg:p-20">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Ready to transform your images?
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Start enhancing your images today with our powerful AI-driven tools.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
              <a
                href="/pricing"
                className="inline-flex rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 