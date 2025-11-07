import Zpgsa from "./zpgsa";
// @ts-ignore
import {registerSW} from "virtual:pwa-register"

const updateSW = registerSW({
   immediate: true,
   onNeedRefresh() {
      console.log("Nowa wersja dostępna. Odświeżam.");
      updateSW();
      window.location.reload();
   },
   onOfflineReady() {
      console.log("Aplikacja gotowa offline");
   }
})

await Zpgsa.new("map");
