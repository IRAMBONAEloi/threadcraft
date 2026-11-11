export async function sendWhatsAppNotification(message: string): Promise<void>   {
    const phone = process.env.OMWNER_WHATSAPP_PHONE;
    const apiKey = process.env.CALLMEBOT_API_KEY;

// if the owner hasn't set up their whatsaap details in .env yet, skip it

    if (!phone || !apiKey) {
        console.warn('Whatsapp notification skipped: OWNER_WHATSAPP_PHONE or CALLMEBOT_API_KEY is missing in .env');
        return;

    }

    //callmebot requires the phone number without the '+' sign

    const cleanPhone = phone.replace('+','');

    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;


    const response = await fetch(url);

    if(!response.ok) {
        throw new Error(`CallMeBot API failed with status: ${response.status}`);
    }
}