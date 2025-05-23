import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


export function prepareCalendarEvents(Events, Activities, user, wideDescriptions) {
	const calendarEvents = [];
	for (let i = 0; i < Events.length; i++) {
		const event_ = Events[i];
		const item = {};
		item.id = event_._id;
		item.allDay = event_.all_day;
		if (event_.timezone) {
			const startUtc = dayjs(event_.date_start).utc();
			item.start = startUtc.tz(event_.timezone).toDate();
			const endUtc = dayjs(event_.date_end).utc();
			item.end = endUtc.tz(event_.timezone).toDate();
		} else {
			item.start = dayjs(event_.date_start).toDate();
			item.end = dayjs(event_.date_end).toDate();
		}
		if (event_.all_day) {
			item.end = dayjs(item.end).add(1, 'day').toDate();   //Estendo la data end nel caso di evento all-day per includerlo nella visualizzazione del calendario
		}
		item.title = (wideDescriptions ? (event_.ev_type === 'notAvailable' ? 'Not available: ' : (event_.owner === user ? '' : 'Shared: ')) : '') + event_.title;
		item.class = (event_.ev_type === 'notAvailable' ? 'notAvailable' : 'event');
		item.backgroundColor = (event_.ev_type === 'notAvailable' ? 'gray' : (event_.pomodoro ? 'red' : (event_.owner === user ? 'blue' : 'violet')));
		item.pomodoro = event_.pomodoro;
		item.pomodoroId = event_.pomodoroId;
		if (event_.is_recurring) {
			item.rrule = `DTSTART=${formatToICalendarDate(item.start)}\n` + event_.recurring_rule;
			if (item.end > item.start) {
				const durationInMinutes = dayjs(event_.date_end).diff(dayjs(event_.date_start), 'minute');
				item.duration = `${Math.floor(durationInMinutes / 60).toString().padStart(2, '0')}:${(durationInMinutes % 60).toString().padStart(2, '0')}`;
			}
		}
		item.editable = !event_.is_recurring;  //Editabile solo se non ricorrente
		calendarEvents.push(item);
	}

	//Aggiunge le attività, se hanno una data "entro il"
	for (let i = 0; i < Activities.length; i++) {
		const activity = Activities[i];
		if (activity.has_deadline) {
			const item = {
				id: activity._id,
				title: activity.title,
				start: dayjs(activity.end).toDate(),
				end: dayjs(activity.end).toDate(),
				allDay: true,
				class: 'activity',
				backgroundColor: (activity.owner === user ? 'green' : 'orange')
			}
			calendarEvents.push(item);
		}
	}
	return calendarEvents;
}

//Funzione che trasforma una data in una stringa in formato iCalendar
export const formatToICalendarDate = (date) => dayjs(date).format('YYYYMMDDTHHmmss');

export function getAddEventPath() {
	return "/editEvent/-1/Hp/" + dayjs().format('DDMMYYYY');
}
