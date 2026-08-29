import { PrismaClient, UserRole, VisaStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const companies = [
    { name: 'Northstar Cloud', industry: 'Technology', verifiedSponsor: true, techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'] },
    { name: 'Atlas FinTech', industry: 'Financial Technology', verifiedSponsor: true, techStack: ['Java', 'Spring Boot', 'React', 'Kafka', 'AWS'] },
    { name: 'GreenGrid Systems', industry: 'Energy Technology', verifiedSponsor: false, techStack: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'] }
  ];
  for (const company of companies) {
    const saved = await prisma.company.upsert({ where: { name: company.name }, update: company, create: company });
    const jobs = [
      { title: 'Full-Stack Software Engineer', description: 'Build scalable web products with React, TypeScript, Node.js and PostgreSQL. Work with cloud infrastructure and CI/CD. Candidates requiring future employment sponsorship may be considered subject to company policy.', skillsRequired: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], requiresSponsorship: true, sponsorshipTrack: 'H-1B' },
      { title: 'Backend Engineer', description: 'Design APIs and distributed services using Java, Spring Boot and Kafka. Experience with AWS and production observability is valuable.', skillsRequired: ['Java', 'Spring Boot', 'Kafka', 'AWS'], requiresSponsorship: true, sponsorshipTrack: 'H-1B' }
    ];
    for (const job of jobs) await prisma.jobPosting.upsert({ where: { id: `${saved.id}-${job.title.replace(/\W/g, '-')}` }, update: job, create: { ...job, id: `${saved.id}-${job.title.replace(/\W/g, '-')}`, companyId: saved.id } });
  }
  const email = 'demo@visamatch.ai';
  const passwordHash = await bcrypt.hash('DemoPassword123!', 12);
  await prisma.user.upsert({
    where: { email }, update: {}, create: { email, passwordHash, role: UserRole.CANDIDATE, candidateProfile: { create: { visaStatus: VisaStatus.OPT, skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], visaClockDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180) } } }
  });
  console.log('Seed complete. Demo login:', email, 'DemoPassword123!');
}

main().finally(() => prisma.$disconnect());
