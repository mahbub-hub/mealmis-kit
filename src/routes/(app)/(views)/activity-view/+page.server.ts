import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/prisma";

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get("q") ?? "").trim();
	const month = (url.searchParams.get("month") ?? "ALL").trim(); // YYYY-MM
	const programme = (url.searchParams.get("programme") ?? "ALL").trim();
	const branchId = Number(url.searchParams.get("branchId") ?? "0") || 0;
	const activityId = (url.searchParams.get("activityId") ?? "ALL").trim();
	const sort = (url.searchParams.get("sort") ?? "newest").trim();
	const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

	const where: any = {};

	if (month !== "ALL") where.month = month;
	if (programme !== "ALL") where.programme = programme as any; // enum-safe
	if (branchId) where.branchId = branchId;
	if (activityId !== "ALL") where.activityId = activityId;

	// ✅ Relation filters must use `is` for single relations
	if (q) {
		where.OR = [
			{ remarks: { contains: q, mode: "insensitive" } },
			{ activity: { is: { activityName: { contains: q, mode: "insensitive" } } } },
			{ branch: { is: { name: { contains: q, mode: "insensitive" } } } }
		];
	}

	const orderBy =
		sort === "oldest"
			? { createdAt: "asc" as const }
			: sort === "month"
				? { month: "desc" as const }
				: sort === "total"
					? { total: "desc" as const }
					: { createdAt: "desc" as const };

	const [total, rows] = await Promise.all([
		prisma.activityAchievement.count(),
		prisma.activityAchievement.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			select: {
				id: true,
				month: true,
				programme: true,
				total: true,
				male: true,
				female: true,
				others: true,
				disabledMale: true,
				disabledFemale: true,
				disabledOthers: true,
				remarks: true,
				createdAt: true,
				updatedAt: true,
				activity: { select: { id: true, activityName: true, activityCode: true } },
				branch: { select: { id: true, name: true, code: true } }
			}
		})
	]);

	// Filter dropdown options
	const [months, programmes, branches, activities] = await Promise.all([
		prisma.activityAchievement.findMany({
			select: { month: true },
			distinct: ["month"],
			orderBy: { month: "desc" }
		}),
		prisma.activityAchievement.findMany({
			select: { programme: true },
			distinct: ["programme"],
			orderBy: { programme: "asc" }
		}),
		prisma.branch.findMany({
			select: { id: true, name: true, code: true },
			orderBy: { name: "asc" }
		}),
		prisma.activity.findMany({
			select: { id: true, activityName: true, activityCode: true },
			orderBy: { activityName: "asc" }
		})
	]);

	return {
		rows,
		filters: {
			q,
			month,
			programme,
			branchId,
			activityId,
			sort,
			page,
			pageSize: PAGE_SIZE,
			total
		},
		options: {
			months: months.map((m) => m.month),
			programmes: programmes.map((p) => p.programme).filter(Boolean),
			branches,
			activities
		}
	};
};
