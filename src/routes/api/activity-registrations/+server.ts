import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';

function toInt(value: unknown) {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

async function generateActivityCode(projectId: number) {
	const year = new Date().getFullYear();
	const like = `ACT-${year}-${projectId}-`;
	const count = await prisma.activity.count({
		where: { activityCode: { startsWith: like } }
	});
	return `${like}${String(count + 1).padStart(4, '0')}`;
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		const divisionId = url.searchParams.get('divisionId');
		if (divisionId) {
			const districts = await prisma.district.findMany({
				where: { divisionId: toInt(divisionId) },
				orderBy: { name: 'asc' }
			});
			return json(districts);
		}

		const activities = await prisma.activity.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				project: true,
				branch: true,
				indicators: true
			}
		});
		return json(activities);
	} catch (error) {
		console.error('Error fetching activity registrations:', error);
		return json({ error: 'Failed to fetch registrations' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const projectId = toInt(data.projectId);
		const branchId = toInt(data.branchId);
		const activityName = String(data.activityName ?? '').trim();

		if (!projectId || !branchId || !activityName) {
			return json({ message: 'projectId, branchId, and activityName are required' }, { status: 400 });
		}

		const indicatorIds: string[] = Array.isArray(data.indicatorIds) ? data.indicatorIds.map(String).filter(Boolean) : [];
		const activity = await prisma.activity.create({
			data: {
				projectId,
				branchId,
				activityName,
				activityCode: String(data.activityCode ?? '') || (await generateActivityCode(projectId)),
				totalParticipants: toInt(data.totalParticipants),
				male: toInt(data.male),
				female: toInt(data.female),
				others: toInt(data.others),
				disabledMale: toInt(data.disabledMale),
				disabledFemale: toInt(data.disabledFemale),
				disabledOthers: toInt(data.disabledOthers),
				status: data.status ?? 'Pending',
				remarks: data.remarks ? String(data.remarks) : null,
				isActive: data.isActive ?? true,
				...(indicatorIds.length ? { indicators: { connect: indicatorIds.map((id) => ({ id })) } } : {})
			},
			include: {
				project: true,
				branch: true,
				indicators: true
			}
		});
		return json(activity, { status: 201 });
	} catch (error) {
		console.error('Error creating activity registration:', error);
		return json({ error: 'Failed to create registration' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		await prisma.activity.delete({ where: { id: String(data.id ?? '') } });
		return json({ message: 'Activity registration deleted successfully' });
	} catch (error) {
		console.error('Error deleting activity registration:', error);
		return json({ error: 'Failed to delete registration' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const id = String(data.id ?? '');
		const indicatorIds: string[] | undefined = Array.isArray(data.indicatorIds) ? data.indicatorIds.map(String).filter(Boolean) : undefined;

		const updatedActivity = await prisma.activity.update({
			where: { id },
			data: {
				...(data.activityName !== undefined ? { activityName: String(data.activityName) } : {}),
				...(data.branchId !== undefined ? { branchId: toInt(data.branchId) } : {}),
				...(data.totalParticipants !== undefined ? { totalParticipants: toInt(data.totalParticipants) } : {}),
				...(data.male !== undefined ? { male: toInt(data.male) } : {}),
				...(data.female !== undefined ? { female: toInt(data.female) } : {}),
				...(data.others !== undefined ? { others: toInt(data.others) } : {}),
				...(data.disabledMale !== undefined ? { disabledMale: toInt(data.disabledMale) } : {}),
				...(data.disabledFemale !== undefined ? { disabledFemale: toInt(data.disabledFemale) } : {}),
				...(data.disabledOthers !== undefined ? { disabledOthers: toInt(data.disabledOthers) } : {}),
				...(data.status !== undefined ? { status: data.status } : {}),
				...(data.remarks !== undefined ? { remarks: data.remarks ? String(data.remarks) : null } : {}),
				...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
				...(indicatorIds ? { indicators: { set: indicatorIds.map((indicatorId) => ({ id: indicatorId })) } } : {})
			},
			include: {
				project: true,
				branch: true,
				indicators: true
			}
		});
		return json(updatedActivity);
	} catch (error) {
		console.error('Error updating activity registration:', error);
		return json({ error: 'Failed to update registration' }, { status: 500 });
	}
};
