import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createSavedQuery(userId: string, name: string | undefined, query: any) {
  return prisma.savedQuery.create({
    data: { userId, name, query },
  });
}

export async function getSavedQueries(userId: string) {
  return prisma.savedQuery.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSavedQueryByIdAndReturnUserId(queryId: string) {
  return prisma.savedQuery.findUnique({
    where: { id: queryId },
    select: {
      id: true,
      userId: true,
    },
  });
}

export async function findQueriesByPredicate(predicate: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.$queryRaw<Array<any>>`
    SELECT * FROM "SavedQuery" sq WHERE EXISTS (
      SELECT 1 FROM jsonb_each(sq.query->'message'->'query_graph'->'edges') AS e(key, val)
      WHERE val->'predicates' ? ${predicate}
    )
  `;
}

export async function deleteSavedQuery(queryId: string) {
  return prisma.savedQuery.delete({
    where: { id: queryId },
  });
}
