import { CheckIcon, SparklesIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/signup",
    price: { monthly: "$0" },
    description: "Perfect for trying out our basic features.",
    features: [
      "Up to 10 images per month",
      "Basic background removal",
      "Standard resolution",
      "Community support",
    ],
    featured: false,
    badge: null,
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "/signup",
    price: { monthly: "$29" },
    description: "For professionals who need more power and features.",
    features: [
      "Unlimited images",
      "Advanced background removal",
      "High-resolution output",
      "Priority support",
      "Custom branding",
      "API access",
    ],
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "/contact",
    price: { monthly: "Custom" },
    description: "For large organizations with custom requirements.",
    features: [
      "Everything in Pro",
      "Custom AI model training",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
      "On-premise deployment",
    ],
    featured: false,
    badge: "Custom",
  },
];

export function Pricing() {
  return (
    <div className="relative isolate bg-white py-24 sm:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-white to-white" />
        <div className="absolute left-0 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-50/50 blur-3xl" />
        <div className="absolute right-0 bottom-0 -z-10 h-[800px] w-[800px] translate-x-1/2 rounded-full bg-purple-50/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold leading-7 text-primary">
            <SparklesIcon className="h-5 w-5" />
            <span>Pricing</span>
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for&nbsp;you
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Start with our free plan and upgrade as you grow. All plans include our core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={cn(
                tier.featured
                  ? "relative bg-white shadow-2xl ring-2 ring-primary"
                  : "ring-1 ring-gray-200 lg:hover:shadow-lg lg:hover:scale-105",
                "rounded-3xl p-8 transition-all duration-200 xl:p-10"
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    className={cn(
                      tier.featured ? "text-primary" : "text-gray-900",
                      "text-lg font-semibold leading-8"
                    )}
                  >
                    {tier.name}
                  </h3>
                  {tier.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold leading-5",
                        tier.featured
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {tier.badge}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {tier.description}
                </p>
                <div className="mt-6 flex items-baseline gap-x-1">
                  <span
                    className={cn(
                      "text-4xl font-bold tracking-tight",
                      tier.featured ? "text-primary" : "text-gray-900"
                    )}
                  >
                    {tier.price.monthly}
                  </span>
                  {tier.price.monthly !== "Custom" && (
                    <span className="text-sm font-semibold leading-6 text-gray-600">
                      /month
                    </span>
                  )}
                </div>

                {/* Features list */}
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3 items-center">
                      <CheckIcon
                        className={cn(
                          "h-5 w-5 flex-none",
                          tier.featured ? "text-primary" : "text-blue-500"
                        )}
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={tier.href}
                  className={cn(
                    "mt-8 block rounded-full px-3 py-2.5 text-center text-sm font-semibold leading-6 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    tier.featured
                      ? "bg-primary text-white hover:bg-primary/90 focus-visible:outline-primary shadow-lg hover:shadow-primary/25"
                      : "text-primary ring-1 ring-inset ring-primary/20 hover:ring-primary/40 hover:bg-primary/5"
                  )}
                >
                  {tier.price.monthly === "Custom" ? "Contact sales" : "Get started"}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-24 max-w-3xl mx-auto text-center">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Frequently asked questions
          </h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Have questions? Check out our FAQ section or{" "}
            <Link href="/contact" className="font-semibold text-primary hover:text-primary/90">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
} 