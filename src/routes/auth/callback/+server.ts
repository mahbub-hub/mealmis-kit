import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import {exchangeCodeForTokens, verifyAccessToken} from '$lib/server/keycloak'
import { createOrUpdateUser } from "$lib/server/userService";

export const GET: RequestHandler = async ({url, cookies}) => {
    const code = url.searchParams.get('code') ?? '';
    if (!code){
        throw error(400, 'Missing code')
    }

    const tokens = await exchangeCodeForTokens(code)
    const decoded = await verifyAccessToken(tokens.access_token)

    const user = await createOrUpdateUser(decoded, tokens.id_token)
    if(!user) throw error(400, 'User not created')

    cookies.set('session', JSON.stringify({userId: user.id, idToken: tokens.id_token}), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true
    })

    throw redirect(302, '/')
}
