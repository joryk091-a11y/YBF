import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  { id: 'flights', label: 'الرحلات', path: '/search' },
  { id: 'seats', label: 'المقاعد', path: '/seats' },
  { id: 'travelers', label: 'الركاب', path: '/travelers' },
  { id: 'payment', label: 'الدفع', path: '/payment' },
]

function BookingStepper({ current }) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === current),
  )

  return (
    <nav
      className="mx-auto mb-0 flex w-full max-w-xl items-center justify-center px-2"
      aria-label="خطوات الحجز"
      dir="ltr"
    >
      {steps.map((step, index) => {
        const isDone = index < currentIndex
        const isActive = index === currentIndex

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <Link
              to={step.path === '#' ? '#' : step.path}
              aria-label={step.label}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black transition ${isDone
                  ? 'border-[#4974f9] bg-white text-[#4974f9]'
                  : isActive
                    ? 'border-[#4974f9] bg-[#4974f9] text-white'
                    : 'border-[#9eb6fb] bg-white text-slate-700'
                }`}
            >
              {isDone ? <Check className="h-5 w-5" /> : index + 1}
            </Link>

            {index < steps.length - 1 ? (
              <span className={`h-0.5 flex-1 ${index < currentIndex ? 'bg-[#4974f9]' : 'bg-[#9eb6fb]'}`} />
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}

export default BookingStepper
