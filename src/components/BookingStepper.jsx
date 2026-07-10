import React from 'react'
import { Link } from 'react-router-dom'
import { Plane, Armchair, Users, CreditCard, Check } from 'lucide-react'

const steps = [
  { id: 'flights', label: 'الرحلات', path: '/search', icon: Plane },
  { id: 'seats', label: 'المقاعد', path: '/seats', icon: Armchair },
  { id: 'travelers', label: 'الركاب', path: '/travelers', icon: Users },
  { id: 'payment', label: 'الدفع', path: '/payment', icon: CreditCard },
]

function BookingStepper({ current }) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === current),
  )

  return (
    <nav
      className="mx-auto w-full max-w-xl px-4 py-2"
      aria-label="خطوات الحجز"
      dir="rtl"
    >
      <div className="flex w-full items-center justify-between">
        {steps.map((step, index) => {
          const isDone = index < currentIndex
          const isActive = index === currentIndex
          const StepIcon = step.icon

          return (
            <React.Fragment key={step.id}>
              {}
              <div className="flex flex-col items-center z-10">
                <Link
                  to={isDone ? step.path : '#'}
                  onClick={(e) => {
                    if (!isDone) e.preventDefault();
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all duration-500 ${
                    isDone
                      ? 'border-brand-blue bg-white text-brand-blue hover:bg-blue-50/50 hover:scale-105 active:scale-95'
                      : isActive
                        ? 'border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/20 scale-110'
                        : 'border-slate-200 bg-white text-slate-400 cursor-default'
                  }`}
                  title={step.label}
                >
                  {isDone ? (
                    <Check className="h-5 w-5 stroke-[3]" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </Link>
                <span
                  className={`mt-2 text-[11px] font-black tracking-wide transition-colors duration-350 select-none ${
                    isActive
                      ? 'text-brand-blue'
                      : isDone
                        ? 'text-slate-700'
                        : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] -mt-5 mx-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-brand-blue transition-all duration-700 ${
                      index < currentIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}

export default BookingStepper
