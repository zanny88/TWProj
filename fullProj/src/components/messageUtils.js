import { inject } from "vue";
import axios from "axios";

const api_url = "http://localhost:3000/";

export async function sendMessage(to,from,body){
    const payload = {
        toUser: to,
        fromUser: from,
        message: body
    }

    try{
        await axios.post(`${api_url}user/sendMessage`,payload);
    }catch(error){
        console.log("Error while sending message: ",error);
    }
}