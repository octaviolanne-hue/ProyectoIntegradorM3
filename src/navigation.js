import { router } from "./router.js";

export function navigateTo (path) {
console.log("Navegando a:", path);
    history.pushState(null,"",path);
    console.log("URL después de pushState:", window.location.href);
    console.log("Search:", window.location.search);
    router();
}
export function setupLinkInterception() {
    document.addEventListener("click", (event) => {
        const link = event.target.closest("a");

        if (!link) return;

        const href = link.getAttribute("href");

        if (!href) return;
        if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) return;

        if (link.target === "_blank") return;

        if (link.origin !== window.location.origin) return;

        if (
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
        ) return;

        event.preventDefault();

        navigateTo(href);
    });
}