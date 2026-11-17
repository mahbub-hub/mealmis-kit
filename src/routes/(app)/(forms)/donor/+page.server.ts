import { prisma } from '$lib/prisma';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const donors = await prisma.donor.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    }); 
    return { donors };
};

export const actions: Actions = {
    create: async ({ request }: { request: Request }) => {
        const data = await request.formData();
        try {
            const donorName = data.get('donorName') as string;
            const donorType = data.get('donorType') as string;
            const country = data.get('country') as string;
            const description = data.get('description') as string;
            const isActiveRow = data.get('isActive') ;
            const isActive = isActiveRow === 'on' || isActiveRow === 'true';

            await prisma.donor.create({
                data: {
                   donorName,
                   donorType,
                   country,
                   description,
                   isActive
                },
            });

        } catch (error) {
            console.error('Error creating donor:', error);
            return fail(500, { message: 'Internal Server Error' });
        }
        return { 
            success: true 
        };
    }
}  