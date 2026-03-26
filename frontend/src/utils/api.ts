/**
 * Cleans a parameters object by removing keys with null, undefined, or empty string values.
 * This prevents validation errors (like "numeric string is expected") on the backend.
 */
export const cleanParams = (params: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null && v !== "")
  );
};

/**
 * Converts a params object into a URL query string, properly cleaning and encoding it.
 */
export const toQueryString = (params: Record<string, any>) => {
  const cleaned = cleanParams(params);
  const searchParams = new URLSearchParams();
  
  Object.entries(cleaned).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
