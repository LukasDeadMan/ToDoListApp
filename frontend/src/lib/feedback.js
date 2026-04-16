export function getErrorMessage(error, fallbackMessage) {
  return (
    error?.payload?.error ||
    error?.payload?.message ||
    error?.message ||
    fallbackMessage
  );
}

export function createFlash(type, message) {
  return {
    id: Date.now(),
    type,
    message,
  };
}
