export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required."] };
  }

  if (password.length < 8) {
    errors.push("At least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter (A-Z)");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter (a-z)");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("At least one number (0-9)");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("At least one special character (e.g. !@#$%^&*)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
