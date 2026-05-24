import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const p = await prisma.passenger.findMany({ take: 1 })
  console.log(p)
}
main().catch(console.error).finally(() => prisma.$disconnect())
