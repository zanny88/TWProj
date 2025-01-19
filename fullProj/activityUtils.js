const axios = require('axios'); 

//Funzione che genera una stringa HTML per l'invito ad un'attività
function generateActivityInvitationHTML(activity, user) {
    if (!activity || !activity._id || !activity.title) {
        throw new Error('Invalid activity object');
    }

    const acceptUrl = `${process.env.SERVER_URL}acceptActivityInvitation/${activity._id}/${user}`;
    const refuseUrl = `${process.env.SERVER_URL}refuseActivityInvitation/${activity._id}/${user}`;

    let endDate;
    if (activity.end) {
        endDate = new Date(activity.end).toLocaleString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric'
        });   
    } else {
        endDate = 'N/A';
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Activity Invitation</title>
    <style>
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 10px 5px;
            font-size: 16px;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .accept {
            background-color: #28a745;
        }
        .refuse {
            background-color: #dc3545;
        }
        .container {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .footer {
            font-size: 12px;
            color: #777777;
            text-align: center;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>You're Invited to an Activity!</h2>
        </div>
        <div class="content">
            <h3>${activity.title}</h3>
            <p>${activity.description}</p>
            <p><strong>End Date:</strong> ${endDate}</p>
            <div>
                <a href="${acceptUrl}" class="button accept">Accept</a>
                <a href="${refuseUrl}" class="button refuse">Refuse</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}


//gestione degli eventuali partecipanti all'attività condivisa
async function manageActivityParticipants(activity, User) {
    try {
        if (!activity || !activity.selectedParticipants || activity.selectedParticipants.length == 0) {
            return;  //nulla da fare --> esco
        }
        const part_waiting = activity.participants_waiting || [];
        const part_accepted = activity.participants_accepted || [];
        const part_refused = activity.participants_refused || [];
        for (let i = 0; i < activity.selectedParticipants.length; i++) {
            const user = activity.selectedParticipants[i];
            if (part_waiting.includes(user) || part_accepted.includes(user) || part_refused.includes(user)) {
                continue;
            }
            const userDB = await User.findOne({ username: user });
            //console.log("userDB="+JSON.stringify(userDB)+" " + userDB + " " + userDB.mail + " " + userDB.username);
            if (userDB && userDB.mail) {
                const email = userDB.mail;
                //mando l'invito
                let html = generateActivityInvitationHTML(activity, user);
                console.log("INVITO a " + user + " (" + userDB.mail + "): " + html);
                try {
                    const payload = {
                        to: user,
                        subject: `Invitation for activity: ${activity.title}`,
                        html: html
                    }
                    await axios.post(`${process.env.SERVER_URL}sendNotification`, payload);
                    activity.participants_waiting.push(user);
                    await activity.save();
                } catch (error) {
                    console.error("Errore: "+error);
                }
            } else {
                console.error("Invito ad attività non inviato a " + user + " per mancanza di mail configurata!");
            }
        }
    } catch (error) {
        console.error("Errore nella gestione dei partecipanti all'attività: ", error);
    }
}


//gestione accettazione di invito ad un'attività per un utente
async function acceptActivityInvitation(activityId, user, Activity) {
    try {
        const activity = await Activity.findOne({ _id: activityId });
        if (!activity) {
            console.error("Activity not found: " + activityId);
            return `
                <html>
                    <head><title>Activity Not Found</title></head>
                    <body>
                        <h1>Activity Not Found</h1>
                        <p>The activity you are trying to accept does not exist.</p>
                    </body>
                </html>
            `;
        }
        const part_waiting = activity.participants_waiting || [];
        const part_refused = activity.participants_refused || [];
        if (part_waiting.includes(user)) {
            activity.participants_waiting = part_waiting.filter(item => item !== user);
        }
        if (part_refused.includes(user)) {
            activity.participants_refused = part_refused.filter(item => item !== user);
        }
        if (!activity.participants_accepted.includes(user)) {
            activity.participants_accepted.push(user);
        }
        await activity.save();
        console.log("Activity accepted:" + activityId + " " + user);
        
        return `
            <html>
                <head>
                    <title>Activity Accepted</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            margin-top: 50px;
                        }
                        .message {
                            display: inline-block;
                            padding: 20px;
                            border: 2px solid #4CAF50;
                            border-radius: 10px;
                            background-color: #f9fff9;
                        }
                        .message h1 {
                            color: #4CAF50;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h1>Activity Accepted</h1>
                        <p>You have successfully accepted the activity invitation.</p>
                    </div>
                </body>
            </html>
        `;
    } catch (error) {
        console.error("ERROR: ", error);
        return `
            <html>
                <head><title>Error</title></head>
                <body>
                    <h1>An Error Occurred</h1>
                    <p>We were unable to accept the activity. Please try again later.</p>
                </body>
            </html>
        `;
    }
}

//gestione rifiuto di invito ad un'attività per un utente
async function refuseActivityInvitation(activityId, user, Activity) {
    try {
        const activity = await Activity.findOne({ _id: activityId });
        if (!activity) {
            console.error("Activity not found: " + activityId);
            return `
                <html>
                    <head><title>Activity Not Found</title></head>
                    <body>
                        <h1>Activity Not Found</h1>
                        <p>The activity you are trying to refuse does not exist.</p>
                    </body>
                </html>
            `;
        }
        const part_waiting = activity.participants_waiting || [];
        const part_accepted = activity.participants_accepted || [];
        if (part_waiting.includes(user)) {
            activity.participants_waiting = part_waiting.filter(item => item !== user);
        }
        if (part_accepted.includes(user)) {
            activity.participants_accepted = part_accepted.filter(item => item !== user);
        }
        if (!activity.participants_refused.includes(user)) {
            activity.participants_refused.push(user);
        }
        await activity.save();
        console.log("Activity refused:" + activityId + " " + user);
        
        return `
            <html>
                <head>
                    <title>Activity Refused</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            margin-top: 50px;
                        }
                        .message {
                            display: inline-block;
                            padding: 20px;
                            border: 2px solid #f44336;
                            border-radius: 10px;
                            background-color: #fff9f9;
                        }
                        .message h1 {
                            color: #f44336;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h1>Activity Refused</h1>
                        <p>You have successfully refused the activity invitation.</p>
                    </div>
                </body>
            </html>
        `;
    } catch (error) {
        console.error("ERROR: ", error);
        return `
            <html>
                <head><title>Error</title></head>
                <body>
                    <h1>An Error Occurred</h1>
                    <p>We were unable to refuse the activity. Please try again later.</p>
                </body>
            </html>
        `;
    }
}

module.exports = { generateActivityInvitationHTML, manageActivityParticipants, acceptActivityInvitation, refuseActivityInvitation };
