import Zpgsa from "./zpgsa";
// @ts-ignore
import {registerSW} from "virtual:pwa-register"
import {inject} from "@vercel/analytics";
import {showSummary, showTicket} from "./ticket";
import "./index.css";

inject();

const path = window.location.pathname.replace(/\/+$/, "") || "/";
if (path === "/ticket") {
   const searchParams = new URL(window.location.href).searchParams;

   const stateStr = searchParams.get("state")
   if (!stateStr) {
      document.querySelector("#ticketBtn")?.addEventListener("click", showTicket);
      await Zpgsa.new("map");
   } else {
      showSummary(stateStr);
   }
} else {
   document.querySelector("#ticketBtn")?.addEventListener("click", showTicket);
   await Zpgsa.new("map");
}
