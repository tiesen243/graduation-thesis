export function StoriesSection() {
  return (
    <section
      id='stories'
      className='mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32'
    >
      <div className='grid gap-8 rounded-3xl border bg-card p-8 sm:p-12 lg:grid-cols-[0.7fr_1.3fr] lg:p-16'>
        <div>
          <p className='text-sm font-semibold tracking-[0.18em] text-primary uppercase'>
            A better feeling
          </p>
          <h2 className='mt-4 font-serif text-4xl tracking-tight'>
            “It gives us a gentle sense that someone has our back.”
          </h2>
        </div>
        <div className='flex flex-col justify-between gap-8 lg:pl-12'>
          <p className='max-w-2xl text-xl leading-9 text-muted-foreground'>
            “My dad wants his independence, and I want to know he is okay.
            Rozumari finds the middle ground — it supports him without making
            every reminder feel like a check-in.”
          </p>
          <p className='text-sm font-semibold'>Elena, early Rozumari family</p>
        </div>
      </div>
    </section>
  )
}
