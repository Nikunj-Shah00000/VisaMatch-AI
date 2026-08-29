import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient, UserRole, VisaStatus } from '@prisma/client';
import { signToken } from '../utils/jwt.js';

const prisma = new PrismaClient();
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(UserRole).default(UserRole.CANDIDATE),
  visaStatus: z.nativeEnum(VisaStatus).optional(),
  skills: z.array(z.string().min(1).max(80)).max(100).default([]),
  resumeText: z.string().max(30000).optional(),
  visaClockDeadline: z.string().datetime().optional()
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function signup(req: Request, res: Response) {
  const data = signupSchema.parse(req.body);
  if (data.role === UserRole.CANDIDATE && !data.visaStatus) {
    res.status(400).json({ message: 'visaStatus is required for candidate accounts.' });
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    res.status(409).json({ message: 'An account with this email already exists.' });
    return;
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(), passwordHash, role: data.role,
      candidateProfile: data.role === UserRole.CANDIDATE ? { create: {
        visaStatus: data.visaStatus!, skills: data.skills,
        visaClockDeadline: data.visaClockDeadline ? new Date(data.visaClockDeadline) : null, resumeText: data.resumeText || null
      }} : undefined
    }, include: { candidateProfile: true }
  });
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, candidateProfile: user.candidateProfile } });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() }, include: { candidateProfile: true } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, candidateProfile: user.candidateProfile } });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { candidateProfile: true } });
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  res.json({ id: user.id, email: user.email, role: user.role, candidateProfile: user.candidateProfile });
}
