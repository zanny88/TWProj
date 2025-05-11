import axios from "axios";


export async function sendMessage(to, from, body, api_url) {
    const payload = {
        toUser: to,
        fromUser: from,
        message: body
    }

    try {
        await axios.post(`${api_url}user/sendMessage`, payload);
    } catch (error) {
        console.error("Error while sending message: ", error);
    }
}
