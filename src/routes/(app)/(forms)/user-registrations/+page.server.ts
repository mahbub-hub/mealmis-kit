import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { prisma } from "$lib/prisma";
import bcrypt from "bcryptjs"; // pnpm add bcryptjs

type FieldErrors = Record<string, string>;
type UserRole = "USER" | "ADMIN" | "MANAGER"; // align with your Prisma enum

function requiredStr(v: FormDataEntryValue | null) {
	return String(v ?? "").trim();
}

function isEmail(v: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function parseIdsJson(raw: string): number[] {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0);
	} catch {
		return [];
	}
}

export const load: PageServerLoad = async () => {
	const roles: UserRole[] = ["USER", "MANAGER", "ADMIN"]; // adjust

	const projects = await prisma.project.findMany({
		select: { id: true, projectName: true },
		orderBy: { projectName: "asc" }
	});

	const branches = await prisma.branch.findMany({
		select: { id: true, name: true },
		orderBy: { name: "asc" }
	});

	return {
		roles,
		projects: projects.map((p) => ({ id: p.id, name: p.projectName })),
		branches
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();

		const values = {
			email: requiredStr(fd.get("email")),
			username: requiredStr(fd.get("username")),
			name: requiredStr(fd.get("name")),
			role: requiredStr(fd.get("role")) || "USER",

			password: requiredStr(fd.get("password")),
			confirmPassword: requiredStr(fd.get("confirmPassword")),

			projectIds: String(fd.get("projectIds") ?? "[]"),
			branchIds: String(fd.get("branchIds") ?? "[]")
		};

		const errors: FieldErrors = {};

		if (!values.email) errors.email = "Email is required.";
		else if (!isEmail(values.email)) errors.email = "Invalid email format.";

		if (!values.username) errors.username = "Username is required.";
		else if (values.username.length < 3) errors.username = "Username must be at least 3 characters.";

		if (!values.password) errors.password = "Password is required.";
		else if (values.password.length < 6) errors.password = "Password must be at least 6 characters.";

		if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";

		const projectIds = parseIdsJson(values.projectIds);
		const branchIds = parseIdsJson(values.branchIds);

		if (Object.keys(errors).length) {
			return fail(400, {
				error: "Please fix the errors and try again.",
				fieldErrors: errors,
				values: {
					...values,
					projectIds: JSON.stringify(projectIds),
					branchIds: JSON.stringify(branchIds)
				}
			});
		}

		try {
			const passwordHash = await bcrypt.hash(values.password, 10);

			await prisma.user.create({
				data: {
					email: values.email,
					username: values.username,
					name: values.name || null,
					password: passwordHash,
					role: values.role as any,

					...(projectIds.length
						? { projects: { connect: projectIds.map((id) => ({ id })) } }
						: {}),
					...(branchIds.length
						? { branches: { connect: branchIds.map((id) => ({ id })) } }
						: {})
				}
			});

			return { ok: true };
		} catch (e: any) {
			// Prisma unique constraint
			if (e?.code === "P2002") {
				const target = String(e?.meta?.target ?? "");
				if (target.includes("email")) {
					return fail(409, { error: "Email already exists.", fieldErrors: { email: "This email is already in use." }, values });
				}
				if (target.includes("username")) {
					return fail(409, { error: "Username already exists.", fieldErrors: { username: "This username is already in use." }, values });
				}
				return fail(409, { error: "Duplicate value found. Please adjust and try again.", values });
			}

			return fail(500, { error: "Failed to create user. Please try again.", values });
		}
	}
};
