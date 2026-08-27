import { getCharacterReply } from "../services/aiClient.js";
import { debounce, wait } from "../services/debounce.js";
import { getUserMessage } from "../ui/messages.js";

const CHARACTERS = {
    jack: {
        name: "Jack Sparrow",
        image: "../assets/jack-sparrow.jpg",
        greeting: "¿Qué querés saber, amigo?",
    },

    tony: {
        name: "Tony Stark",
        image: "../assets/tony-stark.jpg",
        greeting: "Bueno, ¿qué querés saber?",
    },

    deadpool: {
        name: "Deadpool",
        image: "../assets/deadpool.jpg",
        greeting: "¿En serio? Bueno, preguntá.",
    },
};

const state = {
    character: null,

    messages: [],

    status: "idle",

    error: null,

    lastUserMessage: null,

    retryCountdown: null,
};

export function renderChat() {

    // Obtener el personaje desde la URL
    const params = new URLSearchParams(
        window.location.search
    );

    const requestedCharacter = params.get("character");

    // Si no hay personaje o no existe, usamos Jack
    const character =
        CHARACTERS[requestedCharacter]
            ? requestedCharacter
            : "jack";

    const characterData = CHARACTERS[character];

    // Detectar si cambió el personaje
    const characterChanged =
        state.character !== character;

    // Guardar personaje actual
    state.character = character;

    // Si es la primera vez o cambió el personaje,
    // reiniciamos la conversación
    if (
        state.messages.length === 0 ||
        characterChanged
    ) {

        state.messages = [
            {
                role: "character",
                text: characterData.greeting,
            },
        ];

        state.status = "idle";
        state.error = null;
        state.lastUserMessage = null;
        state.retryCountdown = null;
    }

    const app = document.querySelector("#app");

    app.innerHTML = `

        <div class="chatApp">

            <header class="chatHeader">

                <div class="chatHeader__avatar">

                    <img
                        src="${characterData.image}"
                        alt="${characterData.name}"
                    >

                </div>

                <div class="chatHeader__info">

                    <h1 class="chatHeader__name">
                        ${characterData.name}
                    </h1>

                    <span class="chatHeader__status">
                        En línea
                    </span>

                </div>

            </header>

            <main
                class="chatMessages"
                id="chatMessages"
                aria-live="polite"
            >

                ${renderMessages()}

                ${renderStatus()}

            </main>

            <form
                class="chatComposer"
                id="chatComposer"
            >

                <input
                    class="chatComposer__input"
                    id="chatInput"
                    type="text"
                    placeholder="Escribí un mensaje..."
                    aria-label="Escribe un mensaje"
                    ${state.status === "loading" ? "disabled" : ""}
                />

                <button
                    class="chatComposer__send"
                    type="submit"
                    ${state.status === "loading" ? "disabled" : ""}
                >
                    ➤
                </button>

            </form>

        </div>

    `;

    setupChat();

    scrollToBottom();
}

function renderMessages() {

    return state.messages
        .map(
            (msg) => `

                <div class="message message--${msg.role}">
                    ${escapeHtml(msg.text)}
                </div>

            `
        )
        .join("");
}

function renderStatus() {

    if (
        state.status === "loading" &&
        state.retryCountdown != null
    ) {

        return `

            <div class="message message--character message--typing">

                Esperando para reintentar
                (${state.retryCountdown} segundos)...

            </div>

        `;
    }

    if (state.status === "loading") {

        const characterData =
            CHARACTERS[state.character];

        return `

            <div class="message message--character message--typing">

                ${characterData.name} está escribiendo...

            </div>

        `;
    }

    if (state.status === "error") {

        return `

            <div class="message message--error">

                ${escapeHtml(state.error)}

                <button
                    class="message__retry"
                    id="retryBtn"
                    type="button"
                >
                    Reintentar
                </button>

            </div>

        `;
    }

    return "";
}

function escapeHtml(str) {

    const div = document.createElement("div");

    div.textContent = str;

    return div.innerHTML;
}

function setState(updates) {

    Object.assign(state, updates);

    renderChat();
}

function setupChat() {

    const $form =
        document.querySelector("#chatComposer");

    const $input =
        document.querySelector("#chatInput");

    const $retry =
        document.querySelector("#retryBtn");

    const debouncedSend = debounce(
        async () => {

            if (state.status === "loading") return;

            const text = $input.value.trim();

            if (!text) return;

            await sendMessage(text);

            $input.value = "";

        },
        200
    );

    $form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            debouncedSend();

        }
    );

    $retry?.addEventListener(
        "click",
        () => {

            if (state.lastUserMessage) {

                sendMessage(
                    state.lastUserMessage,
                    true
                );

            }

        }
    );

    $input.focus();
}

async function sendMessage(
    text,
    isRetry = false
) {

    const nextMessages = isRetry
        ? state.messages
        : [
            ...state.messages,
            {
                role: "user",
                text,
            },
        ];

    setState({

        messages: nextMessages,

        status: "loading",

        error: null,

        lastUserMessage: isRetry
            ? state.lastUserMessage
            : text,

        retryCountdown: null,

    });

    try {

        const reply = await getCharacterReply(
            nextMessages,
            state.character
        );

        setState({

            messages: [
                ...nextMessages,
                {
                    role: "character",
                    text: reply,
                },
            ],

            status: "idle",

            error: null,

            lastUserMessage: null,

            retryCountdown: null,

        });

    } catch (err) {

        if (err.status === 429) {

            const seconds =
                err.retryAfterSeconds ?? 5;

            for (
                let s = seconds;
                s > 0;
                s--
            ) {

                setState({
                    status: "loading",
                    retryCountdown: s,
                });

                await wait(1000);
            }

            try {

                setState({
                    status: "loading",
                    retryCountdown: null,
                });

                const reply =
                    await getCharacterReply(
                        nextMessages,
                        state.character
                    );

                setState({

                    messages: [
                        ...nextMessages,
                        {
                            role: "character",
                            text: reply,
                        },
                    ],

                    status: "idle",

                    error: null,

                    lastUserMessage: null,

                    retryCountdown: null,

                });

                return;

            } catch (errRetry) {

                setState({

                    status: "error",

                    error: getUserMessage(
                        errRetry
                    ),

                });

                return;
            }
        }

        setState({

            status: "error",

            error: getUserMessage(err),

        });
    }
}

function scrollToBottom() {

    const $messages =
        document.querySelector("#chatMessages");

    if ($messages) {

        $messages.scrollTop =
            $messages.scrollHeight;

    }
}