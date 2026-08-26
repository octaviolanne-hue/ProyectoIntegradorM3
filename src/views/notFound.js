export function renderNotFound() {

    const app = document.querySelector("#app");

    app.innerHTML = `
        <h2>404</h2>
        <p>Página no encontrada.</p>
    `;

}