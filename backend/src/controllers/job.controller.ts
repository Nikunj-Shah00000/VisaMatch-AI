import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listJobs(req: Request, res: Response) {
  const sponsorOnly = req.query.sponsorOnly === 'true';
  const industry = typeof req.query.industry === 'string' ? req.query.industry.trim() : undefined;
  const track = typeof req.query.track === 'string' ? req.query.track.trim() : undefined;
  const skills = typeof req.query.skills === 'string' ? req.query.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
  const jobs = await prisma.jobPosting.findMany({
    where: {
      ...(sponsorOnly ? { company: { verifiedSponsor: true } } : {}),
      ...(industry ? { company: { industry: { equals: industry, mode: 'insensitive' } } } : {}),
      ...(track ? { sponsorshipTrack: { contains: track, mode: 'insensitive' } } : {}),
      ...(skills.length ? { skillsRequired: { hasSome: skills } } : {})
    },
    include: { company: true }, orderBy: { createdAt: 'desc' }
  });
  res.json(jobs);
}

export async function getJob(req: Request, res: Response) {
  const job = await prisma.jobPosting.findUnique({ where: { id: req.params.id }, include: { company: true } });
  if (!job) { res.status(404).json({ message: 'Job not found.' }); return; }
  res.json(job);
}
