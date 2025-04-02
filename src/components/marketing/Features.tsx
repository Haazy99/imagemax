import { 
  PhotoIcon, 
  ArrowPathIcon, 
  TrashIcon,
  CloudArrowUpIcon,
  ShareIcon,
  LockClosedIcon
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Background Removal",
    description: "Remove backgrounds from images instantly with AI-powered precision. Perfect for product photos, portraits, and more.",
    icon: PhotoIcon,
  },
  {
    name: "Image Upscaling",
    description: "Enhance image quality and resolution without losing detail. Turn low-res images into crystal-clear visuals.",
    icon: ArrowPathIcon,
  },
  {
    name: "Object Removal",
    description: "Remove unwanted objects from images seamlessly. Clean up your photos with just a few clicks.",
    icon: TrashIcon,
  },
  {
    name: "Cloud Storage",
    description: "Store and access your images securely in the cloud. Never lose your work with automatic backups.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Easy Sharing",
    description: "Share your edited images with anyone, anywhere. Generate shareable links or collaborate in real-time.",
    icon: ShareIcon,
  },
  {
    name: "Secure Processing",
    description: "Your images are processed securely and never shared. Enterprise-grade security for your peace of mind.",
    icon: LockClosedIcon,
  },
];

export function Features() {
  return (
    <div className="relative bg-white py-24 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 flex justify-center">
        <div className="w-full h-full max-w-7xl opacity-30">
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-transparent to-accent/30" />
        </div>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Powerful Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to perfect your images
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Professional-grade image editing tools powered by AI. Transform your images in seconds with our intuitive interface.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-gray-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 