export function renderAbout() {

    const app = document.querySelector("#app");

    app.innerHTML = `
        <section class="about">
            <h2>Sobre el proyecto</h2>
            <p>
                Character Chat es una aplicación web que permite
                conversar con diferentes personajes mediante
                inteligencia artificial.
            </p>
            <h3>Personajes</h3>
            <ul class="about__characters">
                <li>
                    <strong>Jack Sparrow</strong>
                    <span> — Aventurero, divertido e impredecible.</span>
                </li>
                <li>
                    <strong>Tony Stark</strong>
                    <span> — Inteligente, sarcástico y tecnológico.</span>
                </li>
                <li>
                    <strong>Deadpool</strong>
                    <span> — Irreverente, divertido y sarcástico.</span>
                </li>
            </ul>
            <h3>¿Cómo funciona?</h3>
            <p>
                Elegí un personaje desde la página principal,
                ingresá al chat y comenzá la conversación.
            </p>
        </section>
    `;
}