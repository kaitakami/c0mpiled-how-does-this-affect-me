// ── Ballot & Measures ─────────────────────────────────────────

export type MeasureCategory =
  | "housing"
  | "tax"
  | "education"
  | "transportation"
  | "healthcare"
  | "environment"
  | "criminal_justice"
  | "labor"
  | "other";

export interface Ballot {
  id: string;
  state: string;
  county: string;
  electionDate: string; // ISO date, e.g. "2024-11-05"
}

export interface BallotMeasure {
  id: string;
  code: string; // e.g. "Prop 33"
  title: string;
  summary: string;
  category: MeasureCategory;
}

export interface BallotMeasureDetail extends BallotMeasure {
  impactFormula: Record<string, ImpactFormula>;
}

export interface ImpactFormula {
  formula: string; // e.g. "monthlyRent * 0.05 * 12"
  requires: string[]; // e.g. ["monthlyRent"]
  description: string; // e.g. "Annual savings from 5% rent cap"
}

export interface BallotWithMeasures {
  ballotId: string;
  measures: BallotMeasure[];
}
