/* ============================================
   MINISTÉRIO ATALAIA
   CURSO DE HISTÓRIA DO CRISTIANISMO
   Arquivo: js/script.js
============================================ */

"use strict";

/* ============================================
   CONFIGURAÇÕES
============================================ */

const CONFIG = {
    armazenamento: "atalaia_historia_cristianismo_v1",
    paginaEnciclopedia: "enciclopedia.html"
};

/* ============================================
   ELEMENTOS
============================================ */

const modulos = Array.from(document.querySelectorAll(".modulo"));
const aulas = Array.from(document.querySelectorAll(".aula"));
const botoesEnciclopedia = document.querySelectorAll(
    "[data-enciclopedia]"
);

/* ============================================
   ESTADO DO CURSO
============================================ */

let progresso = carregarProgresso();

/* ============================================
   CARREGAR PROGRESSO SALVO
============================================ */

function carregarProgresso() {
    try {
        const dados = localStorage.getItem(CONFIG.armazenamento);

        if (!dados) {
            return {
                aulasConcluidas: [],
                ultimaAula: null
            };
        }

        const estado = JSON.parse(dados);

        return {
            aulasConcluidas: Array.isArray(estado.aulasConcluidas)
                ? estado.aulasConcluidas
                : [],
            ultimaAula: estado.ultimaAula || null
        };
    } catch (erro) {
        console.warn("Não foi possível carregar o progresso.", erro);

        return {
            aulasConcluidas: [],
            ultimaAula: null
        };
    }
}

/* ============================================
   SALVAR PROGRESSO
============================================ */

function salvarProgresso() {
    try {
        localStorage.setItem(
            CONFIG.armazenamento,
            JSON.stringify(progresso)
        );
    } catch (erro) {
        console.warn("Não foi possível salvar o progresso.", erro);
    }
}

/* ============================================
   IDENTIFICAR AULAS
============================================ */

function identificarAulas() {
    aulas.forEach((aula, indice) => {
        if (!aula.dataset.aulaId) {
            aula.dataset.aulaId = `aula-${indice + 1}`;
        }
    });
}

/* ============================================
   MARCAR AULA COMO CONCLUÍDA
============================================ */

function alternarConclusao(idAula) {
    const indice = progresso.aulasConcluidas.indexOf(idAula);

    if (indice >= 0) {
        progresso.aulasConcluidas.splice(indice, 1);
    } else {
        progresso.aulasConcluidas.push(idAula);
    }

    salvarProgresso();
    atualizarProgresso();
}

/* ============================================
   ATUALIZAR PROGRESSO VISUAL
============================================ */

function atualizarProgresso() {
    const totalAulas = aulas.length;
    const concluidas = progresso.aulasConcluidas.filter(id =>
        aulas.some(aula => aula.dataset.aulaId === id)
    ).length;

    const percentual = totalAulas > 0
        ? Math.round((concluidas / totalAulas) * 100)
        : 0;

    const barra = document.getElementById("barra-progresso");
    const texto = document.getElementById("texto-progresso");
    const resumo = document.getElementById("resumo-progresso");

    if (barra) {
        barra.style.width = `${percentual}%`;
        barra.setAttribute("role", "progressbar");
        barra.setAttribute("aria-valuemin", "0");
        barra.setAttribute("aria-valuemax", "100");
        barra.setAttribute("aria-valuenow", String(percentual));
        barra.setAttribute(
            "aria-label",
            "Progresso do curso"
        );
    }

    if (texto) {
        texto.textContent = `${percentual}% concluído`;
    }

    if (resumo) {
        resumo.textContent =
            `${concluidas} de ${totalAulas} aulas concluídas`;
    }

    aulas.forEach(aula => {
        const id = aula.dataset.aulaId;
        const concluida = progresso.aulasConcluidas.includes(id);
        const botao = aula.querySelector(".botao-conclusao");
        const indicador = aula.querySelector(".status-aula");

        aula.classList.toggle("aula-concluida", concluida);

        if (indicador) {
            indicador.textContent = concluida
                ? "✓ Aula concluída"
                : "Aula pendente";
        }

        if (botao) {
            botao.textContent = concluida
                ? "Desmarcar conclusão"
                : "Marcar como concluída";

            botao.setAttribute(
                "aria-pressed",
                String(concluida)
            );
        }
    });

    atualizarProgressoModulos();
}

/* ============================================
   PROGRESSO POR MÓDULO
============================================ */

function atualizarProgressoModulos() {
    modulos.forEach(modulo => {
        const aulasDoModulo = modulo.querySelectorAll(".aula");

        const concluidas = Array.from(aulasDoModulo).filter(aula =>
            progresso.aulasConcluidas.includes(aula.dataset.aulaId)
        ).length;

        let resumo = modulo.querySelector(".resumo-modulo");

        if (!resumo) {
            resumo = document.createElement("p");
            resumo.className = "resumo-modulo";

            const titulo = modulo.querySelector("summary");

            if (titulo) {
                titulo.appendChild(resumo);
            }
        }

        resumo.textContent = aulasDoModulo.length
            ? `${concluidas}/${aulasDoModulo.length} aulas concluídas`
            : "Nenhuma aula cadastrada neste módulo.";
    });
}

