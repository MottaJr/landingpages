/* ==========================================================================
   Atelier & Threads — Loja (sites/loja/script.js)

   O HTML (index.html) já traz a página pronta. Este script cuida de:
     - vitrine (tamanho de cada peça, estoque, "Adicionar à sacola")
     - sacola (quantidades, remover, cupom MOTTA10, total, finalizar no WhatsApp)
     - painel do dono (edita nome, preço e estoque na hora)
     - avaliações e acesso do dono (vêm de ../../assets/js/shared.js)
   ========================================================================== */
(function () {
  "use strict";
  var wa = MJ.wa, brl = MJ.brl, esc = MJ.esc;

  /* ---------- Dados e estado ---------- */
  var TAMANHOS = ["P", "M", "G", "GG"];
  var CUPOM = "MOTTA10";   /* 10% de desconto */
  var s = {
    produtos: [
      { name: "Camiseta Oversized Areia", price: 129, stock: 6, pos: "50% 20%" },
      { name: "Calça Cargo Bege", price: 249, stock: 3, pos: "50% 45%" },
      { name: "Vestido Linho Natural", price: 289, stock: 0, pos: "50% 65%" },
      { name: "Camisa Linen Branca", price: 199, stock: 8, pos: "50% 85%" },
      { name: "Saia Midi Terracota", price: 179, stock: 4, pos: "50% 35%" },
      { name: "Jaqueta Utilitária", price: 349, stock: 2, pos: "50% 55%" },
    ],
    tamanhos: {},          /* nome da peça -> tamanho escolhido (padrão M) */
    sacola: [],            /* { name, price, size, qty } */
    gaveta: false,
    cupom: "", cupomAplicado: false, cupomMsg: "",
    aviso: "",
    painel: false, salvo: "",
  };
  var IMG = document.querySelector("header img").getAttribute("src");
  function q(seletor) { return document.querySelector(seletor); }
  function subtotal() { return s.sacola.reduce(function (a, g) { return a + g.price * g.qty; }, 0); }
  function desconto() { return s.cupomAplicado ? subtotal() * 0.1 : 0; }

  /* ---------- Trechos da página ---------- */

  function htmlBotaoSacola() {
    var qtd = s.sacola.reduce(function (a, g) { return a + g.qty; }, 0);
    return '<button data-r="bag-btn" data-click="sacola-abrir" class="relative rounded-full bg-black px-4 py-2 text-sm font-bold text-white">🛍 Sacola ' +
      (s.sacola.length > 0 ? '<span class="ml-1 rounded-full bg-[#FF4D1A] px-2 py-0.5 text-xs">' + qtd + "</span>" : "") + "</button>";
  }

  function htmlVitrine() {
    var cards = s.produtos.map(function (g, i) {
      var esgotado = g.stock === 0;
      var tam = s.tamanhos[g.name] || "M";
      var botoesTam = TAMANHOS.map(function (t) {
        return '<button data-click="tamanho" data-i="' + i + '" data-v="' + t + '" class="flex-1 rounded-lg border py-2 text-sm font-bold ' + (tam === t ? "bg-black text-white" : "bg-white") + '">' + t + "</button>";
      }).join("");
      return '<article class="overflow-hidden rounded-[20px] bg-white shadow-sm"><div class="relative">' +
        '<img src="' + IMG + '" alt="' + esc(g.name) + '" class="h-64 w-full object-cover" style="object-position:' + g.pos + '" loading="lazy" decoding="async">' +
        (esgotado ? '<span class="absolute top-3 left-3 rounded-full bg-black px-3 py-1 text-xs font-extrabold text-white">ESGOTADO</span>' : "") +
        '<span class="absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-extrabold ' + (esgotado ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800") + '">' +
        (esgotado ? "Sem estoque" : "Estoque: " + g.stock + " unidade" + (g.stock > 1 ? "s" : "")) + "</span></div>" +
        '<div class="p-5"><h3 class="font-display text-xl leading-tight min-h-[52px]">' + esc(g.name) + "</h3>" +
        '<div class="mt-3 flex items-center justify-between"><b class="text-xl">' + brl(g.price) + '</b><span class="text-xs text-zinc-500">ou 3x de ' + brl(g.price / 3) + "</span></div>" +
        '<label class="mt-3 block text-xs font-bold uppercase tracking-wide">Tamanho</label><div class="mt-1 flex gap-2">' + botoesTam + "</div>" +
        '<button' + (esgotado ? " disabled" : "") + ' data-click="adicionar" data-i="' + i + '" class="mt-4 w-full rounded-full py-3 text-sm font-extrabold ' +
        (esgotado ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-[#FF4D1A] text-white") + '">' + (esgotado ? "ESGOTADO" : "Adicionar à sacola") + "</button></div></article>";
    }).join("");
    return '<section data-r="showcase" id="vitrine"><div class="flex justify-between items-end"><div>' +
      '<p class="text-xs font-extrabold tracking-widest uppercase">Vitrine</p><h2 class="font-display text-4xl mt-1">Peças em destaque</h2></div>' +
      '<p class="hidden sm:block text-sm text-zinc-500">Estoque atualizado nesta visita.</p></div>' +
      (s.aviso ? '<p class="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-bold">✓ ' + esc(s.aviso) + "</p>" : "") +
      '<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">' + cards + "</div></section>";
  }

  function htmlGaveta() {
    var corpo;
    if (s.sacola.length === 0) {
      corpo = '<p class="mt-8 text-zinc-600">Sua sacola está vazia. Escolha uma peça na vitrine para começar.</p>';
    } else {
      var sub = subtotal(), desc = desconto(), tot = sub - desc;
      var itens = s.sacola.map(function (g, i) {
        return '<div class="flex justify-between gap-3 rounded-2xl border p-3"><div><b>' + esc(g.name) + '</b><p class="text-sm text-zinc-500">Tam. ' + g.size + " · " + brl(g.price) + "</p>" +
          '<div class="mt-2 flex items-center gap-2"><button aria-label="Diminuir" data-click="diminuir" data-i="' + i + '" class="rounded-full border p-1">' + MJ.icon("minus", 14) + "</button><b>" + g.qty + "</b>" +
          '<button aria-label="Aumentar" data-click="aumentar" data-i="' + i + '" class="rounded-full border p-1">' + MJ.icon("plus", 14) + "</button></div></div>" +
          '<div class="text-right"><b>' + brl(g.price * g.qty) + '</b><br><button data-click="remover" data-i="' + i + '" class="mt-2 text-xs font-bold text-red-600">Remover</button></div></div>';
      }).join("");
      var pedido = "Olá! Quero finalizar meu pedido: " + s.sacola.map(function (g) { return g.qty + "x " + g.name + " (tam. " + g.size + ")"; }).join(" | ") +
        " | Total " + brl(tot) + " " + (s.cupomAplicado ? "(cupom MOTTA10 aplicado)" : "") + ".";
      corpo = '<div class="mt-6 space-y-3">' + itens + "</div>" +
        '<div class="mt-5"><label class="text-sm font-bold">Cupom de desconto</label><div class="mt-1 flex gap-2">' +
          '<input class="input uppercase" placeholder="MOTTA10" value="' + esc(s.cupom) + '" data-input="cupom">' +
          '<button data-click="cupom-aplicar" class="shrink-0 rounded-full bg-black px-4 text-sm font-bold text-white">Aplicar</button></div>' +
          (s.cupomMsg ? '<p class="mt-2 text-sm font-bold ' + (s.cupomAplicado ? "text-emerald-700" : "text-red-600") + '">' + s.cupomMsg + "</p>" : "") + "</div>" +
        '<div class="mt-5 space-y-1 border-t pt-4 text-sm"><div class="flex justify-between"><span>Subtotal</span><span>' + brl(sub) + "</span></div>" +
          (s.cupomAplicado ? '<div class="flex justify-between text-emerald-700 font-bold"><span>Desconto MOTTA10 (10%)</span><span>− ' + brl(desc) + "</span></div>" : "") +
          '<div class="flex justify-between text-lg font-extrabold pt-2"><span>Total</span><span>' + brl(tot) + "</span></div></div>" +
        '<a href="' + wa(pedido) + '" target="_blank" rel="noopener noreferrer" class="mt-5 block text-center rounded-full bg-[#1FA463] py-3.5 font-extrabold text-white">Finalizar no WhatsApp →</a>' +
        '<button data-click="esvaziar" class="mt-3 w-full text-sm font-bold text-zinc-500">Esvaziar sacola</button>';
    }
    return '<div data-r="drawer" class="fixed inset-0 z-[80]"><button aria-label="Fechar sacola" data-click="sacola-fechar" class="absolute inset-0 bg-black/55"></button>' +
      '<aside class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-6 overflow-y-auto">' +
      '<div class="flex justify-between items-center"><h2 class="font-display text-3xl">Sua sacola</h2><button aria-label="Fechar" data-click="sacola-fechar">' + MJ.icon("x", 24) + "</button></div>" +
      corpo + "</aside></div>";
  }

  function htmlPainel() {
    var linhas = s.produtos.map(function (g, i) {
      return '<div class="flex gap-2"><input class="input !bg-white !text-black" value="' + esc(g.name) + '" data-input="pn-nome" data-i="' + i + '">' +
        '<input type="number" class="input !bg-white !text-black w-24" value="' + g.price + '" data-input="pn-preco" data-i="' + i + '">' +
        '<input type="number" class="input !bg-white !text-black w-20" value="' + g.stock + '" data-input="pn-estoque" data-i="' + i + '"></div>';
    }).join("");
    return '<section data-r="panel" class="mx-auto max-w-7xl px-4 sm:px-6 pb-8"><div class="rounded-3xl bg-[#1E1A16] p-6 text-white">' +
      '<div class="flex justify-between flex-wrap gap-3"><h2 class="font-display text-2xl">Painel do dono — Atelier & Threads</h2>' +
      '<button class="rounded-full bg-white px-4 py-2 text-sm font-bold text-black" data-click="pn-fechar">Fechar</button></div>' +
      '<div class="mt-4 grid gap-3 md:grid-cols-2">' + linhas + "</div>" +
      '<p class="mt-2 text-xs text-white/60">Os três campos são: nome · preço · estoque.</p>' +
      '<button class="mt-4 rounded-full bg-[#FFB800] px-5 py-3 text-sm font-extrabold text-black" data-click="pn-salvar">Salvar vitrine</button>' +
      (s.salvo ? '<p class="mt-2 text-sm font-bold text-emerald-300">✓ ' + s.salvo + "</p>" : "") + "</div></section>";
  }

  function desenhar() {
    MJ.patch(q('[data-r="bag-btn"]'), htmlBotaoSacola());
    MJ.patch(q('[data-r="showcase"]'), htmlVitrine());
    MJ.opcional('[data-r="panel"]', s.painel ? htmlPainel() : "", q("header"), "afterend");
    MJ.opcional('[data-r="drawer"]', s.gaveta ? htmlGaveta() : "", q("main").parentElement, "beforeend");
  }

  /* ---------- Eventos ---------- */
  function mudaQtd(i, delta) { var g = s.sacola[i]; g.qty = Math.max(1, g.qty + delta); desenhar(); }

  MJ.bind({
    click: {
      tamanho: function (el) { s.tamanhos[s.produtos[+el.getAttribute("data-i")].name] = el.getAttribute("data-v"); desenhar(); },
      adicionar: function (el) {
        var g = s.produtos[+el.getAttribute("data-i")];
        if (g.stock === 0) return;
        var tam = s.tamanhos[g.name] || "M";
        var ja = s.sacola.filter(function (x) { return x.name === g.name && x.size === tam; })[0];
        if (ja) ja.qty += 1; else s.sacola.push({ name: g.name, price: g.price, size: tam, qty: 1 });
        s.aviso = g.name + " (tam. " + tam + ") foi para a sacola.";
        s.gaveta = true; desenhar();
      },
      "sacola-abrir": function () { s.gaveta = true; desenhar(); },
      "sacola-fechar": function () { s.gaveta = false; desenhar(); },
      aumentar: function (el) { mudaQtd(+el.getAttribute("data-i"), 1); },
      diminuir: function (el) { mudaQtd(+el.getAttribute("data-i"), -1); },
      remover: function (el) { s.sacola.splice(+el.getAttribute("data-i"), 1); desenhar(); },
      "cupom-aplicar": function () {
        if (s.cupom.trim().toUpperCase() === CUPOM) { s.cupomAplicado = true; s.cupomMsg = "Cupom aplicado: 10% de desconto."; }
        else { s.cupomAplicado = false; s.cupomMsg = "Cupom inválido. Tente MOTTA10."; }
        desenhar();
      },
      esvaziar: function () { s.sacola = []; s.cupomAplicado = false; s.cupom = ""; desenhar(); },
      "pn-fechar": function () { s.painel = false; desenhar(); },
      "pn-salvar": function () { s.salvo = "Vitrine atualizada nesta sessão."; desenhar(); },
    },
    input: {
      cupom: function (el) { s.cupom = el.value; },
      "pn-nome": function (el) { s.produtos[+el.getAttribute("data-i")].name = el.value; desenhar(); },
      "pn-preco": function (el) { s.produtos[+el.getAttribute("data-i")].price = Number(el.value); desenhar(); },
      "pn-estoque": function (el) { s.produtos[+el.getAttribute("data-i")].stock = Number(el.value); desenhar(); },
    },
  });

  MJ.avaliacoes({ negocio: "Atelier & Threads", cor: "#1E1A16" });
  MJ.acessoDono(function () { s.painel = true; desenhar(); });
  desenhar();
})();
