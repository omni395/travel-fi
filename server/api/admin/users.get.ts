// server/api/admin/users.get.ts
import { getQuery } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {

  const query = getQuery(event);
  console.log("Admin users API: query params:", query);

  const {
    page = "1",
    pageSize = "20",
    search = "",
    role = "",
    status = "",
  } = query;
  const take = Math.min(Math.max(parseInt(String(pageSize)), 1), 100);
  const skip = (Math.max(parseInt(String(page)), 1) - 1) * take;

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: String(search), mode: "insensitive" } },
      { name: { contains: String(search), mode: "insensitive" } },
      { walletAddress: { contains: String(search), mode: "insensitive" } },
    ];
  }
  if (role) where.role = String(role);
  if (status) where.status = String(status);

  console.log("Admin users API: where clause:", where);

  try {
    const [items, total, activeCount, suspendedCount, bannedCount] =
      await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            points: true,
            confirmedEmail: true,
            walletAddress: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
        prisma.user.count({ where: { status: "active" } }),
        prisma.user.count({ where: { status: "suspended" } }),
        prisma.user.count({ where: { status: "banned" } }),
      ]);

    const stats = {
      active: activeCount,
      suspended: suspendedCount,
      banned: bannedCount,
    };

    console.log(`Admin users API: found ${items.length} users (page ${page} of ${Math.ceil(total/take)})`);
    console.log("Admin users API: items ids:", items.map(item => item.id).join(", "));
    console.log("Admin users API: stats:", stats);

    return { items, total, stats, page: Number(page), pageSize: take };
  } catch (error) {
    console.error("Admin users API: Database error:", error);
    throw new Error("Internal server error: " + String(error));
  }
});
