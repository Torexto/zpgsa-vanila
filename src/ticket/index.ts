import "./index.css";
import QRCode from "qrcode";
import {DateTime} from "luxon";

type TicketState = {
   startIso: string;
   durationMin: number;
   nr: number;
   code: number;
}

function getRandomInt(min: number, max: number) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function showTicket() {
   const el = document.createElement('div');
   el.className = 'ticket';
   el.style.fontFamily = "sans-serif;";
   document.body.appendChild(el);

   const start = DateTime.now().minus({minutes: Math.random() * 5});
   const durationMin = 30;
   const expiresAt = start.plus({minutes: durationMin});

   const nr = getRandomInt(1000, 9999);
   const code = getRandomInt(100, 999);

   const state: TicketState = {
      startIso: start.toISO(),
      durationMin,
      nr,
      code
   };

   const stateStr = btoa(JSON.stringify(state));

   el.innerHTML = `
   <div class="ticket-header">
     <button class="ticket-close-btn">X</button>
     <h1>Szczegóły biletu</h1>
   </div>
   <div class="ticket-body">
     <div class="ticket-body-gif"><hr></div>
     
     <div class="ticket-body-qrcode">
         <canvas></canvas>
     </div>
     
     <div class="ticket-body-elapsed"></div>
     
     <div class="ticket-body-title">Nazwa:</div>
     <div class="ticket-body-content">Bielawa ZPG (ZKM)</div>
     
     <div class="ticket-body-title">Bilet:</div>
     <div class="ticket-body-content">30 min U</div>
     
     <div class="ticket-body-title">Ważny do:</div>
     <div class="ticket-body-content">${expiresAt.toFormat("dd.MM.yyyy'r.' HH:mm:ss")}</div>
     
     <div class="ticket-body-title">Nr bieżący:</div>
     <div class="ticket-body-content">57938${nr}</div>
     
     <div class="ticket-body-title">Numer kontrolny:</div>
     <div class="ticket-body-content">32${code}</div>
     
     <div class="ticket-body-gif"><hr></div>
     
     <div class="ticket-body-title">Cena:</div>
     <div class="ticket-body-content">2,40 zł</div>
     
     <div class="ticket-body-title">Czas transakcji:</div>
     <div class="ticket-body-content">${start.toFormat("dd.MM.yyyy'r.' HH:mm:ss")} </div>
     
     <div class="ticket-body-title">Czas ważności:</div>
     <div class="ticket-body-content ticket-body-remaining"></div>
   </div>
`;

   const qrcodeCanvas = el.querySelector("div.ticket-body-qrcode > canvas")! as HTMLCanvasElement;
   const elapsedEl = el.querySelector(".ticket-body-elapsed")! as HTMLDivElement;
   const remainingEl = el.querySelector(".ticket-body-remaining")! as HTMLDivElement;

   const baseUrl = window.location.origin;
   const url = `${baseUrl}/ticket?state=${stateStr}`;
   console.log(url);
   QRCode.toCanvas(qrcodeCanvas, url, {
      width: 256,
      errorCorrectionLevel: 'H'
   });
   el.querySelector(".ticket-close-btn")?.addEventListener("click", () => el.remove());

   function update() {
      const now = DateTime.now();
      elapsedEl.textContent = now.diff(start).toFormat("mm:ss");
      remainingEl.textContent = expiresAt.diff(now).toFormat("mm:ss");

      const remaining = expiresAt.diff(now);
      if (remaining.seconds < 0) {
         el.remove();
      }
   }

   update();
   setInterval(update, 1000);
}

export function showSummary(stateStr?: string) {
   const state: TicketState = JSON.parse(atob(stateStr ?? ""));

   const start = DateTime.fromISO(state.startIso);

   const el = document.createElement('div');
   el.className = 'ticket';
   el.style.fontSize = "3em";
   el.style.padding = "8px";
   el.innerHTML = `
   Bielawa ZPG (ZKM)
   <br>
   30 min U
   <br>
   Cena: <b>
   2,40 PLN</b>
   <br>
   Data zakupu: ${start.toFormat("dd.MM.yyyy'r.' HH:mm:ss")}<br>
   Data ważności: <b style="color:red;">${start.plus({minutes: state.durationMin}).toFormat("dd.MM.yyyy'r.' HH:mm:ss")}</b>
   <br>
   Kod: 32${state.code}
   <br>
   Numer bieżący: 57938${state.nr}
   <br>
   `;
   document.body.appendChild(el);
}