import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/prisma";

type FieldErrors = Record<string, string>;

function requiredStr(v: FormDataEntryValue | null) {
	return String(v ?? "").trim();
}
function toInt(v: FormDataEntryValue | null, fallback = 0) {
	const n = Number(v ?? fallback);
	return Number.isFinite(n) ? n : fallback;
}
function nonNegInt(name: string, v: FormDataEntryValue | null, errors: FieldErrors) {
	const n = Number(v ?? 0);
	if (!Number.isFinite(n) || n < 0) errors[name] = "Must be a non-negative number.";
	return Math.max(0, Number.isFinite(n) ? n : 0);
}

export const load: PageServerLoad = async () => {
	// Months: YYYY-MM
	const now = new Date();
	const months = Array.from({ length: 12 }, (_, i) => {
		const d = new Date(now.getFullYear(), i, 1);
		const value = `${d.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
		const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
		return { value, label };
	});

	// Replace with your real Programme enum/list
	const programmes = ["TBCP", "WASH", "Education", "Health"];

	// Geo
	const divisions = await prisma.division.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
	const districts = await prisma.district.findMany({ select: { id: true, name: true, divisionId: true }, orderBy: { name: "asc" } });
	const upazillas = await prisma.upazilla.findMany({ select: { id: true, name: true, districtId: true }, orderBy: { name: "asc" } });

	const districtsByDivision: Record<number, { id: number; name: string }[]> = {};
	for (const d of districts) (districtsByDivision[d.divisionId] ??= []).push({ id: d.id, name: d.name });

	const upazillasByDistrict: Record<number, { id: number; name: string }[]> = {};
	for (const u of upazillas) (upazillasByDistrict[u.districtId] ??= []).push({ id: u.id, name: u.name });

	// Branches by upazilla
	const branches = await prisma.branch.findMany({
		select: { id: true, name: true, upazillaId: true },
		orderBy: { name: "asc" }
	});
	const branchesByUpazilla: Record<number, { id: number; name: string }[]> = {};
	for (const b of branches) (branchesByUpazilla[b.upazillaId] ??= []).push({ id: b.id, name: b.name });

	// Activities by branch
	const acts = await prisma.activity.findMany({
		select: { id: true, activityName: true, branchId: true },
		orderBy: { activityName: "asc" }
	});
	const activitiesByBranch: Record<number, { id: string; activityName: string }[]> = {};
	for (const a of acts) (activitiesByBranch[a.branchId] ??= []).push({ id: a.id, activityName: a.activityName });

	return { 
		months, 
		programmes, 
		divisions, 
		districtsByDivision, 
		upazillasByDistrict, 
		branchesByUpazilla, 
		activitiesByBranch 
	};
};

export const actions: Actions = {
	save: async ({ request }) => {
		const fd = await request.formData();

		const values = {
			month: requiredStr(fd.get("month")),
			programme: requiredStr(fd.get("programme")),

			divisionId: String(fd.get("divisionId") ?? ""),
			districtId: String(fd.get("districtId") ?? ""),
			upazillaId: String(fd.get("upazillaId") ?? ""),

			branchId: toInt(fd.get("branchId")),
			activityId: requiredStr(fd.get("activityId")),

			total: String(fd.get("total") ?? "0"),
			male: String(fd.get("male") ?? "0"),
			female: String(fd.get("female") ?? "0"),
			others: String(fd.get("others") ?? "0"),

			disabledMale: String(fd.get("disabledMale") ?? "0"),
			disabledFemale: String(fd.get("disabledFemale") ?? "0"),
			disabledOthers: String(fd.get("disabledOthers") ?? "0"),

			remarks: requiredStr(fd.get("remarks"))
		};

		const errors: FieldErrors = {};

		if (!values.month) errors.month = "Month is required.";
		if (!values.programme) errors.programme = "Programme is required.";
		if (!values.branchId) errors.branchId = "Branch is required.";
		if (!values.activityId) errors.activityId = "Activity is required.";

		const total = nonNegInt("total", fd.get("total"), errors);
		const male = nonNegInt("male", fd.get("male"), errors);
		const female = nonNegInt("female", fd.get("female"), errors);
		const others = nonNegInt("others", fd.get("others"), errors);

		const disabledMale = nonNegInt("disabledMale", fd.get("disabledMale"), errors);
		const disabledFemale = nonNegInt("disabledFemale", fd.get("disabledFemale"), errors);
		const disabledOthers = nonNegInt("disabledOthers", fd.get("disabledOthers"), errors);

		if (Object.keys(errors).length) {
			return fail(400, { error: "Please fix the errors and try again.", fieldErrors: errors, values });
		}

		try {
			// Upsert by unique constraint: month + activityId + branchId
			await prisma.activityAchievement.upsert({
				where: {
					month_activityId_branchId: {
						month: values.month,
						activityId: values.activityId,
						branchId: values.branchId
					}
				},
				create: {
					month: values.month,
					programme: values.programme as any, // if Programme enum, keep as any or import type
					activityId: values.activityId,
					branchId: values.branchId,
					total,
					male,
					female,
					others,
					disabledMale,
					disabledFemale,
					disabledOthers,
					remarks: values.remarks || null
				},
				update: {
					programme: values.programme as any,
					total,
					male,
					female,
					others,
					disabledMale,
					disabledFemale,
					disabledOthers,
					remarks: values.remarks || null
				}
			});

			return { ok: true };
		} catch (e) {
			return fail(500, { error: "Failed to save achievement. Please try again.", fieldErrors: {} as FieldErrors, values });
		}
	}
};
