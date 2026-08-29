export type Role = 'CANDIDATE' | 'EMPLOYER';
export type VisaStatus = 'OPT' | 'CPT' | 'H1B';
export type Job = { id: string; title: string; description: string; requiresSponsorship: boolean; sponsorshipTrack: string | null; skillsRequired: string[]; company: { id: string; name: string; industry: string; verifiedSponsor: boolean; techStack: string[] } };
export type CandidateProfile = { id: string; visaStatus: VisaStatus; resumeUrl?: string | null; resumeText?: string | null; skills: string[]; visaClockDeadline?: string | null };
export type User = { id: string; email: string; role: Role; candidateProfile?: CandidateProfile | null };
export type Application = { id: string; status: 'PENDING' | 'REVIEW' | 'REJECTED'; aiScore?: number | null; aiFeedback?: Feedback | null; createdAt: string; job: Job };
export type Feedback = { score: number; summary: string; matchedSkills: string[]; missingSkills: string[]; strengths: string[]; gaps: string[]; actionPlan: string[]; sponsorshipNotes: string[] };
