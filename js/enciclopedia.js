/* ========================================
   MINISTÉRIO ATALAIA
   Enciclopédia — História do Cristianismo
   Arquivo: js/enciclopedia.js
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    const campoBusca =
        document.querySelector("#busca") ||
        document.querySelector("#pesquisa") ||
        document.querySelector("#buscarVerbete") ||
        document.querySelector('[type="search"]');

    const filtroCategoria =
        document.querySelector("#categoria") ||
        document.querySelector("#filtroCategoria") ||
        document.querySelector("#filtro-categoria");

    const cartoes = Array.from(
        document.querySelectorAll(
            ".card, .verbete, .card-verbete"
        )
    );

    if (cartoes.length === 0) {
        console.warn(
            "Enciclopédia Atalaia: nenhum cartão de verbete encontrado."
        );
        return;
    }

    /*
     * Identifica a categoria de cada cartão.
     * Pode ser definida por:
     * data-categoria="personagens"
     * ou por uma classe CSS correspondente.
     */
    function obterCategoria(cartao) {
        const categoria =
            cartao.dataset.categoria ||
            cartao.dataset.category ||
            "";

        if (categoria) {
            return normalizar(categoria);
        }

        const classes = Array.from(cartao.classList);

        const categoriasConhecidas = [
            "personagens",
            "acontecimentos",
            "concilios",
            "doutrinas",
            "movimentos",
            "instituicoes"
        ];

        return categoriasConhecidas.find(categoria =>
            classes.includes(categoria)
        ) || "";
    }

    /*
     * Normaliza o texto para facilitar a busca:
     * ignora maiúsculas, minúsculas e acentos.
     */
    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    /*
     * Cria a mensagem de ausência de resultados.
     */
    let mensagemVazia = document.querySelector(
        "#mensagemVazia, .mensagem-vazia, .sem-resultados"
    );

    if (!mensagemVazia) {
        mensagemVazia = document.createElement("p");
        mensagemVazia.id = "mensagemVazia";
        mensagemVazia.className = "mensagem-vazia";
        mensagemVazia.textContent =
            "Nenhum verbete encontrado.";
        mensagemVazia.hidden = true;

        const grade = cartoes[0].parentElement;

        if (grade) {
            grade.appendChild(mensagemVazia);
        }
    }

    /*
     * Pesquisa e filtra os cartões.
     */
    function filtrarVerbetes() {
        const termo = normalizar(campoBusca?.value || "");
        const categoriaSelecionada = normalizar(
            filtroCategoria?.value || ""
        );

        let quantidadeVisivel = 0;

        cartoes.forEach(cartao => {
            const textoCartao = normalizar(
                cartao.textContent
            );

            const categoriaCartao =
                obterCategoria(cartao);

            const correspondeBusca =
                termo === "" ||
                textoCartao.includes(termo);

            const correspondeCategoria =
                categoriaSelecionada === "" ||
                categoriaSelecionada === "todas" ||
                categoriaCartao === categoriaSelecionada;

            const mostrar =
                correspondeBusca && correspondeCategoria;

            cartao.hidden = !mostrar;

            if (mostrar) {
                quantidadeVisivel++;
            }
        });

        mensagemVazia.hidden = quantidadeVisivel > 0;
    }

    /*
     * Eventos dos controles de pesquisa.
     */
    if (campoBusca) {
        campoBusca.addEventListener(
            "input",
            filtrarVerbetes
        );
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener(
            "change",
            filtrarVerbetes
        );
    }

    /*
     * Botão opcional para limpar a pesquisa.
     */
    const botaoLimpar = document.querySelector(
        "#limparBusca, #limparPesquisa"
    );

    if (botaoLimpar) {
        botaoLimpar.addEventListener("click", () => {
            if (campoBusca) {
                campoBusca.value = "";
            }

            if (filtroCategoria) {
                filtroCategoria.value = "";
            }

            filtrarVerbetes();
            campoBusca?.focus();
        });
    }

    /*
     * Inicializa a exibição.
     */
    filtrarVerbetes();
});