/* ============================================
   ADICIONAR BOTÕES DE CONCLUSÃO
============================================ */

function prepararBotoesConclusao() {
    aulas.forEach(aula => {
        if (aula.querySelector(".botao-conclusao")) {
            return;
        }

        const id = aula.dataset.aulaId;

        const status = document.createElement("p");
        status.className = "status-aula";

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "botao botao-conclusao";

        botao.addEventListener("click", () => {
            alternarConclusao(id);
        });

        aula.append(status, botao);
    });
}

/* ============================================
   BUSCA DE AULAS
============================================ */

function prepararBusca() {
    const campo = document.getElementById("buscar-aula");

    if (!campo) {
        return;
    }

    campo.addEventListener("input", () => {
        const termo = normalizarTexto(campo.value);

        aulas.forEach(aula => {
            const corresponde = normalizarTexto(
                aula.textContent
            ).includes(termo);

            aula.hidden = !corresponde;
        });

        modulos.forEach(modulo => {
            const temResultado = Array.from(
                modulo.querySelectorAll(".aula")
            ).some(aula => !aula.hidden);

            modulo.hidden = !temResultado && termo !== "";

            if (termo && temResultado) {
                modulo.open = true;
            }
        });
    });
}

/* ============================================
   NORMALIZAR TEXTO
============================================ */

function normalizarTexto(texto) {
    return texto
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/* ============================================
   BOTÃO LIMPAR BUSCA
============================================ */

function prepararLimparBusca() {
    const botao = document.getElementById("limpar-busca");
    const campo = document.getElementById("buscar-aula");

    if (!botao || !campo) {
        return;
    }

    botao.addEventListener("click", () => {
        campo.value = "";
        campo.dispatchEvent(new Event("input"));

        aulas.forEach(aula => {
            aula.hidden = false;
        });

        modulos.forEach(modulo => {
            modulo.hidden = false;
        });

        campo.focus();
    });
}

/* ============================================
   ACESSO À ENCICLOPÉDIA
============================================ */

function prepararEnciclopedia() {
    botoesEnciclopedia.forEach(botao => {
        botao.addEventListener("click", () => {
            const destino =
                botao.getAttribute("data-enciclopedia") ||
                CONFIG.paginaEnciclopedia;

            window.location.href = destino;
        });
    });
}

/* ============================================
   REGISTRAR ÚLTIMA AULA ACESSADA
============================================ */

function registrarAcessoAulas() {
    aulas.forEach(aula => {
        const links = aula.querySelectorAll("a");

        links.forEach(link => {
            link.addEventListener("click", () => {
                progresso.ultimaAula = aula.dataset.aulaId;
                salvarProgresso();
            });
        });
    });
}

/* ============================================
   CONTINUAR ESTUDO
============================================ */

function prepararContinuarEstudo() {
    const botao = document.getElementById("continuar-estudo");

    if (!botao) {
        return;
    }

    botao.addEventListener("click", () => {
        const id = progresso.ultimaAula;

        const aula = aulas.find(item =>
            item.dataset.aulaId === id
        );

        if (aula) {
            const modulo = aula.closest(".modulo");

            if (modulo) {
                modulo.open = true;
            }

            aula.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return;
        }

        const primeiraAula = aulas[0];

        if (primeiraAula) {
            const modulo = primeiraAula.closest(".modulo");

            if (modulo) {
                modulo.open = true;
            }

            primeiraAula.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    });
}

/* ============================================
   EXPANDIR TODOS OS MÓDULOS
============================================ */

function prepararExpandirModulos() {
    const botao = document.getElementById("expandir-modulos");

    if (!botao) {
        return;
    }

    botao.addEventListener("click", () => {
        const todosAbertos = modulos.every(modulo => modulo.open);

        modulos.forEach(modulo => {
            modulo.open = !todosAbertos;
        });

        botao.textContent = todosAbertos
            ? "Expandir todos os módulos"
            : "Recolher todos os módulos";
    });
}

/* ============================================
   REINICIAR PROGRESSO
============================================ */

function prepararReiniciarProgresso() {
    const botao = document.getElementById("reiniciar-progresso");

    if (!botao) {
        return;
    }

    botao.addEventListener("click", () => {
        const confirmar = window.confirm(
            "Deseja realmente apagar o progresso deste curso?"
        );

        if (!confirmar) {
            return;
        }

        progresso = {
            aulasConcluidas: [],
            ultimaAula: null
        };

        salvarProgresso();
        atualizarProgresso();
    });
}

/* ============================================
   ANO AUTOMÁTICO NO RODAPÉ
============================================ */

function atualizarAno() {
    const elemento = document.getElementById("ano-atual");

    if (elemento) {
        elemento.textContent = new Date().getFullYear();
    }
}

/* ============================================
   INICIALIZAÇÃO
============================================ */

function iniciarCurso() {
    identificarAulas();
    prepararBotoesConclusao();
    prepararBusca();
    prepararLimparBusca();
    prepararEnciclopedia();
    registrarAcessoAulas();
    prepararContinuarEstudo();
    prepararExpandirModulos();
    prepararReiniciarProgresso();
    atualizarProgresso();
    atualizarAno();

    console.log(
        "Curso de História do Cristianismo — Ministério Atalaia carregado."
    );
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarCurso);
} else {
    iniciarCurso();
}
