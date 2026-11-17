import { env } from '$env/dynamic/private';

interface BracStaffInfo {
    staffpin?: string
    staffname?: string
    programme?: string | null
    emailid?: string | null
    mobileno?: string | null
}

export async function getUserInformation(pinNo: string): Promise<BracStaffInfo> {
    const url = new URL(`${env.BRAC_NET_BASE_URL}/staffs/${pinNo}`);
    url.searchParams.set('key', `${env.BRAC_NET_SECRET_KEY}`);
    url.searchParams.set('fields', 'staffpin,staffname,emailid,mobileno');

    try {
        const res = await fetch(url.toString(), {method: 'GET'});
        if(!res.ok){
            return {
                emailid: null, 
                mobileno: null
            }
        }
        const json = await res.json()
        if(Array.isArray(json) && json.length > 0){
            return json[0] as BracStaffInfo
        }
        return {
            emailid: null,
            mobileno: null
        }
    } catch (error) {
         return {
            emailid: null,
            mobileno: null
        }
    }
}