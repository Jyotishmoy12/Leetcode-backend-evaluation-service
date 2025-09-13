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
