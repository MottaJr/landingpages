/* ==========================================================================
   Forno Alto — Pizzaria (sites/pizzaria/script.js)

   O HTML (index.html) já traz a página pronta. Este script cuida de:
     - "Monte sua pizza" (tamanho, quantidade, até 2 sabores por pizza, extras, borda, total)
     - Cardápio com filtro por categoria
     - painel do dono (edita nome e preço dos sabores na hora)
     - avaliações e acesso do dono (vêm de ../../assets/js/shared.js)
   ========================================================================== */
(function () {
  "use strict";
  var wa = MJ.wa, brl = MJ.brl, esc = MJ.esc;

  /* ---------- Dados e estado ---------- */
  var PRECO_TAMANHO = { P: 39, M: 49, G: 59 };
  var FATIAS = { P: "4 fatias", M: "8 fatias", G: "12 fatias" };
  var PRECO_EXTRA = 8, PRECO_BORDA = 12;
  var MAX_SABORES = 2;   // máximo de sabores por pizza
  var MAX_PIZZAS = 10;   // máximo de pizzas por pedido
  var EXTRAS = ["Bacon crocante", "Catupiry extra", "Cheddar", "Cebola caramelizada"];
  var CATEGORIAS = ["Todas", "Clássicas", "Especiais", "Doces"];
  var s = {
    sabores: [
      { name: "Margherita", desc: "Molho de tomate, mussarela e manjericão fresco.", price: 54, cat: "Clássicas" },
      { name: "Calabresa", desc: "Calabresa artesanal, cebola roxa e azeite.", price: 59, cat: "Clássicas" },
      { name: "Quatro Queijos", desc: "Mussarela, gorgonzola, parmesão e catupiry.", price: 69, cat: "Especiais" },
      { name: "Frango com Catupiry", desc: "Frango desfiado, milho e catupiry original.", price: 64, cat: "Especiais" },
      { name: "Portuguesa", desc: "Presunto, ovo, ervilha, pimentão e azeitona.", price: 62, cat: "Clássicas" },
      { name: "Chocolate com Morango", desc: "Chocolate ao leite, morango e leite condensado.", price: 58, cat: "Doces" },
    ],
    categoria: "Todas", painel: false, salvo: "",
    tamanho: "M", extras: [], borda: false,
    qtd: 1,          // quantas pizzas no pedido
    pizzas: [[1]],   // uma lista de sabores por pizza; cada sabor é o ÍNDICE em s.sabores (1 = Calabresa)
  };
  function q(seletor) { return document.querySelector(seletor); }
  // preço de UMA pizza (tamanho + extras + borda)
  function precoUnidade() { return PRECO_TAMANHO[s.tamanho] + s.extras.length * PRECO_EXTRA + (s.borda ? PRECO_BORDA : 0); }
  function total() { return precoUnidade() * s.qtd; }
  // transforma [1, 0] em ["Calabresa", "Margherita"]
  function nomes(lista) { return lista.map(function (i) { return s.sabores[i].name; }); }
  // muda a quantidade e mantém s.pizzas com exatamente s.qtd posições
  function defineQtd(n) {
    s.qtd = Math.max(1, Math.min(MAX_PIZZAS, n));
    while (s.pizzas.length < s.qtd) s.pizzas.push([]);   // pizza nova começa sem sabor
    s.pizzas = s.pizzas.slice(0, s.qtd);                  // se diminuiu, descarta as últimas
  }
  function alterna(lista, item) { return lista.indexOf(item) >= 0 ? lista.filter(function (x) { return x !== item; }) : lista.concat([item]); }

  /* ---------- Trechos da página ---------- */

  function htmlMontar() {
    var tamanhos = ["P", "M", "G"].map(function (y) {
      return '<button data-click="tamanho" data-v="' + y + '" class="flex-1 rounded-2xl border-2 p-3 font-extrabold ' + (s.tamanho === y ? "border-[#C22F14] bg-[#FFF2E6]" : "border-zinc-200") + '">' + y +
        '<span class="block text-xs font-medium text-zinc-500">' + FATIAS[y] + " · " + brl(PRECO_TAMANHO[y]) + "</span></button>";
    }).join("");
    // Controle de quantidade: − número +
    var qtdHtml = '<div class="mt-2 flex items-center gap-3">' +
      '<button type="button" class="stepper-btn" data-click="qtd-menos" aria-label="Menos uma pizza"' + (s.qtd <= 1 ? " disabled" : "") + ">−</button>" +
      '<b class="font-display text-3xl">' + s.qtd + "</b>" +
      '<button type="button" class="stepper-btn" data-click="qtd-mais" aria-label="Mais uma pizza"' + (s.qtd >= MAX_PIZZAS ? " disabled" : "") + ">+</button>" +
      '<span class="text-sm text-zinc-500">máx. ' + MAX_PIZZAS + "</span></div>";

    // Uma caixa (fieldset) por pizza, cada uma com um checkbox para cada sabor
    var caixas = s.pizzas.map(function (lista, p) {
      var cheia = lista.length >= MAX_SABORES;
      var opcoes = s.sabores.map(function (f, i) {
        var on = lista.indexOf(i) >= 0;
        var bloqueado = cheia && !on; // limite atingido: trava os sabores que ainda não foram marcados
        return '<label class="sabor-opt' + (on ? " is-on" : "") + (bloqueado ? " is-off" : "") + '">' +
          '<input type="checkbox" class="h-5 w-5 accent-[#C22F14]" data-change="sabor" data-p="' + p + '" data-i="' + i + '"' + (on ? " checked" : "") + (bloqueado ? " disabled" : "") + ">" +
          "<span>" + esc(f.name) + "</span></label>";
      }).join("");
      return '<fieldset class="pizza-box"><legend>Pizza ' + (p + 1) + "</legend>" +
        '<div class="grid gap-2 sm:grid-cols-2">' + opcoes + "</div>" +
        '<p class="mt-2 text-xs text-zinc-500">' + lista.length + " de " + MAX_SABORES + " sabores" + (lista.length === 0 ? " · escolha pelo menos 1" : "") + "</p></fieldset>";
    }).join("");
    var pedidoCompleto = s.pizzas.every(function (lista) { return lista.length > 0; });
    var extras = EXTRAS.map(function (x, i) {
      return '<button data-click="extra" data-i="' + i + '" class="rounded-full border px-4 py-2 text-sm font-bold ' + (s.extras.indexOf(x) >= 0 ? "bg-[#FFB800]" : "bg-white") + '">' + x + "</button>";
    }).join("");
    var t = total();
    var extText = s.extras.join(", ") || "nenhum";
    // uma linha por pizza: "Pizza 1: Calabresa + Margherita"
    var linhas = s.pizzas.map(function (lista, p) {
      return "Pizza " + (p + 1) + ": " + (nomes(lista).join(" + ") || "sem sabor");
    });
    var pedido = "Olá! Quero pedir " + s.qtd + " pizza(s) tamanho " + s.tamanho + " | " + linhas.join(" | ") +
      " | Extras (em cada pizza): " + extText + " | " + (s.borda ? "Com borda" : "Sem borda") + " | Total " + brl(t) + ".";
    var resumoLinhas = linhas.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
    var botao = pedidoCompleto
      ? '<a href="' + wa(pedido) + '" target="_blank" rel="noopener noreferrer" class="mt-4 block text-center rounded-full bg-[#FFB800] py-3.5 font-extrabold text-black">Pedir no WhatsApp →</a>'
      : '<div class="btn-desativado mt-4">Escolha um sabor em cada pizza</div>';
    return '<section data-r="builder" id="montar" class="rounded-[26px] bg-white p-6 sm:p-8 shadow-sm grid gap-8 lg:grid-cols-[1.1fr_.9fr]">' +
      "<div>" +
        '<p class="text-xs font-extrabold tracking-widest text-[#C22F14] uppercase">Monte sua pizza</p>' +
        '<h2 class="font-display text-3xl mt-2">Do seu jeito, sem complicação</h2>' +
        '<p class="mt-5 font-bold">Tamanho</p><div class="mt-2 flex gap-2">' + tamanhos + "</div>" +
        '<p class="mt-5 font-bold">Quantas pizzas?</p>' + qtdHtml +
        '<p class="mt-5 font-bold">Sabores <span class="text-sm font-medium text-zinc-500">· até ' + MAX_SABORES + ' por pizza</span></p><div class="mt-2 grid gap-3">' + caixas + "</div>" +
        '<p class="mt-5 font-bold">Extras · ' + brl(PRECO_EXTRA) + " cada</p><div class=\"mt-2 flex flex-wrap gap-2\">" + extras + "</div>" +
        '<label class="mt-5 flex items-center gap-3 rounded-xl bg-[#FFF2E6] p-3 font-bold"><input type="checkbox"' + (s.borda ? " checked" : "") + ' data-change="borda" class="h-5 w-5 accent-[#C22F14]"> Borda recheada com catupiry · + R$ 12</label>' +
      "</div>" +
      '<div class="rounded-[20px] bg-[#271812] text-white p-6 self-start">' +
        '<p class="text-sm text-white/60">Resumo do pedido</p>' +
        '<h3 class="font-display text-2xl mt-1">' + s.qtd + (s.qtd === 1 ? " pizza" : " pizzas") + " · tamanho " + s.tamanho + "</h3>" +
        '<ul class="mt-3 space-y-2 text-sm">' + resumoLinhas + "</ul>" +
        '<p class="mt-3 text-sm text-white/70">Extras (em cada pizza): ' + esc(extText) + "<br>" + (s.borda ? "Com borda recheada" : "Sem borda recheada") + "</p>" +
        '<div class="mt-5 flex justify-between border-t border-white/15 pt-4 text-sm text-white/70"><span>' + s.qtd + " × " + brl(precoUnidade()) + "</span></div>" +
        '<div class="mt-2 flex justify-between"><span>Total</span><b class="font-display text-3xl">' + brl(t) + "</b></div>" +
        botao +
        '<p class="mt-3 text-center text-xs text-white/60">Sem cadastro. O pedido já chega pronto para a pizzaria.</p>' +
      "</div></section>";
  }

  function htmlCardapio() {
    var abas = CATEGORIAS.map(function (c) {
      return '<button data-click="categoria" data-v="' + c + '" class="rounded-full px-4 py-2 text-sm font-bold ' + (s.categoria === c ? "bg-[#271812] text-white" : "bg-white border") + '">' + c + "</button>";
    }).join("");
    var lista = [];
    s.sabores.forEach(function (f, i) { if (s.categoria === "Todas" || f.cat === s.categoria) lista.push(i); });
    var cards = lista.map(function (i) {
      var f = s.sabores[i];
      return '<article class="rounded-[20px] bg-white p-5 shadow-sm"><div class="flex justify-between">' +
        '<span class="rounded-full bg-[#FFF2E6] px-3 py-1 text-xs font-extrabold text-[#C22F14]">' + f.cat + "</span>" + MJ.stars(5, 15, false) + "</div>" +
        '<h3 class="font-display text-2xl mt-4">' + esc(f.name) + "</h3>" +
        '<p class="text-sm text-zinc-600 mt-1 min-h-[40px]">' + esc(f.desc) + "</p>" +
        '<div class="mt-4 flex justify-between items-center"><b class="text-xl">' + brl(f.price) + "</b>" +
        '<button data-click="quero" data-i="' + i + '" class="rounded-full bg-[#C22F14] px-4 py-2 text-sm font-bold text-white">Quero essa</button></div></article>';
    }).join("");
    return '<section data-r="menu"><div class="flex flex-wrap items-end justify-between gap-4"><h2 class="font-display text-4xl">Cardápio</h2><div class="flex gap-2">' + abas + "</div></div>" +
      '<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + cards + "</div>" +
      (lista.length === 0 ? '<p class="mt-6 text-zinc-600">Nenhuma pizza nesta categoria.</p>' : "") + "</section>";
  }

  function htmlPainel() {
    var linhas = s.sabores.map(function (f, i) {
      return '<div class="flex gap-2"><input class="input !bg-white !text-black" value="' + esc(f.name) + '" data-input="pn-nome" data-i="' + i + '">' +
        '<input type="number" class="input !bg-white !text-black w-24" value="' + f.price + '" data-input="pn-preco" data-i="' + i + '"></div>';
    }).join("");
    return '<section data-r="panel" class="mx-auto max-w-7xl px-4 sm:px-6 pb-8"><div class="rounded-3xl bg-[#271812] p-6 text-white">' +
      '<div class="flex justify-between flex-wrap gap-3"><h2 class="font-display text-2xl">Painel do dono — Forno Alto</h2>' +
      '<button class="rounded-full bg-white px-4 py-2 text-sm font-bold text-black" data-click="pn-fechar">Fechar</button></div>' +
      '<div class="mt-4 grid gap-3 md:grid-cols-2">' + linhas + "</div>" +
      '<button class="mt-4 rounded-full bg-[#FFB800] px-5 py-3 text-sm font-extrabold text-black" data-click="pn-salvar">Salvar cardápio</button>' +
      (s.salvo ? '<p class="mt-2 text-sm font-bold text-emerald-300">✓ ' + s.salvo + "</p>" : "") + "</div></section>";
  }

  function desenhar() {
    MJ.patch(q('[data-r="builder"]'), htmlMontar());
    MJ.patch(q('[data-r="menu"]'), htmlCardapio());
    MJ.opcional('[data-r="panel"]', s.painel ? htmlPainel() : "", q("header"), "afterend");
  }

  /* ---------- Eventos ---------- */
  MJ.bind({
    click: {
      tamanho: function (el) { s.tamanho = el.getAttribute("data-v"); desenhar(); },
      "qtd-menos": function () { defineQtd(s.qtd - 1); desenhar(); },
      "qtd-mais": function () { defineQtd(s.qtd + 1); desenhar(); },
      extra: function (el) { s.extras = alterna(s.extras, EXTRAS[+el.getAttribute("data-i")]); desenhar(); },
      categoria: function (el) { s.categoria = el.getAttribute("data-v"); desenhar(); },
      quero: function (el) {
        s.pizzas[0] = [+el.getAttribute("data-i")]; desenhar(); // "Quero essa" preenche a pizza 1
        var alvo = document.getElementById("montar"); if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
      },
      "pn-fechar": function () { s.painel = false; desenhar(); },
      "pn-salvar": function () { s.salvo = "Cardápio atualizado nesta sessão."; desenhar(); },
    },
    input: {
      "pn-nome": function (el) { s.sabores[+el.getAttribute("data-i")].name = el.value; desenhar(); },
      "pn-preco": function (el) { s.sabores[+el.getAttribute("data-i")].price = Number(el.value); desenhar(); },
    },
    change: {
      borda: function (el) { s.borda = el.checked; desenhar(); },
      sabor: function (el) {
        var p = +el.getAttribute("data-p"), i = +el.getAttribute("data-i");
        var lista = s.pizzas[p];
        var jaMarcado = lista.indexOf(i) >= 0;
        // trava de segurança: não deixa passar do limite, mesmo que o checkbox não esteja disabled
        if (!jaMarcado && lista.length >= MAX_SABORES) { desenhar(); return; }
        s.pizzas[p] = alterna(lista, i);
        desenhar();
      },
    },
  });

  MJ.avaliacoes({ negocio: "Forno Alto", cor: "#C22F14" });
  MJ.acessoDono(function () { s.painel = true; desenhar(); });
  desenhar();
})();
