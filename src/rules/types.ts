import { SeverityLevel, RootCauseConfidence, AlternativeFix, LocationInfo } from '../types/debug';

export interface RuleMatchContext {
  errorText: string;
  codeText?: string;
  language: string;
}

export interface RulePattern {
  id: string;
  language: string;
  errorName: string;
  matchRegex: RegExp;
  severity: SeverityLevel;
  rootCauseStatus: RootCauseConfidence;
  summary: string;
  whatHappened: (ctx: RuleMatchContext, match: RegExpMatchArray) => string;
  whyItHappened: (ctx: RuleMatchContext, match: RegExpMatchArray) => string;
  technicalWhy: (ctx: RuleMatchContext, match: RegExpMatchArray) => string;
  rootCause: (ctx: RuleMatchContext, match: RegExpMatchArray) => string;
  howToFix: (ctx: RuleMatchContext, match: RegExpMatchArray) => string[];
  suggestedFixCode: (ctx: RuleMatchContext, match: RegExpMatchArray) => {
    original: string;
    fixed: string;
    explain: string;
  };
  alternativeFixes: (ctx: RuleMatchContext, match: RegExpMatchArray) => AlternativeFix[];
  preventionTips: string[];
  extractLocation?: (errorText: string, codeText?: string) => LocationInfo;
}
