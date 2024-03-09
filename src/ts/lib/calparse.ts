import { createEvents, EventAttributes } from 'ics';
import parseICS from './nodeical-patch';

const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};
const hasAny = (straw: string, ...finds: string[]) => {
    let str = straw.toLowerCase();
    let hasit = false;
    for (let i of finds) {
        if (str.includes(i)) {
            hasit = true;
            break;
        }
    }
    return hasit;
};

const createStandard = async (ptgms: string, name: string, start: Date): Promise<string> => {
    let ic = await parseICS(ptgms);
    let compiler: EventAttributes[] = [];
    for (let i of Object.values(ic)) {
        if (i.type == "VEVENT" && start.getTime() <= i.start.getTime()) {
            compiler.push({
                "title": `${name} has lunch`,
                "start": [i.start.getFullYear(), i.start.getMonth() + 1, i.start.getUTCDate()],
                "duration": { days: 1 },
                "description": (new DOMParser().parseFromString(`<html><head></head><body><div id="desc">${i.description}</div></body></html>`, "text/html")).getElementById("desc").textContent
            });
        }
    }

    return await new Promise((resolve, reject) => {
        createEvents(compiler, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
};

const createAnti = async (standard: string, ptgms: string, name: string, start: Date, end: Date): Promise<string> => {
    let ogCal = await parseICS(standard);
    let ogMap = new Map();

    for (let i of Object.values(ogCal)) {
        if (i.type != "VEVENT") continue;
        let datearr = [i.start.getFullYear(), i.start.getMonth() + 1, i.start.getDate()];
        let datestr = `${datearr[0]}.${datearr[1]}.${datearr[2]}`;
        console.log(datestr);
        let {
            description
        } = i;
        if (!ogMap.has(datestr)) {
            ogMap.set(datestr, []);
        }
        let arr = ogMap.get(datestr);
        arr.push({
            "title": i.summary,
            description
        });
        ogMap.set(datestr, arr);
    }
    let evts: EventAttributes[] = [];
    let year = end.getFullYear();

    for (let mo = start.getMonth(); mo <= end.getMonth(); ++mo) {
        for (let day = ((mo == start.getMonth()) ? start.getDate() : 1); day <= ((mo == end.getMonth()) ? end.getDate() : daysInMonth(end.getFullYear(), mo)); ++day) {
            if (new Date(year, mo, day).getDay() == 0 || new Date(year, mo, day).getDay() == 6) {
                console.log("weekend for", `${year}.${mo + 1}.${day}`);
            } else if (!ogMap.has(`${year}.${mo + 1}.${day}`)) {
                console.log("no ogmap for", `${year}.${mo + 1}.${day}`);
                evts.push({
                    start: [year, mo + 1, day],
                    duration: { days: 1 },
                    title: `${name} needs a lunch`
                });
            } else {
                let hasDessert = false;
                let hasEntree = false;
                for (let i of ogMap.get(`${year}.${mo + 1}.${day}`)) {
                    if (hasAny(((true) ? i.description : i.description.split(", ")[0]), "donut", "blizzard", "frozen yogurt")) {
                        hasDessert = true;
                    } else {
                        hasEntree = true;
                    }
                }
                if (hasDessert && !hasEntree) {
                    evts.push({
                        start: [year, mo + 1, day],
                        duration: { days: 1 },
                        title: `${name} needs a lunch without dessert`
                    });
                }
            }
        }
    }

    let mo = end.getMonth();
    let day = end.getDate();
    evts.push({
        start: [year, mo + 1, day],
        duration: { days: 1 },
        title: `Reorder/reimport lunch for ${name}`
    });

    return await new Promise((resolve, reject) => {
        createEvents(evts, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

export interface FullCal {
    "standard": string;
    "anti": string;
}

export default async function makeIcs(ptgms: string, name: string, start: Date, end: Date): Promise<FullCal> {
    let standard = await createStandard(ptgms, name, start);
    let anti = await createAnti(standard, ptgms, name, start, end);

    return { standard, anti };
}
