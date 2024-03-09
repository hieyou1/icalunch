// Import our custom CSS
import '../scss/index.scss';
import makeIcs from './lib/calparse';

let cardBody = document.getElementById("card-body") as HTMLDivElement;
let ptgmsics = document.getElementById("ptgmsics") as HTMLInputElement;
let childname = document.getElementById("childname") as HTMLInputElement;
let startDate = document.getElementById("startdate") as HTMLInputElement;
let endDate = document.getElementById("enddate") as HTMLInputElement;

ptgmsics.onchange = async (e) => {
    ptgmsics.disabled = true;
    childname.disabled = true;
    let ics = await ptgmsics.files[0].text();
    let name = childname.value;
    let start = new Date(startDate.valueAsNumber);
    let end = new Date(endDate.valueAsNumber);
    cardBody.innerText = "Loading...";
    let fullCal = await makeIcs(ics, name, start, end);

    let dlStandard = document.createElement("button");
    dlStandard.onclick = () => {
        let a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([fullCal.standard]));
        a.download = "standard.ics";
        a.click();
    };
    dlStandard.classList.add("btn", "btn-primary");
    dlStandard.innerText = "Download (standard)";

    let dlAnti = document.createElement("button");
    dlAnti.onclick = () => {
        let a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([fullCal.anti]));
        a.download = "anti.ics";
        a.click();
    };
    dlAnti.classList.add("btn", "btn-danger");
    dlAnti.innerText = "Download (anti)";

    cardBody.innerText = "";
    cardBody.appendChild(dlStandard);
    cardBody.appendChild(document.createElement("br"));
    cardBody.appendChild(dlAnti);
};

window.onload = () => ptgmsics.disabled = false;