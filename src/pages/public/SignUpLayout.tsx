import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Logo } from '../../components/common/Logo'

export function SignUpLayout() {
  return (
    <div className="gpsc-cream min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-8">
          <Logo size={56} />
          <h1 className="font-display text-3xl text-gpsc-navy mt-4">Create an account</h1>
          <p className="text-sm text-gpsc-stone mt-2">Join the GPSC community today</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gpsc-cream-dark space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gpsc-stone">First name</label>
              <input
                placeholder="Juan"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gpsc-stone">Last name</label>
              <input
                placeholder="Dela Cruz"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-gpsc-stone">Email</label>
            <input
              type="email"
              placeholder="juandelacruz@example.com"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-gpsc-stone">Mobile number</label>
            <input
              placeholder="+63 XXX XXX XXXX"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gpsc-stone">City</label>
              <input
                placeholder="Davao City"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gpsc-stone">Province</label>
              <input
                placeholder="Davao del Sur"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gpsc-stone">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gpsc-stone">Confirm password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-gpsc-stone">Sponsor code (optional)</label>
            <input
              placeholder="e.g. MARIA-D8A3"
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gpsc-cream-dark focus:outline-none focus:ring-2 focus:ring-gpsc-green"
            />
          </div>

          <Button className="w-full">Register</Button>

          <div className="text-center text-xs text-gpsc-stone pt-2">
            Already have an account?{' '}
            <Link to="/signin" className="text-gpsc-green hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}