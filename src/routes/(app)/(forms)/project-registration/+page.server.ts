import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/prisma";

type FieldErrors = Record<string, string>;

function toInt(v: FormDataEntryValue | null) {
	const n = Number(v ?? 0);
	return Number.isFinite(n) ? n : 0;
}
function toDecimalString(v: string) {
	// basic sanitize (Prisma Decimal accepts string)
	const cleaned = v.replace(/[^\d.]/g, "");
	return cleaned === "" ? "0" : cleaned;
}
function requiredStr(v: FormDataEntryValue | null) {
	return String(v ?? "").trim();
}

function isoDateOrNull(v: string) {
	// input[type=date] gives "YYYY-MM-DD"
	if (!v) return null;
	const d = new Date(v + "T00:00:00.000Z");
	return Number.isNaN(d.getTime()) ? null : d;
}

// Generate a unique projectId on server (authoritative)
async function generateProjectId(programme: string) {
	const prog = programme.replace(/\s+/g, "").toUpperCase().slice(0, 4) || "PRJ";
	const year = new Date().getFullYear();
	// simple sequence based on count in year (customize to your rule)
	const like = `${prog}-${year}-`;
	const count = await prisma.project.count({
		where: { projectId: { startsWith: like } }
	});
	const seq = String(count + 1).padStart(4, "0");
	return `${prog}-${year}-${seq}`;
}

export const load: PageServerLoad = async () => {
	// Programme might be an enum in Prisma; adapt as needed.
	// If Programme is an enum, you can also import it from @prisma/client and list values.
	const programmes = ["TBCP", "WASH", "BEP", "BHP", "BEP"];

	const donors = await prisma.donor.findMany({ select: { id: true, donorName: true }, orderBy: { donorName: "asc" } });
	const districts = await prisma.district.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
	const upazillas = await prisma.upazilla.findMany({ select: { id: true, name: true, districtId: true }, orderBy: { name: "asc" } });
	const branches = await prisma.branch.findMany({ select: { id: true, name: true, upazillaId: true }, orderBy: { name: "asc" } });

	const upazillasByDistrict: Record<number, { id: number; name: string }[]> = {};
	for (const u of upazillas) (upazillasByDistrict[u.districtId] ??= []).push({ id: u.id, name: u.name });

	const branchesByUpazilla: Record<number, { id: number; name: string }[]> = {};
	for (const b of branches) (branchesByUpazilla[b.upazillaId] ??= []).push({ id: b.id, name: b.name });
    // console.log(donors)
	return { 
        programmes, 
        donors, 
        districts, 
        upazillasByDistrict, 
        branchesByUpazilla 
    };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();

		const values = {
			projectName: requiredStr(fd.get("projectName")),
			projectType: requiredStr(fd.get("projectType")),
			projectDuration: requiredStr(fd.get("projectDuration")),
			programme: requiredStr(fd.get("programme")),
			donorId: String(fd.get("donorId") ?? ""),

			districtId: String(fd.get("districtId") ?? ""),
			upazillaId: String(fd.get("upazillaId") ?? ""),
			branchId: String(fd.get("branchId") ?? ""),

			budget: requiredStr(fd.get("budget")),
			currency: requiredStr(fd.get("currency")) || "BDT",
			status: requiredStr(fd.get("status")) || "ACTIVE",
			isActive: requiredStr(fd.get("isActive")) || "true",

			totalTarget: requiredStr(fd.get("totalTarget")),
			targetMale: requiredStr(fd.get("targetMale")),
			targetFemale: requiredStr(fd.get("targetFemale")),
			targetOther: requiredStr(fd.get("targetOther")),
			targetDisabled: requiredStr(fd.get("targetDisabled")),

			startDate: requiredStr(fd.get("startDate")),
			endDate: requiredStr(fd.get("endDate")),

			discription: requiredStr(fd.get("discription")),
			objectives: requiredStr(fd.get("objectives"))
		};

		const errors: FieldErrors = {};

		if (!values.projectName) errors.projectName = "Project name is required.";
		if (!values.programme) errors.programme = "Programme is required.";

		const donorId = toInt(fd.get("donorId"));
		const districtId = toInt(fd.get("districtId"));
		const upazillaId = toInt(fd.get("upazillaId"));
		const branchId = toInt(fd.get("branchId"));

		if (!donorId) errors.donorId = "Donor is required.";
		if (!districtId) errors.districtId = "District is required.";
		if (!upazillaId) errors.upazillaId = "Upazilla is required.";
		if (!branchId) errors.branchId = "Branch is required.";

		const projectDuration = values.projectDuration ? Number(values.projectDuration) : null;
		if (values.projectDuration && (!Number.isFinite(projectDuration!) || projectDuration! < 0)) {
			errors.projectDuration = "Duration must be a valid number (months).";
		}

		const startDate = isoDateOrNull(values.startDate);
		const endDate = isoDateOrNull(values.endDate);
		if (!startDate) errors.startDate = "Start date is required.";
		if (!endDate) errors.endDate = "End date is required.";
		if (startDate && endDate && endDate < startDate) errors.endDate = "End date must be after start date.";

		const budgetStr = toDecimalString(values.budget);
		if (Number(budgetStr) < 0) errors.budget = "Budget cannot be negative.";

		// targets
		const targets = {
			totalTarget: Number(values.totalTarget || 0),
			targetMale: Number(values.targetMale || 0),
			targetFemale: Number(values.targetFemale || 0),
			targetOther: Number(values.targetOther || 0),
			targetDisabled: Number(values.targetDisabled || 0)
		};
		for (const [k, v] of Object.entries(targets)) {
			if (!Number.isFinite(v) || v < 0) errors[k] = "Must be a non-negative number.";
		}

		if (Object.keys(errors).length) {
			return fail(400, { error: "Please fix the errors and try again.", fieldErrors: errors, values });
		}

		try {
			const projectId = await generateProjectId(values.programme);

			await prisma.project.create({
				data: {
					projectId,
					projectName: values.projectName,
					projectType: values.projectType || null,
					projectDuration: projectDuration ?? null,

					programme: values.programme as any, // if Programme is enum, cast properly
					donorId,
					districtId,
					upazillaId,
					branchId,

					budget: budgetStr, // Prisma Decimal accepts string
					currency: values.currency || "BDT",
					status: values.status as any, // ParticipantStatus enum
					isActive: values.isActive === "true",

					totalTarget: targets.totalTarget,
					targetMale: targets.targetMale,
					targetFemale: targets.targetFemale,
					targetOther: targets.targetOther,
					targetDisabled: targets.targetDisabled,

					startDate: startDate!,
					endDate: endDate!,

					discription: values.discription || null,
					objectives: values.objectives || null
				}
			});

			return { ok: true };
		} catch (e: any) {
			if (e?.code === "P2002") {
				const target = String(e?.meta?.target ?? "");
				// projectId unique or @@unique([projectName, branchId])
				if (target.includes("projectId")) {
					return fail(409, { error: "Project ID already exists. Please retry.", values });
				}
				if (target.includes("projectName") && target.includes("branchId")) {
					return fail(409, {
						error: "A project with this name already exists in the selected branch.",
						fieldErrors: { projectName: "Duplicate name for this branch." },
						values
					});
				}
				return fail(409, { error: "Duplicate value found. Please adjust and try again.", values });
			}

			return fail(500, { error: "Failed to save project. Please try again.", values });
		}
	}
};
