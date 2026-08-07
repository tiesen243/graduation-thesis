const steps = [
  'Load the compartments once a week.',
  'Set a schedule in the Rozumari app.',
  'Let the box and your care circle handle the rest.',
]

export function HowItWorkSection() {
  return (
    <section
      id='how-it-works'
      className='bg-secondary text-secondary-foreground'
    >
      <div className='mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28'>
        <div>
          <p className='text-sm font-semibold tracking-[0.18em] uppercase opacity-70'>
            How it works
          </p>
          <h2 className='mt-4 font-serif text-4xl tracking-tight text-balance sm:text-5xl'>
            One less thing to keep in your head.
          </h2>
          <p className='mt-6 max-w-md leading-7 opacity-75'>
            A thoughtful system that turns medication management into a quiet,
            dependable part of the day.
          </p>
        </div>
        <ol className='grid gap-4 sm:grid-cols-3'>
          {steps.map((step, index) => (
            <li
              key={step}
              className='rounded-2xl border border-primary-foreground/20 p-6'
            >
              <span className='font-serif text-3xl opacity-50'>
                0{index + 1}
              </span>
              <p className='mt-12 text-lg leading-7 font-medium'>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
