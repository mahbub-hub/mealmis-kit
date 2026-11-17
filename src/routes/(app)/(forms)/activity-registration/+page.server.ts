import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/prisma";

type FieldErrors = Record<string, string>;

function toInt(v: FormDataEntryValue | null) {
	const n = Number(v ?? 0);
	return Number.isFinite(n) ? n : 0;
}

function requiredStr(v: FormDataEntryValue | null) {
	return String(v ?? "").trim();
}

async function generateActivityCode(programme: string) {
	const prefix = (programme || "ACT").replace(/\s+/g, "").toUpperCase().slice(0, 4);
	const year = new Date().getFullYear();
	const like = `${prefix}-${year}-`;
	const count = await prisma.activity.count({
		where: { activityCode: { startsWith: like } }
	});
	const seq = String(count + 1).padStart(4, "0");
	return `${prefix}-${year}-${seq}`;
}

export const load: PageServerLoad = async () => {
	// Projects (need programme too)
	const projects = await prisma.project.findMany({
		select: { id: true, projectId: true, projectName: true, programme: true },
		orderBy: { projectName: "asc" }
	});

	// Branches grouped by project (via branch relation on Project)
	// If your Project has branchId, then each project has a single branch.
	// Your screenshot shows Branch selectable, so we allow selecting from branches in same project’s upazilla/district etc.
	// Here: group branches by project using the project's upazilla (common pattern). Adjust as needed.
	const allBranches = await prisma.branch.findMany({
		select: { id: true, name: true, upazillaId: true }
	});

	const branchesByProject: Record<number, { id: number; name: string }[]> = {};
	// Simple default: allow all branches for all projects (replace with your business rule)
	for (const p of projects) {
		branchesByProject[p.id] = allBranches.map((b) => ({ id: b.id, name: b.name }));
	}

	// Geo lists (optional; used for UI multi-select)
	const divisions = await prisma.division.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
	const districts = await prisma.district.findMany({ select: { id: true, name: true, divisionId: true }, orderBy: { name: "asc" } });
	const upazillas = await prisma.upazilla.findMany({ select: { id: true, name: true, districtId: true }, orderBy: { name: "asc" } });

	const districtsByDivision: Record<number, { id: number; name: string }[]> = {};
	for (const d of districts) (districtsByDivision[d.divisionId] ??= []).push({ id: d.id, name: d.name });

	const upazillasByDistrict: Record<number, { id: number; name: string }[]> = {};
	for (const u of upazillas) (upazillasByDistrict[u.districtId] ??= []).push({ id: u.id, name: u.name });

	// Indicators (many-to-many connect)
	const indicators = await prisma.indicator.findMany({ select: { id: true, indicatorName: true }, orderBy: { indicatorName: "asc" } });

	return {
		projects: projects.map((p) => ({ ...p, programme: String(p.programme) })),
		branchesByProject,
		divisions,
		districtsByDivision,
		upazillasByDistrict,
		indicators
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();

		const values = {
			projectId: String(fd.get("projectId") ?? ""),
			activityName: requiredStr(fd.get("activityName")),
			branchId: String(fd.get("branchId") ?? ""),

			totalParticipants: requiredStr(fd.get("totalParticipants")),
			male: requiredStr(fd.get("male")),
			female: requiredStr(fd.get("female")),
			others: requiredStr(fd.get("others")),

			disabledMale: requiredStr(fd.get("disabledMale")),
			disabledFemale: requiredStr(fd.get("disabledFemale")),
			disabledOthers: requiredStr(fd.get("disabledOthers")),

			status: requiredStr(fd.get("status")) || "Pending",
			remarks: requiredStr(fd.get("remarks")),
			isActive: requiredStr(fd.get("isActive")) || "true",

			// programme passed from page (for code generation)
			programme: requiredStr(fd.get("programme")),

			// JSON arrays from hidden inputs
			indicatorIds: String(fd.get("indicatorIds") ?? "[]")
		};

		const errors: FieldErrors = {};

		const projectId = toInt(fd.get("projectId"));
		const branchId = toInt(fd.get("branchId"));

		if (!projectId) errors.projectId = "Project is required.";
		if (!values.activityName) errors.activityName = "Activity name is required.";
		if (!branchId) errors.branchId = "Branch is required.";

		function nonNegInt(name: string, v: string) {
			const n = Number(v || 0);
			if (!Number.isFinite(n) || n < 0) errors[name] = "Must be a non-negative number.";
			return n;
		}

		const nums = {
			totalParticipants: nonNegInt("totalParticipants", values.totalParticipants),
			male: nonNegInt("male", values.male),
			female: nonNegInt("female", values.female),
			others: nonNegInt("others", values.others),
			disabledMale: nonNegInt("disabledMale", values.disabledMale),
			disabledFemale: nonNegInt("disabledFemale", values.disabledFemale),
			disabledOthers: nonNegInt("disabledOthers", values.disabledOthers)
		};

	let indicatorIds: string[] = [];
		try {
			const parsed = JSON.parse(values.indicatorIds);
			if (Array.isArray(parsed)) indicatorIds = parsed.map((x) => String(x)).filter(Boolean);
		} catch {
			// ignore
		}

		if (Object.keys(errors).length) {
			return fail(400, { error: "Please fix the errors and try again.", fieldErrors: errors, values: { ...values, indicatorIds: JSON.stringify(indicatorIds) } });
		}

		try {
			const activityCode = await generateActivityCode(values.programme);

			await prisma.activity.create({
				data: {
					activityName: values.activityName,
					activityCode,
					projectId,
					branchId,

					totalParticipants: nums.totalParticipants,
					male: nums.male,
					female: nums.female,
					others: nums.others,

					disabledMale: nums.disabledMale,
					disabledFemale: nums.disabledFemale,
					disabledOthers: nums.disabledOthers,

					status: values.status as any,
					remarks: values.remarks || null,
					isActive: values.isActive === "true",

					// connect indicators (many-to-many)
					...(indicatorIds.length
						? {
								indicators: {
									connect: indicatorIds.map((id) => ({ id }))
								}
						  }
						: {})
				}
			});

			return { ok: true };
		} catch (e: any) {
			if (e?.code === "P2002") {
				const target = String(e?.meta?.target ?? "");
				// activityCode unique OR @@unique([activityName, projectId])
				if (target.includes("activityCode")) {
					return fail(409, { error: "Activity code already exists. Please retry.", values });
				}
				if (target.includes("activityName") && target.includes("projectId")) {
					return fail(409, {
						error: "An activity with this name already exists in the selected project.",
						fieldErrors: { activityName: "Duplicate activity name for this project." },
						values
					});
				}
				return fail(409, { error: "Duplicate value found. Please adjust and try again.", values });
			}

			return fail(500, { error: "Failed to create activity. Please try again.", values });
		}
	}
};
