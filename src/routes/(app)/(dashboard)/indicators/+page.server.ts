import type { PageServerLoad } from "./$types";
import { prisma } from "$lib/prisma"; // adjust path if different

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

const toNum = (v: unknown) => {
	if (typeof v === "number") return v;
	if (typeof v === "string") return Number(v) || 0;
	// Prisma Decimal
	if (v && typeof (v as any).toNumber === "function") return (v as any).toNumber();
	return Number(v ?? 0) || 0;
};

export const load: PageServerLoad = async ({ url }) => {
	const cluster = (url.searchParams.get("cluster") ?? "ALL").trim(); // IndicatorCategory
	const programme = (url.searchParams.get("programme") ?? "ALL").trim(); // Programme enum/string
	const project = (url.searchParams.get("project") ?? "ALL").trim();
	const indicatorId = (url.searchParams.get("indicator") ?? "ALL").trim();

	const startYear = Number(url.searchParams.get("startYear") ?? new Date().getFullYear()) || new Date().getFullYear();
	const endYear = Number(url.searchParams.get("endYear") ?? new Date().getFullYear()) || new Date().getFullYear();

	const where: any = {};
	if (cluster !== "ALL") where.category = cluster;
	if (indicatorId !== "ALL") where.id = indicatorId;

	// Filter by programme via project relation (adjust if your relation differs)
	if (programme !== "ALL") {
		where.project = { programme };
	}

	// Dropdown sources
	const [indicators, projectsForProgramme] = await Promise.all([
		prisma.indicator.findMany({
			where,
			orderBy: { updatedAt: "desc" },
			select: {
				id: true,
				indicatorCode: true,
				indicatorName: true,
				category: true,
				unit: true,
				targetValue: true,
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
				project: {
					select: {
						id: true,
						projectName: true,
						programme: true
					}
				}
			}
		}),
		// you can replace this with a real "Programme list" query if you store it elsewhere
		prisma.project.findMany({
			select: { programme: true },
			distinct: ["programme" as any] // TS workaround depending on your prisma version
		})
	]);

	// Programmes list from projects
	const programmes = Array.from(
		new Set(projectsForProgramme.map((p: any) => String(p.programme)))
	).sort();

	// Clusters list (use your enum list if available)
	// If you have IndicatorCategory enum in Prisma, this is usually best loaded from constants.
	const clusters = ["ALL", "Proverty", "WASH", "Microfinance"]; // adjust to your real categories
	const indicatorType = ["ALL", "OUTPUT", "OUTCOME", "IMPACT"]; // adjust to your real categories

	// KPI aggregates
	const totalIndicators = indicators.length;

	const totalTarget = indicators.reduce((s:any, x:any) => s + toNum(x.targetValue), 0);
	const totalAchieved = indicators.reduce((s:any, x:any) => s + toNum(x.achievedValue), 0);

	const avgAchievementPct = clamp((totalAchieved / Math.max(1, totalTarget)) * 100);

	const best = indicators
		.map((x:any) => {
			const t = toNum(x.targetValue);
			const a = toNum(x.achievedValue);
			return {
				id: x.id,
				name: x.indicatorName,
				code: x.indicatorCode,
				pct: clamp((a / Math.max(1, t)) * 100)
			};
		})
		.sort((a:any, b:any) => b.pct - a.pct)[0];

	// ===== Chart series =====
	// If you have a yearly/monthly IndicatorAchievement table, replace this block with real aggregation.
	// Fallback: create "flat" annual series so UI never breaks.
	const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

	// If a single indicator selected => show that one. Else aggregate across filtered indicators.
	const selected = indicatorId !== "ALL" ? indicators.find((i: any) => i.id === indicatorId) : null;

	const annualSeries = years.map((y) => {
		if (selected) {
			return {
				year: y,
				target: toNum(selected.targetValue?? 50),
				achieved: toNum(selected.achievedValue?? 45)
			};
		}
		return {
			year: y,
			target: totalTarget,
			achieved: totalAchieved
		};
	});

	// Disaggregation pie (use achieved gender by default; fallback to targets if achieved all 0)
	const disagg = (() => {
		const m = selected ? selected.achievedMale : indicators.reduce((s:any, x:any) => s + (x.achievedMale ?? 0), 0);
		const f = selected ? selected.achievedFemale : indicators.reduce((s:any, x:any) => s + (x.achievedFemale ?? 0), 0);
		const o = selected ? selected.achievedOther : indicators.reduce((s:any, x:any) => s + (x.achievedOther ?? 0), 0);

		if ((m ?? 0) + (f ?? 0) + (o ?? 0) > 0) {
			return { male: m ?? 0, female: f ?? 0, other: o ?? 0 };
		}

		const tm = selected ? selected.targetMale : indicators.reduce((s, x) => s + (x.targetMale ?? 0), 0);
		const tf = selected ? selected.targetFemale : indicators.reduce((s, x) => s + (x.targetFemale ?? 0), 0);
		const to = selected ? selected.targetOther : indicators.reduce((s, x) => s + (x.targetOther ?? 0), 0);
		return { male: tm ?? 0, female: tf ?? 0, other: to ?? 0 };
	})();

	return {
		filters: { cluster, programme, project, indicatorId, indicatorType, startYear, endYear },
		clusters,
		programmes,
		indicatorType,
		indicators,
		kpis: {
			totalIndicators,
			totalTarget,
			totalAchieved,
			avgAchievementPct,
			best
		},
		charts: {
			annualSeries,
			disagg
		}
	};
};
