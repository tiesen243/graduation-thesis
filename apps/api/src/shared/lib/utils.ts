export type EntityOverrides<T> = Partial<Omit<T, 'clone' | 'toJSON' | '_tag'>>

export const createClone = <T extends object>(
  instance: T,
  overrides?: EntityOverrides<T>
): T => {
  if (!overrides) return structuredClone(instance)

  const cleanedOverrides = Object.fromEntries(
    Object.entries(overrides).filter(
      ([_, value]) => value !== undefined && value !== ''
    )
  )

  // oxlint-disable-next-line typescript/no-explicit-any
  const TargetConstructor = instance.constructor as new (args: any) => T

  return new TargetConstructor({
    ...structuredClone(instance),
    ...cleanedOverrides,
    updatedAt: new Date(),
  })
}
