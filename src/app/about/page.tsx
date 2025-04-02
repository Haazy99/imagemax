import { Navigation } from "@/components/Navigation";

export default function AboutPage() {
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
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">About ImageMax</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're on a mission to make professional image editing accessible to everyone through the power of AI.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
            <div className="relative lg:order-last lg:col-span-5">
              <figure className="border-l border-primary/20 pl-8">
                <blockquote className="text-xl font-semibold leading-8 tracking-tight text-gray-900">
                  <p>
                    "ImageMax has revolutionized our workflow. What used to take hours now takes seconds, and the results are consistently impressive."
                  </p>
                </blockquote>
                <figcaption className="mt-8 flex gap-x-4">
                  <div className="text-sm leading-6">
                    <div className="font-semibold text-gray-900">Sarah Johnson</div>
                    <div className="text-gray-600">Lead Designer, DesignCo</div>
                  </div>
                </figcaption>
              </figure>
            </div>

            <div className="max-w-xl text-base leading-7 text-gray-700 lg:col-span-7">
              <p>
                Founded in 2024, ImageMax is at the forefront of AI-powered image editing technology. Our platform combines cutting-edge artificial intelligence with an intuitive user interface to make professional image editing accessible to everyone.
              </p>
              
              <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
                <li className="flex gap-x-3">
                  <span className="mt-1 h-5 w-5 flex-none text-primary">⚡</span>
                  <span>
                    <strong className="font-semibold text-gray-900">Lightning Fast.</strong> Our AI processes images in seconds, not minutes or hours.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <span className="mt-1 h-5 w-5 flex-none text-primary">🎯</span>
                  <span>
                    <strong className="font-semibold text-gray-900">Precision Perfect.</strong> Advanced AI algorithms ensure accurate and professional results.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <span className="mt-1 h-5 w-5 flex-none text-primary">🛡️</span>
                  <span>
                    <strong className="font-semibold text-gray-900">Secure & Private.</strong> Your images are processed with enterprise-grade security.
                  </span>
                </li>
              </ul>

              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Our Mission</h2>
              <p className="mt-6">
                We believe that everyone should have access to professional-grade image editing tools. Our mission is to democratize image editing by making it fast, easy, and accessible through the power of artificial intelligence.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mx-auto mt-32 max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Team</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're a diverse team of engineers, designers, and AI specialists working together to revolutionize image editing.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: 'Michael Chen',
                role: 'CEO & Founder',
                bio: 'Former AI researcher with a passion for making technology accessible.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Head of AI',
                bio: 'PhD in Computer Vision with 10+ years of industry experience.',
              },
              {
                name: 'David Kim',
                role: 'Lead Designer',
                bio: 'Award-winning designer focused on creating intuitive user experiences.',
              },
            ].map((person) => (
              <div key={person.name} className="flex flex-col items-start">
                <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-inset ring-gray-900/5">
                  <div className="flex items-center gap-x-4">
                    <div className="text-base font-semibold leading-7 tracking-tight text-gray-900">{person.name}</div>
                  </div>
                  <div className="mt-1 text-sm leading-6 text-primary">{person.role}</div>
                  <div className="mt-4 text-sm leading-6 text-gray-600">{person.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 