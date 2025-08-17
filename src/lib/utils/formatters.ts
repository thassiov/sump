import { ZodIssue } from 'zod';

function formatZodError(zodIssues: ZodIssue[]): Record<string, string> {
  const errorList = zodIssues.map((issue) => [
    issue.path[0] as string,
    issue.message,
  ]);

  const errors = Object.fromEntries(errorList) as Record<string, string>;
  return errors;
}

export { formatZodError };
