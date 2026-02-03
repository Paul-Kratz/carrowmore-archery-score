// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatNested(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(formatNested);
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (
    obj &&
    typeof obj === "object" &&
    (obj.constructor?.name === "ObjectId" || obj._bsontype === "ObjectID") &&
    typeof obj.toString === "function"
  ) {
    return obj.toString();
  }
  if (obj && typeof obj === "object") {
    const { _id, ...rest } = obj.toObject ? obj.toObject() : obj;
    const formatted = { ...rest };
    for (const key in formatted) {
      if (Object.prototype.hasOwnProperty.call(formatted, key)) {
        formatted[key] = formatNested(formatted[key]);
      }
    }
    if (_id !== undefined) {
      return { id: _id?.toString?.() ?? _id, ...formatted };
    }
    return formatted;
  }
  return obj;
}

export function formatResponse<T extends { id: string }>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any
): T {
  return formatNested(doc) as T;
}

// Format an array of Mongoose documents or plain objects
export function formatResponseArray<T extends { id: string }>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docs: any[]
): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map(formatResponse).filter(Boolean) as T[];
}
