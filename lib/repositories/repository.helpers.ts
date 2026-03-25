export function omitUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function requireField<T extends object, K extends keyof T>(
  input: T,
  field: K,
  options?: {
    trimString?: boolean;
    allowEmptyString?: boolean;
    label?: string;
  },
): NonNullable<T[K]> {
  const value = input[field];
  const trimString = options?.trimString ?? false;
  const allowEmptyString = options?.allowEmptyString ?? true;
  const normalizedValue =
    trimString && typeof value === 'string' ? value.trim() : value;

  if (
    normalizedValue === undefined ||
    normalizedValue === null ||
    (!allowEmptyString &&
      typeof normalizedValue === 'string' &&
      normalizedValue === '')
  ) {
    throw new Error(
      `Missing required field: ${options?.label ?? String(field)}`,
    );
  }

  return normalizedValue as NonNullable<T[K]>;
}
