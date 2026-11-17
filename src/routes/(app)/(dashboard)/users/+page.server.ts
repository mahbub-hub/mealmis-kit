import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/prisma";

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const q = (url.searchParams.get("q") ?? "").trim();
	const role = (url.searchParams.get("role") ?? "ALL").trim();
	const sort = (url.searchParams.get("sort") ?? "newest").trim();
	const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));

	const where: any = {};

	if (q) {
		where.OR = [
			{ email: { contains: q, mode: "insensitive" } },
			{ name: { contains: q, mode: "insensitive" } },
			{ username: { contains: q, mode: "insensitive" } }
		];
	}

	if (role !== "ALL") {
		where.role = role;
	}

	const orderBy =
		sort === "oldest"
			? { createdAt: "asc" as const }
			: sort === "email"
				? { email: "asc" as const }
				: sort === "role"
					? { role: "asc" as const }
					: { createdAt: "desc" as const };

	const [total, users] = await Promise.all([
		prisma.user.count({ where }),
		prisma.user.findMany({
			where,
			orderBy,
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			select: {
				id: true,
				email: true,
				username: true,
				name: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				projects: { select: { id: true, projectName: true, projectId: true } },
				branches: { select: { id: true, name: true, code: true } }
			}
		})
	]);

	return {
		users,
		query: { q, role, sort, page, pageSize: PAGE_SIZE, total }
	};
};
