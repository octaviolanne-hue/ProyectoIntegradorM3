export function renderHome() {

    const app = document.querySelector("#app");

    app.innerHTML = `
        <section class="home">
            <div class="home__intro">
                <p class="home__eyebrow">
                    CHARACTER CHAT
                </p>
                <h2>
                    Hablá con tus personajes favoritos
                </h2>
                <p class="home__description">
                    Elegí un personaje, iniciá una conversación
                    y descubrí cómo sería hablar con él.
                </p>
            </div>
            <section class="characters">
                <h3 class="characters__title">
                    Elegí tu personaje
                </h3>
                <div class="characters__grid">
                    <!-- Jack Sparrow -->
                    <article class="character-card">
                        <div class="character-card__image">
                            <img 
                                src="./assets/jack-sparrow.jpg"
                                alt="Jack Sparrow"
                            >
                        </div>
                        <div class="character-card__content">
                            <h4>
                                Jack Sparrow
                            </h4>
                            <p>
                                Capitán pirata, experto en escapar
                                de problemas y dueño de un humor
                                bastante peculiar.
                            </p>
                            <a 
                                href="/chat"
                                class="character-card__button"
                            >
                                💬 Chatear
                            </a>
                        </div>
                    </article>
                    <!-- Tony Stark -->
                    <article class="character-card">
                        <div class="character-card__image">
                            <img 
                                src="./assets/tony-stark.jpg"
                                alt="Tony Stark"
                            >
                        </div>
                        <div class="character-card__content">
                            <h4>
                                Tony Stark
                            </h4>
                            <p>
                                Genio, inventor y experto en
                                sarcasmo. Probablemente tenga
                                una solución para todo.
                            </p>
                            <a 
                                href="/chat"
                                class="character-card__button"
                            >
                                💬 Chatear
                            </a>
                        </div>
                    </article>
                    <!-- Deadpool -->
                    <article class="character-card">
                        <div class="character-card__image">
                            <img 
                                src="./assets/deadpool.jpg"
                                alt="Deadpool"
                            >
                        </div>
                        <div class="character-card__content">
                            <h4>
                                Deadpool
                            </h4>
                            <p>
                                Mercenario, bromista y experto
                                en romper las reglas... incluso
                                las de la conversación.
                            </p>
                            <a 
                                href="/chat"
                                class="character-card__button"
                            >
                                💬 Chatear
                            </a>
                        </div>
                    </article>
                </div>
            </section>
        </section>
    `;
}