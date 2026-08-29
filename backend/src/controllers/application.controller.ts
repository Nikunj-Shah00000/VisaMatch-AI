import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const createSchema = z.object({ jobId: z.string().min(1) });

export async function createApplication(req: Request, res: Response) {
  const { jobId } = createSchema.parse(req.body);
  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job) { res.status(404).json({ message: 'Job not found.' }); return; }
  const application = await prisma.application.create({ data: { jobId, candidateId: req.user!.id }, include: { job: { include: { company: true } } } }).catch((e: any) => {
    if (e.code === 'P2002') return null;
    throw e;
  });
  if (!application) { res.status(409).json({ message: 'You already applied to this job.' }); return; }
  res.status(201).json(application);
}

export async function listApplications(req: Request, res: Response) {
  const apps = await prisma.application.findMany({ where: { candidateId: req.user!.id }, include: { job: { include: { company: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(apps);
}

export async function getApplication(req: Request, res: Response) {
  const app = await prisma.application.findFirst({ where: { id: req.params.id, candidateId: req.user!.id }, include: { job: { include: { company: true } } } });
  if (!app) { res.status(404).json({ message: 'Application not found.' }); return; }
  res.json(app);
}
