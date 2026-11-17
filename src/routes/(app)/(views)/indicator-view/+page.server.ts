import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/prisma";

const PAGE_SIZE = 25;

export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get("q") ?? "").trim();
	const projectId = Number(url.searchParams.get("projectId") ?? "0") || 0;
	const category = (url.searchParams.get("category") ?? "ALL").trim();
	const freq = (url.searchParams.get("freq") ?? "ALL").trim();
	const sort = (url.searchParams.get("sort") ?? "newest").trim();
	const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

	const where: any = {};
	if (projectId) where.projectId = projectId;
	if (category !== "ALL") where.category = category as any;
	if (freq !== "ALL") where.reportingFrequency = freq as any;

	if (q) {
		where.OR = [
			{ indicatorCode: { contains: q, mode: "insensitive" } },
			{ indicatorName: { contains: q, mode: "insensitive" } },
			{ description: { contains: q, mode: "insensitive" } }
		];
	}

	// Sorting
	const orderBy =
		sort === "oldest"
			? { createdAt: "asc" as const }
			: sort === "code"
				? { indicatorCode: "asc" as const }
				: sort === "name"
					? { indicatorName: "asc" as const }
					: { createdAt: "desc" as const };

	const [total, rows] = await Promise.all([
		prisma.indicator.count(),
		prisma.indicator.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			select: {
				id: true,
				indicatorCode: true,
				indicatorName: true,
				description: true,
				category: true,
				unit: true,
				targetValue: true,
				baselineValue: true,
				achievedValue: true,
				targetMale: true,
				targetFemale: true,
				targetOther: true,
				achievedMale: true,
				achievedFemale: true,
				achievedOther: true,
				reportingFrequency: true,
				createdAt: true,
				updatedAt: true,
				project: { select: { id: true, projectName: true, projectId: true } }
			}
		})
	]);

	// Options for filters
	const projects = await prisma.project.findMany({
		select: { id: true, projectName: true, projectId: true },
		orderBy: { projectName: "asc" }
	});

	// If you have enums in Prisma, you can hardcode them here (recommended).
	// If not, you can derive distinct values from table:
	const categories = await prisma.indicator.findMany({
		select: { category: true },
		distinct: ["category"],
		orderBy: { category: "asc" }
	});

	const freqs = await prisma.indicator.findMany({
		select: { reportingFrequency: true },
		distinct: ["reportingFrequency"],
		orderBy: { reportingFrequency: "asc" }
	});

	return {
		rows,
		filters: {
			q,
			projectId,
			category,
			freq,
			sort,
			page,
			pageSize: PAGE_SIZE,
			total
		},
		options: {
			projects,
			categories: categories.map((c) => c.category),
			freqs: freqs.map((f) => f.reportingFrequency)
		}
	};
};
