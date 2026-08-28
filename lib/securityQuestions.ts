export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was the name of your first school?",
  "What was your childhood nickname?",
  "What is your favorite movie, book, or video game?",
  "What is your mother's maiden name?",
  "What was the make and model of your first car?",
] as const;

export type SecurityQuestion = (typeof SECURITY_QUESTIONS)[number];

export function isValidSecurityQuestion(question: string): boolean {
  return SECURITY_QUESTIONS.includes(question as SecurityQuestion);
}
