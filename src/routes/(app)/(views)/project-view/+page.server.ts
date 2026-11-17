import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/prisma";

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get("q") ?? "").trim();
	const programme = (url.searchParams.get("programme") ?? "ALL").trim();
	const status = (url.searchParams.get("status") ?? "ALL").trim();
	const donorId = Number(url.searchParams.get("donorId") ?? "0") || 0;
	const districtId = Number(url.searchParams.get("districtId") ?? "0") || 0;
	const branchId = Number(url.searchParams.get("branchId") ?? "0") || 0;

	const sort = (url.searchParams.get("sort") ?? "newest").trim();
	const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

	const where: any = {};

	if (programme !== "ALL") where.programme = programme as any;
	if (status !== "ALL") where.status = status as any;
	if (donorId) where.donorId = donorId;
	if (districtId) where.districtId = districtId;
	if (branchId) where.branchId = branchId;

	if (q) {
		where.OR = [
			{ projectId: { contains: q, mode: "insensitive" } },
			{ projectName: { contains: q, mode: "insensitive" } }
		];
	}

	const orderBy =
		sort === "oldest"
			? { createdAt: "asc" as const }
			: sort === "name"
				? { projectName: "asc" as const }
				: sort === "budget"
					? { budget: "desc" as const }
					: sort === "start"
						? { startDate: "desc" as const }
						: { createdAt: "desc" as const };

	const [total, rows] = await Promise.all([
		prisma.project.count({ where }),
		prisma.project.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			select: {
				id: true,
				projectId: true,
				projectName: true,
				projectType: true,
				projectDuration: true,
				programme: true,

				budget: true,
				currency: true,
				status: true,

				totalTarget: true,
				targetMale: true,
				targetFemale: true,
				targetOther: true,
				targetDisabled: true,

				startDate: true,
				endDate: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,

				donor: { select: { id: true, donorName: true } },
				district: { select: { id: true, name: true } },
				upazilla: { select: { id: true, name: true } },
				branch: { select: { id: true, name: true, code: true } },

				_count: {
					select: {
						indicators: true,
						activities: true,
						participants: true
					}
				}
			}
		})
	]);

	// Filter options
	const [donors, districts, branches] = await prisma.$transaction([
		prisma.donor.findMany({ select: { id: true, donorName: true }, orderBy: { donorName: "asc" } }),
		prisma.district.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
		prisma.branch.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } })
	]);

	// If Programme / ParticipantStatus are enums, you can also hardcode these lists.
	// Here we derive distinct values from existing projects:
	const [programmes, statuses] = await prisma.$transaction([
		prisma.project.findMany({ select: { programme: true }, distinct: ["programme"], orderBy: { programme: "asc" } }),
		prisma.project.findMany({ select: { status: true }, distinct: ["status"], orderBy: { status: "asc" } })
	]);

	return {
		rows,
		filters: {
			q,
			programme,
			status,
			donorId,
			districtId,
			branchId,
			sort,
			page,
			pageSize: PAGE_SIZE,
			total
		},
		options: {
			programmes: programmes.map((p) => p.programme),
			statuses: statuses.map((s) => s.status),
			donors,
			districts,
			branches
		}
	};
};
