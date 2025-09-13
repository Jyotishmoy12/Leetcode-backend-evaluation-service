export interface TestCase {
  input: string;
  output: string;
}
export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  editorial?: string;
  testcases: TestCase[];
  input: string;
  output: string;
}

export interface EvaluationJob {
  submissionId: string;
  code: string;
  language: "python" | "cpp";
  problem: Problem;
}


export enum StatusEnum {
  SUCCESS = "success",
  FAILED = "failed",
  TIME_LIMIT_EXCEEDED = "time_limit_exceeded",
  RUNTIME_ERROR = "runtime_error",
  COMPILATION_ERROR = "compilation_error",
  INTERNAL_ERROR = "internal_error"
}

export interface EvaluationResult {
  status: StatusEnum;
  output: string | undefined;
}
