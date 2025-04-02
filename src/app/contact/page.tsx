import { Navigation } from "@/components/Navigation";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

export default function ContactPage() {
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
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Contact Us</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Have questions? We're here to help. Get in touch with our team.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
            <div className="lg:col-span-7">
              <form action="#" method="POST" className="max-w-xl">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">
                      Name
                    </label>
                    <div className="mt-2.5">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                      Email
                    </label>
                    <div className="mt-2.5">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-semibold leading-6 text-gray-900">
                      Subject
                    </label>
                    <div className="mt-2.5">
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                      Message
                    </label>
                    <div className="mt-2.5">
                      <textarea
                        name="message"
                        id="message"
                        rows={4}
                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Send message
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-inset ring-gray-900/5">
                <h3 className="text-lg font-semibold leading-7 text-gray-900">Get in Touch</h3>
                <dl className="mt-6 space-y-6">
                  <div>
                    <dt className="text-sm font-semibold leading-6 text-gray-900">Support Hours</dt>
                    <dd className="mt-2 text-sm leading-6 text-gray-600">
                      Monday to Friday: 9AM - 6PM (EST)<br />
                      Saturday: 10AM - 4PM (EST)<br />
                      Sunday: Closed
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold leading-6 text-gray-900">Email</dt>
                    <dd className="mt-2 flex text-sm text-gray-600">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <a href="mailto:support@imagemax.com" className="hover:text-primary">
                        support@imagemax.com
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold leading-6 text-gray-900">Phone</dt>
                    <dd className="mt-2 flex text-sm text-gray-600">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span>+1 (555) 123-4567</span>
                    </dd>
                  </div>
                </dl>
                <div className="mt-8 border-t border-gray-900/10 pt-6">
                  <h4 className="text-sm font-semibold leading-6 text-gray-900">Enterprise Support</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    For enterprise inquiries and dedicated support, please email{' '}
                    <a href="mailto:enterprise@imagemax.com" className="text-primary hover:text-primary/90">
                      enterprise@imagemax.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 