import Zpgsa from "./zpgsa";
// @ts-ignore
import {registerSW} from "virtual:pwa-register"
import {inject} from "@vercel/analytics";
import {showSummary, showTicket} from "./ticket";
import "./index.css";

registerSW();
inject();

const path = window.location.pathname.replace(/\/+$/, "") || "/";
console.log(path);
if (path === "/ticket") {
    const searchParams = new URL(window.location.href).searchParams;

    const stateStr = searchParams.get("state")
    console.log(stateStr);
    if (!stateStr) {
        document.querySelector("#ticketBtn")?.addEventListener("click", showTicket);
        await Zpgsa.new("map");
    } else {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            meta.remove();
        }
        showSummary(stateStr);
    }
} else {
    document.querySelector("#ticketBtn")?.addEventListener("click", () => {
        (document.querySelector("#map") as HTMLDivElement).style.visibility = "hidden";
        showTicket();
    });
    await Zpgsa.new("map");
}
