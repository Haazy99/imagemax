import { Navigation } from "@/components/Navigation";
import { CheckIcon } from "@heroicons/react/24/outline";

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    price: { monthly: '$0' },
    description: 'Perfect for trying out ImageMax.',
    features: [
      'Process up to 50 images/month',
      'Basic image enhancement',
      'Standard support',
      'Web access only',
      '720p max resolution'
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '$15' },
    description: 'Ideal for professionals and small teams.',
    features: [
      'Process up to 1000 images/month',
      'Advanced AI enhancement tools',
      'Priority support',
      'API access',
      '4K resolution support',
      'Batch processing',
      'Custom presets'
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    price: { monthly: 'Custom' },
    description: 'Dedicated support and infrastructure for your company.',
    features: [
      'Unlimited image processing',
      'Custom AI model training',
      'Dedicated support team',
      'Full API access',
      '8K resolution support',
      'Advanced security features',
      'Custom integration options',
      'SLA guarantee'
    ],
    featured: false,
  },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function PricingPage() {
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
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the perfect plan for your needs
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Whether you're just getting started or running a large operation, we have a plan that's right for you.
          </p>

          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier, tierIdx) => (
              <div
                key={tier.id}
                className={classNames(
                  tier.featured ? 'lg:z-10 lg:rounded-b-none' : 'lg:mt-8',
                  tierIdx === 0 ? 'lg:rounded-r-none' : '',
                  tierIdx === tiers.length - 1 ? 'lg:rounded-l-none' : '',
                  'flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3
                      id={tier.id}
                      className={classNames(
                        tier.featured ? 'text-primary' : 'text-gray-900',
                        'text-lg font-semibold leading-8'
                      )}
                    >
                      {tier.name}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price.monthly}</span>
                    {tier.name !== 'Enterprise' && <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>}
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={tier.href}
                  aria-describedby={tier.id}
                  className={classNames(
                    tier.featured
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'text-primary ring-1 ring-inset ring-primary/20 hover:ring-primary/30',
                    'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  )}
                >
                  {tier.name === 'Enterprise' ? 'Contact sales' : 'Get started'}
                </a>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mx-auto max-w-4xl mt-32">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently asked questions</h2>
            <dl className="mt-10 space-y-8">
              {[
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and wire transfers for Enterprise customers."
                },
                {
                  question: "Can I upgrade or downgrade my plan at any time?",
                  answer: "Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle."
                },
                {
                  question: "Is there a long-term contract?",
                  answer: "No, our plans are month-to-month. You can cancel at any time without penalty."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service."
                }
              ].map((faq) => (
                <div key={faq.question}>
                  <dt className="text-base font-semibold leading-7 text-gray-900">{faq.question}</dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 