import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
// Adjust import path to your Prisma client
import { prisma } from "$lib/prisma";

type FieldErrors = Record<string, string>;

function isEmail(v: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isPhone(v: string) {
	// simple BD-friendly check (customize)
	return v === "" || /^[0-9+\-\s]{8,20}$/.test(v);
}
function toInt(v: FormDataEntryValue | null) {
	const n = Number(v ?? 0);
	return Number.isFinite(n) ? n : 0;
}

export const load: PageServerLoad = async () => {
	// You likely already have these tables
	const divisions = await prisma.division.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
	const districts = await prisma.district.findMany({ select: { id: true, name: true, divisionId: true }, orderBy: { name: "asc" } });
	const upazillas = await prisma.upazilla.findMany({ select: { id: true, name: true, districtId: true }, orderBy: { name: "asc" } });
	const unions = await prisma.union.findMany({ select: { id: true, name: true, upazillaId: true }, orderBy: { name: "asc" } });

	// Build lookup maps for fast cascading
	const districtsByDivision: Record<number, { id: number; name: string }[]> = {};
	for (const d of districts) {
		(districtsByDivision[d.divisionId] ??= []).push({ id: d.id, name: d.name });
	}

	const upazillasByDistrict: Record<number, { id: number; name: string }[]> = {};
	for (const u of upazillas) {
		(upazillasByDistrict[u.districtId] ??= []).push({ id: u.id, name: u.name });
	}

	const unionsByUpazilla: Record<number, { id: number; name: string }[]> = {};
	for (const u of unions) {
		(unionsByUpazilla[u.upazillaId] ??= []).push({ id: u.id, name: u.name });
	}

	return {
		divisions,
		districtsByDivision,
		upazillasByDistrict,
		unionsByUpazilla
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();

		const values = {
			name: String(fd.get("name") ?? "").trim(),
			code: String(fd.get("code") ?? "").trim(),
			divisionId: String(fd.get("divisionId") ?? ""),
			districtId: String(fd.get("districtId") ?? ""),
			upazillaId: String(fd.get("upazillaId") ?? ""),
			unionId: String(fd.get("unionId") ?? "0"),
			address: String(fd.get("address") ?? "").trim(),
			phone: String(fd.get("phone") ?? "").trim(),
			email: String(fd.get("email") ?? "").trim(),
			isActive: String(fd.get("isActive") ?? "true"),
			lat: String(fd.get("lat") ?? "").trim(),
			lng: String(fd.get("lng") ?? "").trim()
		};

		const errors: FieldErrors = {};

		if (!values.name) errors.name = "Branch name is required.";
		if (!values.code) errors.code = "Branch code is required.";

		const divisionId = toInt(fd.get("divisionId"));
		const districtId = toInt(fd.get("districtId"));
		const upazillaId = toInt(fd.get("upazillaId"));
		const unionIdRaw = toInt(fd.get("unionId"));
		const unionId = unionIdRaw > 0 ? unionIdRaw : null;

		if (!divisionId) errors.divisionId = "Division is required.";
		if (!districtId) errors.districtId = "District is required.";
		if (!upazillaId) errors.upazillaId = "Upazilla is required.";

		if (values.email && !isEmail(values.email)) errors.email = "Invalid email format.";
		if (!isPhone(values.phone)) errors.phone = "Invalid phone format.";

		// optional lat/lng validation (not in Prisma model, but in UI)
		if (values.lat && Number.isNaN(Number(values.lat))) errors.lat = "Latitude must be a number.";
		if (values.lng && Number.isNaN(Number(values.lng))) errors.lng = "Longitude must be a number.";

		if (Object.keys(errors).length) {
			return fail(400, { error: "Please fix the errors and try again.", fieldErrors: errors, values });
		}

		try {
			await prisma.branch.create({
				data: {
					name: values.name,
					code: values.code,
					divisionId,
					districtId,
					upazillaId,
					unionId,
					address: values.address || null,
					phone: values.phone || null,
					email: values.email || null,
					isActive: values.isActive === "true"
				}
			});

			return { ok: true };
		} catch (e: any) {
			// Prisma unique constraint error codes:
			// P2002 = Unique constraint failed
			if (e?.code === "P2002") {
				// could be code unique or @@unique(name, districtId)
				const msg = String(e?.meta?.target ?? "");
				if (msg.includes("code")) {
					return fail(409, { error: "Branch code already exists.", fieldErrors: { code: "This code is already in use." }, values });
				}
				if (msg.includes("name") && msg.includes("districtId")) {
					return fail(409, {
						error: "A branch with this name already exists in the selected district.",
						fieldErrors: { name: "Duplicate name for this district." },
						values
					});
				}
				return fail(409, { error: "Duplicate value found. Please adjust and try again.", values });
			}

			return fail(500, { error: "Failed to create branch. Please try again.", values });
		}
	}
};
