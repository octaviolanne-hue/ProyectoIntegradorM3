import { router } from "./router.js";
import { setupLinkInterception } from "./navigation.js";

setupLinkInterception();
window.addEventListener("popstate",router);

router ();