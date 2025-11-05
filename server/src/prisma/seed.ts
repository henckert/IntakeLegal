import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo form with slug 'demo'
  const form = await prisma.formInstance.upsert({
    where: { slug: 'demo' },
    create: {
      firmId: 'demo-firm',
      templateId: 'template-pi',
      slug: 'demo',
      published: true,
      schemaJSON: { vertical: 'PI', sections: ['clientInfo', 'contact', 'narrative', 'ai'] },
      themeJSON: { colors: { primary: '#0B2545', secondary: '#13315C' } },
      retentionPolicy: '90',
    },
    update: {
      published: true,
    },
  });

  console.log('Seeded form', form.slug);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
