import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { Programme } from '../../../../../generated/prisma/enums';

const toInt = (v: FormDataEntryValue | null) => {
	const n = Number(String(v ?? '').trim());
	return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : NaN;
};

export const load: PageServerLoad = async () => {
	const [branches, activities] = await Promise.all([
		prisma.branch.findMany(),
		prisma.activity.findMany()
	]);

	return {
		branches,
		activities,
		programmes: Object.values(Programme)
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();

		// Month as YYYY-MM (from <input type="month">)
		const monthStr = String(fd.get('month') ?? '').trim(); // "2026-01"
		if (!/^\d{4}-\d{2}$/.test(monthStr)) return fail(400, { message: 'Month is required (YYYY-MM).' });

		const programme = String(fd.get('programme') ?? '').trim();
		if (!Object.values(Programme).includes(programme as Programme))
			return fail(400, { message: 'Programme is invalid.' });

		const district = String(fd.get('district') ?? '').trim();
		const upazilla = String(fd.get('upazilla') ?? '').trim();
		const union = String(fd.get('union') ?? '').trim();

		if (!district) return fail(400, { message: 'District is required.' });
		if (!upazilla) return fail(400, { message: 'Upazilla is required.' });
		if (!union) return fail(400, { message: 'Union is required.' });

		const branchId = toInt(fd.get('branchId'));
		const activityId = String(fd.get('activityId') ?? '').trim();
		if (!branchId) return fail(400, { message: 'Branch Name is required.' });
		if (!activityId) return fail(400, { message: 'Activity is required.' });

		const totalAchievements = toInt(fd.get('totalAchievements'));
		if (!Number.isFinite(totalAchievements)) return fail(400, { message: 'Total Achievements must be a number.' });

		const male = toInt(fd.get('male'));
		const female = toInt(fd.get('female'));
		const others = toInt(fd.get('others'));
		const disableMale = toInt(fd.get('disableMale'));
		const disableFemale = toInt(fd.get('disableFemale'));
		const disableOthers = toInt(fd.get('disableOthers'));

		const nums = [male, female, others, disableMale, disableFemale, disableOthers];
		if (nums.some((n) => !Number.isFinite(n))) return fail(400, { message: 'All numeric fields must be valid numbers.' });

		// Optional consistency rule:
		// if (male + female + others !== totalAchievements) return fail(400, { message: 'Male+Female+Others must equal Total Achievements.' });

		// Ensure branch/activity exist (avoid FK errors)
		const [branch, activity] = await Promise.all([
			prisma.branch.findUnique({ where: { id: branchId }, select: { id: true } }),
			prisma.activity.findUnique({ where: { id: activityId }, select: { id: true } })
		]);
		if (!branch) return fail(400, { message: 'Selected branch not found.' });
		if (!activity) return fail(400, { message: 'Selected activity not found.' });
		
		await prisma.activityAchievement.upsert({
			where: {
				month_activityId_branchId: {
					month: monthStr,
					activityId,
					branchId
				}
			},
			create: {
				month: monthStr,
				programme: programme as Programme,
				branchId,
				activityId,
				total: totalAchievements,
				male,
				female,
				others,
				disabledMale: disableMale,
				disabledFemale: disableFemale,
				disabledOthers: disableOthers,
				remarks: [district, upazilla, union].filter(Boolean).join(', ') || null
			},
			update: {
				programme: programme as Programme,
				total: totalAchievements,
				male,
				female,
				others,
				disabledMale: disableMale,
				disabledFemale: disableFemale,
				disabledOthers: disableOthers,
				remarks: [district, upazilla, union].filter(Boolean).join(', ') || null
			}
		});

		return { success: true };
	}
};
