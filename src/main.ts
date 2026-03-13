import Zpgsa from "./zpgsa";
import {inject} from "@vercel/analytics";
import {showSummary, renderTicket} from "./ticket";
import "./index.css";

inject();

const path = window.location.pathname.replace(/\/+$/, "") || "/";
console.log(path);

switch (path) {
    case "/ticketSummary":
        await renderTicketSummary();
        break;
    case "/ticket":
        renderTicket();
        break;
    default:
        await renderMap();
}

export function redirectTo(path: string) {
    window.location.href = path;
}

async function renderMap() {
    const mapContainer = document.createElement("div");
    mapContainer.id = "map";

    const ticketBtn = document.createElement("button");
    ticketBtn.id = "ticketBtn";

    ticketBtn.addEventListener("click", () => {
        mapContainer.style.visibility = "hidden";
        redirectTo("/ticket")
    });

    document.body.appendChild(mapContainer);
    document.body.appendChild(ticketBtn);

    await Zpgsa.new("map");
}

async function renderTicketSummary() {
    const searchParams = new URL(window.location.href).searchParams;

    const stateStr = searchParams.get("state");

    if (!stateStr) {
        redirectTo("/")
    } else {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            meta.remove();
        }
        showSummary(stateStr);
    }
}