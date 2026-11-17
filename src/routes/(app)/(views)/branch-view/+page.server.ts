import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/prisma";

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get("q") ?? "").trim();
	const divisionId = Number(url.searchParams.get("divisionId") ?? "0") || 0;
	const districtId = Number(url.searchParams.get("districtId") ?? "0") || 0;
	const upazillaId = Number(url.searchParams.get("upazillaId") ?? "0") || 0;
	const isActive = (url.searchParams.get("isActive") ?? "ALL").trim(); // ALL | true | false
	const sort = (url.searchParams.get("sort") ?? "newest").trim();
	const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

	const where: any = {};

	if (divisionId) where.divisionId = divisionId;
	if (districtId) where.districtId = districtId;
	if (upazillaId) where.upazillaId = upazillaId;
	if (isActive !== "ALL") where.isActive = isActive === "true";

	if (q) {
		where.OR = [
			{ name: { contains: q, mode: "insensitive" } },
			{ code: { contains: q, mode: "insensitive" } },
			{ phone: { contains: q, mode: "insensitive" } },
			{ email: { contains: q, mode: "insensitive" } }
		];
	}

	const orderBy =
		sort === "oldest"
			? { createdAt: "asc" as const }
			: sort === "name"
				? { name: "asc" as const }
				: sort === "code"
					? { code: "asc" as const }
					: { createdAt: "desc" as const };

	const [total, rows] = await Promise.all([
		prisma.branch.count({ where }),
		prisma.branch.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			select: {
				id: true,
				name: true,
				code: true,
				address: true,
				phone: true,
				email: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,

				division: { select: { id: true, name: true } },
				district: { select: { id: true, name: true } },
				upazilla: { select: { id: true, name: true } },
				union: { select: { id: true, name: true } },

				_count: {
					select: {
						projects: true,
						activities: true,
						users: true,
						participants: true,
						activityAchievements: true
					}
				}
			}
		})
	]);

	// Filter options
	const [divisions, districts, upazillas] = await Promise.all([
		prisma.division.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
		prisma.district.findMany({
			select: { id: true, name: true, divisionId: true },
			orderBy: { name: "asc" }
		}),
		prisma.upazilla.findMany({
			select: { id: true, name: true, districtId: true },
			orderBy: { name: "asc" }
		})
	]);

	// We’ll send grouped maps to allow cascading in UI (optional)
	const districtsByDivision: Record<number, { id: number; name: string }[]> = {};
	for (const d of districts) (districtsByDivision[d.divisionId] ??= []).push({ id: d.id, name: d.name });

	const upazillasByDistrict: Record<number, { id: number; name: string }[]> = {};
	for (const u of upazillas) (upazillasByDistrict[u.districtId] ??= []).push({ id: u.id, name: u.name });

	return {
		rows,
		filters: {
			q,
			divisionId,
			districtId,
			upazillaId,
			isActive,
			sort,
			page,
			pageSize: PAGE_SIZE,
			total
		},
		options: {
			divisions,
			districtsByDivision,
			upazillasByDistrict
		}
	};
};
