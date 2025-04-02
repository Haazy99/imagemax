'use client'

import { motion } from 'framer-motion'
import { FiMail } from 'react-icons/fi'
import Link from 'next/link'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiMail className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a verification link. Please check your email to verify your account.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="text-sm text-gray-500">
            <p>Next steps:</p>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>Click the verification link in your email</li>
              <li>Complete your profile setup</li>
              <li>Start using ImageMax</li>
            </ol>
          </div>

          <div className="text-sm">
            <p className="text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  // TODO: Implement resend verification email
                  console.log('Resend verification email')
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                click here to resend
              </button>
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 