const weakPasswords = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password123",
  "qwerty123",
]);

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

export const passwordChecks = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    test(password) {
      return (password || "").trim().length >= 8;
    },
  },
  {
    id: "lowercase",
    label: "Uma letra minuscula",
    test(password) {
      return /[a-z]/.test(password || "");
    },
  },
  {
    id: "uppercase",
    label: "Uma letra maiuscula",
    test(password) {
      return /[A-Z]/.test(password || "");
    },
  },
  {
    id: "digit",
    label: "Um numero",
    test(password) {
      return /\d/.test(password || "");
    },
  },
];

export function getPasswordChecklist(password) {
  return passwordChecks.map((check) => ({
    ...check,
    valid: check.test(password),
  }));
}

export function validatePasswordStrength(password) {
  const normalizedPassword = (password || "").trim();

  if (normalizedPassword.length < 8) {
    return "Use pelo menos 8 caracteres na senha.";
  }

  if (weakPasswords.has(normalizedPassword.toLowerCase())) {
    return "Escolha uma senha menos previsivel.";
  }

  if (!/[a-z]/.test(normalizedPassword)) {
    return "Adicione ao menos uma letra minuscula.";
  }

  if (!/[A-Z]/.test(normalizedPassword)) {
    return "Adicione ao menos uma letra maiuscula.";
  }

  if (!/\d/.test(normalizedPassword)) {
    return "Adicione ao menos um numero.";
  }

  return "";
}
