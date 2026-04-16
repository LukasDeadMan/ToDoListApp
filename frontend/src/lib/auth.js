export function buildLoginPayload(identifier, password) {
  const normalizedIdentifier = (identifier || "").trim();

  if (normalizedIdentifier.includes("@")) {
    return {
      email: normalizedIdentifier.toLowerCase(),
      password,
    };
  }

  return {
    nickname: normalizedIdentifier,
    password,
  };
}
