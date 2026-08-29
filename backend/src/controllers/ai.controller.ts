import type { Request, Response } from 'express';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { env } from '../config/env.js';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const requestSchema = z.object({
  applicationId: z.string().min(1),
  candidateProfile: z.object({
    skills: z.array(z.string()),
    visaStatus: z.enum(['OPT', 'CPT', 'H1B']),
    resumeText: z.string().min(20).max(30000)
  })
});

const outputSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    score: { type: 'integer', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    matchedSkills: { type: 'array', items: { type: 'string' } },
    missingSkills: { type: 'array', items: { type: 'string' } },
    strengths: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    actionPlan: { type: 'array', items: { type: 'string' } },
    sponsorshipNotes: { type: 'array', items: { type: 'string' } }
  },
  required: ['score', 'summary', 'matchedSkills', 'missingSkills', 'strengths', 'gaps', 'actionPlan', 'sponsorshipNotes']
} as const;

export async function analyzeApplication(req: Request, res: Response) {
  const data = requestSchema.parse(req.body);
  const application = await prisma.application.findFirst({ where: { id: data.applicationId, candidateId: req.user!.id }, include: { job: { include: { company: true } } } });
  if (!application) { res.status(404).json({ message: 'Application not found.' }); return; }

  const response = await openai.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      { role: 'system', content: 'You are a responsible career-matching assistant. Evaluate evidence in the resume against the job. Do not infer protected traits. Do not provide legal immigration advice. Sponsorship observations must be framed as job-posting signals, not guarantees. Return only the requested JSON structure.' },
      { role: 'user', content: JSON.stringify({ candidate: data.candidateProfile, job: { title: application.job.title, description: application.job.description, skillsRequired: application.job.skillsRequired, requiresSponsorship: application.job.requiresSponsorship, sponsorshipTrack: application.job.sponsorshipTrack, company: application.job.company.name } }) }
    ],
    text: { format: { type: 'json_schema', name: 'visa_match_analysis', strict: true, schema: outputSchema } }
  });

  const result = JSON.parse(response.output_text);
  await prisma.application.update({ where: { id: application.id }, data: { aiScore: result.score, aiFeedback: result, status: 'REVIEW' } });
  res.json({ applicationId: application.id, ...result });
}
