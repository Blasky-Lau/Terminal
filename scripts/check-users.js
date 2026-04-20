const { PrismaClient } = require("@prisma/client")

async function main() {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
        registrationMode: true,
      },
      orderBy: { createdAt: "asc" },
    })
    console.log(users)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
