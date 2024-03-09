import { CalendarResponse } from 'node-ical';
// @ts-ignore
import icaljs from 'node-ical/ical.js';

// @ts-ignore
window.setImmediate = window.requestAnimationFrame;

export default function parseICS(data: string): Promise<CalendarResponse> {
    return new Promise(function (resolve, reject) {
        (icaljs.parseICS as Function).call(icaljs, data, (error: any, ics: CalendarResponse) => {
            if (error) reject(error); else resolve(ics);
        });
    });
}