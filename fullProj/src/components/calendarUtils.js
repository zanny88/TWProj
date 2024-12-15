import dayjs from 'dayjs';

export function prepareCalendarEvents(Events, Activities){
	//alert("prepareCalendarEvents");
	const calendarEvents = [];
	//alert("Events.length="+Events.length);
	for (let i = 0; i < Events.length; i++){
		const event_ = Events[i];
		const item = {};
		item.id = event_._id;
		item.allDay = event_.all_day;
		item.start = dayjs(event_.date_start).toDate();
		item.end = dayjs(event_.date_end).toDate();
		item.title = event_.title;
		item.class = (event_.ev_type === 'notAvailable' ? 'notAvailable' : 'event');
		item.backgroundColor = (event_.ev_type === 'notAvailable' ? 'gray' : 'blue');
		if (event_.is_recurring){
			item.rrule = `DTSTART=${formatToICalendarDate(item.start)}\n` + event_.recurring_rule;
			if (item.end > item.start){
				const durationInMinutes = dayjs(event_.date_end).diff(dayjs(event_.date_start), 'minute');
				//alert(item.title+", durationInMinutes="+durationInMinutes);
				item.duration = `${Math.floor(durationInMinutes / 60).toString().padStart(2, '0')}:${(durationInMinutes % 60).toString().padStart(2, '0')}`;
				//console.log("item.duration="+item.duration);
			}
			//alert("ITEM="+JSON.stringify(item));
			//item.all_day = event_.all_day;
		}
		//console.log("item="+JSON.stringify(item));
		calendarEvents.push(item);
		//alert(item.title + ", " + JSON.stringify(item));
	}
	
	//Aggiunge le attività, se hanno una data "entro il"
	//alert("DateActivities.value.length="+DateActivities.value.length);
	for (let i = 0; i < Activities.length; i++){
		const activity = Activities[i];
		if (activity.has_deadline){
			const item = {
				id: activity._id,
				title: activity.title,
				start: dayjs(activity.end).toDate(),
				end: dayjs(activity.end).toDate(),
				allDay: true,
				class: 'activity',
				backgroundColor: 'green'
			}
			calendarEvents.push(item);
			//alert("Activity: " + item.title + ", " + JSON.stringify(item));
		}
	}
	return calendarEvents;
}

//Funzione che trasforma una data in una stringa in formato iCalendar
export const formatToICalendarDate = (date) => dayjs(date).format('YYYYMMDDTHHmmss');
