/* ==========================================================================
   shared.js — funções usadas por TODAS as páginas (portfólio e sites).

   Cada página carrega este arquivo primeiro e depois o seu próprio script.js.
   Tudo fica dentro do objeto global "MJ" para não misturar com outros códigos.

   Conteúdo:
     1. Utilidades: link do WhatsApp, moeda (R$), proteção de texto, ícones
     2. Atualização da tela: patch() troca só o que mudou
     3. Eventos: bind() liga cliques/digitação por atributos data-*
     4. Componentes repetidos: avaliações e "Acesso do Dono"
   ========================================================================== */
(function () {
  "use strict";

  var MJ = (window.MJ = {});

  /* ---------- 1. Utilidades ---------- */

  /* Número do WhatsApp do Motta Jr (só dígitos, com DDI e DDD). Troque aqui. */
  MJ.WA_NUMBER = "5561999999999";

  /* Monta o link do WhatsApp com a mensagem já escrita. */
  MJ.wa = function (texto) {
    return "https://wa.me/" + MJ.WA_NUMBER + "?text=" + encodeURIComponent(texto);
  };

  /* Formata número como moeda brasileira: 75 -> "R$ 75"; 96.33 -> "R$ 96,33". */
  MJ.brl = function (n) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: n % 1 ? 2 : 0 });
  };

  /* Protege textos digitados pelo usuário antes de colocá-los no HTML. */
  MJ.esc = function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  /* Ícones (biblioteca Lucide) usados nas telas que o JavaScript desenha. */
  var ICONES = {
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>',
    x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    "chevron-left": '<path d="m15 18-6-6 6-6"></path>',
    "chevron-right": '<path d="m9 18 6-6-6-6"></path>',
    minus: '<path d="M5 12h14"></path>',
    plus: '<path d="M5 12h14"></path><path d="M12 5v14"></path>',
  };
  MJ.icon = function (nome, tamanho, opcoes) {
    var o = opcoes || {};
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + tamanho + '" height="' + tamanho +
      '" viewBox="0 0 24 24" fill="' + (o.fill || "none") + '" stroke="' + (o.stroke || "currentColor") +
      '" stroke-width="' + (o.sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-' +
      nome + '">' + ICONES[nome] + "</svg>"
    );
  };

  /* Estrelas de nota (1 a 5). Se "clicavel" for true, cada estrela vira botão de escolha. */
  MJ.stars = function (valor, tamanho, clicavel) {
    var html = '<div class="flex gap-1" aria-label="Avaliação ' + valor + ' de 5">';
    for (var r = 1; r <= 5; r++) {
      var cor = r <= valor ? "#FFB800" : "#C8BBA9";
      html +=
        '<button type="button"' + (clicavel ? ' data-click="rv-star" data-v="' + r + '"' : "") +
        ' aria-label="' + r + " estrela" + (r > 1 ? "s" : "") + '" class="transition hover:scale-110">' +
        MJ.icon("star", tamanho, { fill: r <= valor ? "#FFB800" : "transparent", stroke: cor, sw: 1.7 }) + "</button>";
    }
    return html + "</div>";
  };

  /* ---------- 2. Atualização da tela ---------- */

  /* Compara o elemento "o" (que está na página) com o "n" (novo) e corrige só o que for diferente.
     Assim campos de texto não perdem o cursor enquanto a pessoa digita. */
  function sincronizar(o, n) {
    var i, a;
    var attrs = Array.prototype.slice.call(o.attributes);
    for (i = 0; i < attrs.length; i++) if (!n.hasAttribute(attrs[i].name)) o.removeAttribute(attrs[i].name);
    for (i = 0; i < n.attributes.length; i++) {
      a = n.attributes[i];
      if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
    }
    var nc = n.childNodes;
    for (i = 0; i < nc.length; i++) {
      var velho = o.childNodes[i], novo = nc[i];
      if (!velho) o.appendChild(novo.cloneNode(true));
      else if (velho.nodeType !== novo.nodeType || velho.nodeName !== novo.nodeName) o.replaceChild(novo.cloneNode(true), velho);
      else if (velho.nodeType === 3) { if (velho.nodeValue !== novo.nodeValue) velho.nodeValue = novo.nodeValue; }
      else sincronizar(velho, novo);
    }
    while (o.childNodes.length > nc.length) o.removeChild(o.lastChild);

    /* Estado dos campos (é uma propriedade, não um atributo) */
    if (o.tagName === "INPUT") {
      if (o.type === "checkbox" || o.type === "radio") o.checked = n.hasAttribute("checked");
      else {
        var v = n.getAttribute("value") || "";
        if (o.type === "number" ? (v === "0" && o.value === "") || o.value != v : o.value !== v) o.value = v;
      }
    } else if (o.tagName === "TEXTAREA") {
      if (o.value !== n.textContent) o.value = n.textContent;
    } else if (o.tagName === "OPTION") {
      o.selected = n.hasAttribute("selected");
    }
  }

  /* Atualiza o elemento "el" para ficar igual ao HTML novo (que deve ter 1 elemento raiz). */
  MJ.patch = function (el, html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    sincronizar(el, t.content.firstElementChild);
  };

  /* Mostra/atualiza/remove um elemento opcional (painel, janela, gaveta...).
     "html" vazio remove. "onde" e "posicao" dizem onde inserir se ainda não existir. */
  MJ.opcional = function (seletor, html, onde, posicao) {
    var atual = document.querySelector(seletor);
    if (!html) { if (atual) atual.remove(); return; }
    if (atual) MJ.patch(atual, html);
    else onde.insertAdjacentHTML(posicao, html);
  };

  /* ---------- 3. Eventos ---------- */

  /* Liga os eventos usando atributos do HTML. Exemplo:
       <button data-click="salvar">   +   MJ.bind({ click: { salvar: function (el) {...} } })
     Tipos aceitos: click, input (digitar), change (escolher), keydown. */
  MJ.bind = function (tratadores) {
    ["click", "input", "change", "keydown"].forEach(function (tipo) {
      if (!tratadores[tipo]) return;
      document.addEventListener(tipo, function (e) {
        var el = e.target.closest ? e.target.closest("[data-" + tipo + "]") : null;
        if (!el) return;
        var f = tratadores[tipo][el.getAttribute("data-" + tipo)];
        if (f) f(el, e);
      });
    });
  };

  /* Links que saem do site (outro endereço, e-mail, telefone) abrem em nova aba com segurança. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (/^(https?:|mailto:|tel:|sms:)/i.test(h) && a.target !== "_blank") { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  }, true);

  /* ---------- 4. Componentes repetidos ---------- */

  /* Caixa "Como foi sua experiência?" (aparece nos 4 sites).
     config = { negocio: "Corte Fino", cor: "#FF4D1A" } */
  MJ.avaliacoes = function (config) {
    var cor = config.cor || "#FF4D1A";
    var s = { nome: "", nota: 5, texto: "", lista: [], msg: "" };

    function html() {
      var itens = s.lista.map(function (t) {
        return '<div class="rounded-xl bg-[var(--surface)] p-3 text-sm flex gap-2">' +
          MJ.icon("star", 16, { fill: "#FFB800", stroke: "#FFB800" }) + "<span>" + MJ.esc(t) + "</span></div>";
      }).join("");
      return '<div data-r="reviews" class="rounded-[22px] border border-[var(--line)] bg-[var(--surface-2)] p-5 sm:p-6">' +
        '<h3 class="font-display text-2xl">Como foi sua experiência?</h3>' +
        '<p class="text-sm text-[var(--muted)] mt-1">Sua avaliação ajuda o ' + MJ.esc(config.negocio) + " a melhorar — e ajuda outros clientes a escolher.</p>" +
        '<div class="mt-5 grid gap-3 sm:grid-cols-2">' +
          '<input class="input" value="' + MJ.esc(s.nome) + '" placeholder="Seu nome" data-input="rv-nome">' +
          '<div class="flex items-center gap-2"><span class="text-sm font-bold">Nota</span>' + MJ.stars(s.nota, 26, true) + "</div>" +
        "</div>" +
        '<textarea class="input mt-3 min-h-[96px]" placeholder="Ex.: Atendimento rápido, corte ficou exatamente como pedi..." data-input="rv-texto">' + MJ.esc(s.texto) + "</textarea>" +
        '<div class="mt-3 flex flex-wrap items-center gap-3">' +
          '<button class="rounded-full px-5 py-3 text-sm font-extrabold text-white" style="background:' + cor + '" data-click="rv-enviar">Enviar avaliação</button>' +
          (s.msg ? '<p class="text-sm font-semibold text-emerald-700">' + s.msg + "</p>" : "") +
        "</div>" +
        (s.lista.length ? '<div class="mt-5 space-y-2">' + itens + "</div>" : "") +
      "</div>";
    }
    function desenhar() { MJ.patch(document.querySelector('[data-r="reviews"]'), html()); }

    MJ.bind({
      click: {
        "rv-star": function (el) { s.nota = Number(el.getAttribute("data-v")); desenhar(); },
        "rv-enviar": function () {
          if (!s.nome.trim() || !s.texto.trim()) { s.msg = "Conte seu nome e como foi a experiência antes de enviar."; desenhar(); return; }
          s.lista = ["“" + s.texto.trim() + "” — " + s.nome.trim() + " · " + s.nota + " estrelas"].concat(s.lista);
          s.msg = "Obrigado! Sua avaliação apareceu abaixo e ficou salva nesta visita.";
          s.nome = ""; s.texto = ""; s.nota = 5; desenhar();
        },
      },
      input: {
        "rv-nome": function (el) { s.nome = el.value; },
        "rv-texto": function (el) { s.texto = el.value; },
      },
    });
    desenhar();
  };

  /* Botão "Acesso do Dono" + janela de senha (aparece nos 4 sites).
     aoEntrar() é chamada quando a senha (1234, de demonstração) está correta. */
  MJ.acessoDono = function (aoEntrar) {
    var s = { aberto: false, senha: "", erro: "" };
    var SELETOR = '[data-r="owner-modal"]';

    function html() {
      return '<div data-r="owner-modal" class="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">' +
        '<div class="w-full max-w-sm rounded-3xl bg-white p-6 text-[#1B1512] shadow-2xl">' +
          '<div class="flex justify-between"><div><h3 class="font-display text-2xl">Área do dono</h3>' +
          '<p class="text-sm text-zinc-500 mt-1">Acesso de demonstração para editar o conteúdo.</p></div>' +
          '<button aria-label="Fechar" data-click="oa-fechar">' + MJ.icon("x", 24) + "</button></div>" +
          '<label class="mt-5 block text-sm font-bold">Senha</label>' +
          '<input type="password" inputmode="numeric" class="input mt-2 !bg-white" value="' + MJ.esc(s.senha) + '" placeholder="••••" data-input="oa-senha" data-keydown="oa-tecla">' +
          (s.erro ? '<p class="mt-2 text-sm font-semibold text-red-600">' + s.erro + "</p>" : "") +
          '<p class="mt-2 text-xs text-zinc-500">Demonstração: use <b>1234</b></p>' +
          '<button class="mt-4 w-full rounded-full bg-[#1B1512] py-3 text-sm font-extrabold text-white" data-click="oa-entrar">Entrar no painel</button>' +
        "</div></div>";
    }
    function desenhar() {
      MJ.opcional(SELETOR, s.aberto ? html() : "", document.querySelector('[data-r="owner-btn"]'), "afterend");
    }
    function entrar() {
      if (s.senha === "1234") { s.aberto = false; s.senha = ""; s.erro = ""; desenhar(); aoEntrar(); }
      else { s.erro = "Senha incorreta. Dica de demonstração: 1234"; desenhar(); }
    }
    MJ.bind({
      click: {
        "oa-abrir": function () { s.aberto = true; desenhar(); },
        "oa-fechar": function () { s.aberto = false; desenhar(); },
        "oa-entrar": entrar,
      },
      input: { "oa-senha": function (el) { s.senha = el.value; } },
      keydown: { "oa-tecla": function (el, e) { if (e.key === "Enter") entrar(); } },
    });
    document.querySelector('[data-r="owner-btn"]').setAttribute("data-click", "oa-abrir");
  };
})();
