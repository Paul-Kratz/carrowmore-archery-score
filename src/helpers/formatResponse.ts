export function formatResponse<T extends { id: string }>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any
): T | T[] | undefined {
  if (!doc) return undefined;
  // If it's an array, map recursively
  if (Array.isArray(doc)) {
    return doc.map(formatResponse) as T[];
  }
  // If it's a plain object
  const { _id, ...rest } = doc.toObject ? doc.toObject() : doc;
  return { id: _id?.toString?.() ?? _id, ...rest } as T;
}
