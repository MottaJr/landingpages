/* ==========================================================================
   Corte Fino — Barbearia (sites/barbearia/script.js)

   O HTML (index.html) já traz a página pronta. Este script cuida só do que
   muda quando a pessoa interage:
     - agendamento (barbeiro, serviço, data, horário)
     - calculadora de combo
     - galeria com 3 ângulos
     - painel do dono (edita nomes, preços e horário na hora)
     - avaliações e acesso do dono (vêm de ../../assets/js/shared.js)
   ========================================================================== */
(function () {
  "use strict";
  var wa = MJ.wa, brl = MJ.brl, esc = MJ.esc;

  /* ---------- Dados e estado ---------- */
  var HORARIOS = ["09:00", "10:00", "11:00", "14:00", "15:00", "17:00", "19:00"];
  var ESTILOS = [
    { nome: "Degradê", pos: "50% 18%", desc: "Transição limpa, acabamento preciso." },
    { nome: "Social", pos: "50% 35%", desc: "Clássico, alinhado e elegante." },
    { nome: "Navalhado", pos: "50% 50%", desc: "Linha marcada na navalha." },
    { nome: "Barba Desenhada", pos: "50% 68%", desc: "Contorno definido e simétrico." },
    { nome: "Moicano", pos: "50% 82%", desc: "Volume no topo, lateral baixa." },
    { nome: "Careca", pos: "50% 95%", desc: "Acabamento liso e impecável." },
  ];
  var ANGULOS = [
    { label: "Frente", pos: "50% 28%" },
    { label: "Lateral", pos: "18% 45%" },
    { label: "Trás", pos: "82% 58%" },
  ];
  var s = {
    barbeiros: [
      { name: "Rafael Cortez", role: "Master Barber · Degradê" },
      { name: "Diego Prado", role: "Navalhado & Barba" },
      { name: "Thiago Lima", role: "Social & Moicano" },
    ],
    servicos: [
      { name: "Corte", price: 50 }, { name: "Barba", price: 35 }, { name: "Corte + Barba", price: 75 },
      { name: "Degradê", price: 60 }, { name: "Navalhado", price: 65 }, { name: "Sobrancelha", price: 20 },
    ],
    horario: "Seg a Sáb · 9h às 20h",
    painel: false, salvo: "",
    barbeiro: 0, servico: 2, data: "", hora: "10:00", confirmacao: "",
    combo: ["Corte + Barba"],
    galeria: null, angulo: 0,
  };

  var IMG = document.querySelector("header img").getAttribute("src");
  function q(seletor) { return document.querySelector(seletor); }
  function total() {
    return s.servicos.filter(function (x) { return s.combo.indexOf(x.name) >= 0; }).reduce(function (a, x) { return a + x.price; }, 0);
  }

  /* ---------- Trechos da página (cada função devolve o HTML de um pedaço) ---------- */

  function htmlAgendamento() {
    var opB = s.barbeiros.map(function (b, i) {
      return '<option value="' + i + '"' + (i === s.barbeiro ? " selected" : "") + ">" + esc(b.name) + " — " + esc(b.role) + "</option>";
    }).join("");
    var opS = s.servicos.map(function (x, i) {
      return '<option value="' + i + '"' + (i === s.servico ? " selected" : "") + ">" + esc(x.name) + " — " + brl(x.price) + "</option>";
    }).join("");
    var opH = HORARIOS.map(function (h) { return "<option" + (h === s.hora ? " selected" : "") + ">" + h + "</option>"; }).join("");
    var caixa = "";
    if (s.confirmacao) {
      var msg = "Olá! Quero agendar: " + s.servicos[s.servico].name + " com " + s.barbeiros[s.barbeiro].name + " em " + s.data + " às " + s.hora + ".";
      caixa = '<div class="mt-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3 text-sm"><b>✓ ' + esc(s.confirmacao) + "</b><br>" +
        '<a class="underline font-bold" href="' + wa(msg) + '" target="_blank" rel="noopener noreferrer">Confirmar também no WhatsApp →</a></div>';
    }
    return '<div data-r="booking" class="rounded-[24px] bg-[#221D19] border border-white/10 p-6">' +
      '<p class="text-xs font-extrabold tracking-widest text-[#FFB800] uppercase">Agendamento</p>' +
      '<h2 class="font-display text-3xl mt-2">Garanta seu horário</h2>' +
      '<label class="mt-5 block text-sm font-bold">Barbeiro</label>' +
      '<select class="input mt-2 !bg-[#171310] !text-white" data-change="ag-barbeiro">' + opB + "</select>" +
      '<label class="mt-4 block text-sm font-bold">Serviço</label>' +
      '<select class="input mt-2 !bg-[#171310] !text-white" data-change="ag-servico">' + opS + "</select>" +
      '<div class="grid grid-cols-2 gap-3 mt-4">' +
        '<div><label class="text-sm font-bold">Data</label><input type="date" class="input mt-2 !bg-[#171310] !text-white" value="' + esc(s.data) + '" data-input="ag-data"></div>' +
        '<div><label class="text-sm font-bold">Horário</label><select class="input mt-2 !bg-[#171310] !text-white" data-change="ag-hora">' + opH + "</select></div>" +
      "</div>" +
      '<button class="mt-5 w-full rounded-full bg-[#FF4D1A] py-3.5 font-extrabold text-white" data-click="ag-confirmar">Confirmar agendamento</button>' +
      caixa + "</div>";
  }

  function htmlCalculadora() {
    var temCombo = s.combo.indexOf("Corte + Barba") >= 0;
    var linhas = s.servicos.map(function (x, i) {
      var travado = temCombo && (x.name === "Corte" || x.name === "Barba");
      var marcado = s.combo.indexOf(x.name) >= 0;
      return '<label class="flex items-center justify-between rounded-xl border p-3 ' + (travado ? "opacity-40 bg-zinc-100" : "bg-white") + '">' +
        '<span class="flex gap-3 items-center"><input type="checkbox"' + (marcado ? " checked" : "") + (travado ? " disabled" : "") +
        ' class="h-5 w-5 accent-[#FF4D1A]" data-change="calc-marcar" data-i="' + i + '"><b>' + esc(x.name) + "</b>" +
        (travado ? '<span class="text-xs bg-zinc-200 px-2 py-1 rounded-full">já incluso no combo</span>' : "") + "</span>" +
        "<b>" + brl(x.price) + "</b></label>";
    }).join("");
    var t = total();
    return '<div data-r="calc" id="calculadora" class="rounded-[24px] bg-[#FFF6E8] text-black p-6">' +
      '<p class="text-xs font-extrabold tracking-widest text-[#FF4D1A] uppercase">Calculadora de preço</p>' +
      '<h2 class="font-display text-3xl mt-2">Monte seu combo</h2>' +
      '<p class="text-sm text-zinc-600 mt-1">Ao escolher <b>Corte + Barba</b>, os serviços avulsos de Corte e Barba ficam bloqueados — sem pagar duas vezes.</p>' +
      '<div class="mt-4 space-y-2">' + linhas + "</div>" +
      '<div class="mt-4 flex justify-between items-center border-t pt-4"><span class="font-bold">Total estimado</span><span class="font-display text-3xl">' + brl(t) + "</span></div>" +
      '<a href="' + wa("Olá! Quero o combo: " + s.combo.join(", ") + " — total " + brl(t) + ".") + '" target="_blank" rel="noopener noreferrer" class="mt-3 block text-center rounded-full bg-black py-3 font-extrabold text-white">Reservar esse combo no WhatsApp</a></div>';
  }

  function htmlPainel() {
    var barbeiros = s.barbeiros.map(function (b, i) {
      return '<input class="input mt-2 !bg-white" value="' + esc(b.name) + '" data-input="pn-barbeiro" data-i="' + i + '">';
    }).join("");
    var servicos = s.servicos.map(function (x, i) {
      return '<div class="mt-2 flex gap-2"><input class="input !bg-white" value="' + esc(x.name) + '" data-input="pn-nome" data-i="' + i + '">' +
        '<input type="number" class="input !bg-white w-24" value="' + x.price + '" data-input="pn-preco" data-i="' + i + '"></div>';
    }).join("");
    return '<section data-r="panel" class="mx-auto max-w-7xl px-4 sm:px-6 pb-8"><div class="rounded-3xl bg-[#FFB800] p-5 sm:p-6 text-black">' +
      '<div class="flex flex-wrap justify-between gap-3"><div><h2 class="font-display text-2xl">Painel do dono — Corte Fino</h2>' +
      '<p class="text-sm">Edite nesta visita. As alterações aparecem na hora na página.</p></div>' +
      '<button class="rounded-full bg-black px-4 py-2 text-sm font-bold text-white" data-click="pn-fechar">Fechar painel</button></div>' +
      '<div class="mt-5 grid gap-5 lg:grid-cols-3">' +
        '<div><h3 class="font-extrabold">Barbeiros</h3>' + barbeiros + "</div>" +
        '<div><h3 class="font-extrabold">Preços</h3>' + servicos + "</div>" +
        '<div><h3 class="font-extrabold">Horário</h3><input class="input mt-2 !bg-white" value="' + esc(s.horario) + '" data-input="pn-horario">' +
          '<button class="mt-3 w-full rounded-full bg-black py-3 text-sm font-extrabold text-white" data-click="pn-salvar">Salvar alterações</button>' +
          (s.salvo ? '<p class="mt-2 text-sm font-bold">✓ ' + s.salvo + "</p>" : "") + "</div>" +
      "</div></div></section>";
  }

  function htmlGaleria() {
    var e = ESTILOS[s.galeria], a = ANGULOS[s.angulo];
    var abas = ANGULOS.map(function (x, i) {
      return '<button data-click="gl-angulo" data-i="' + i + '" class="px-4 py-2 rounded-full text-sm font-bold ' + (i === s.angulo ? "bg-white text-black" : "bg-black/60 text-white") + '">' + x.label + "</button>";
    }).join("");
    return '<div data-r="gal-modal" class="fixed inset-0 z-[80] bg-black/85 backdrop-blur flex items-center justify-center p-4" role="dialog" aria-modal="true">' +
      '<div class="w-full max-w-2xl rounded-[26px] bg-[#1D1916] border border-white/10 overflow-hidden">' +
        '<div class="flex justify-between p-5"><div><h3 class="font-display text-3xl">' + e.nome + '</h3><p class="text-white/60 text-sm">' + e.desc + "</p></div>" +
        '<button aria-label="Fechar galeria" data-click="gl-fechar">' + MJ.icon("x", 24) + "</button></div>" +
        '<div class="relative"><img src="' + IMG + '" alt="' + e.nome + " — ângulo " + a.label + '" class="h-[330px] sm:h-[420px] w-full object-cover" style="object-position:' + a.pos + '">' +
          '<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">' + abas + "</div>" +
          '<button aria-label="Ângulo anterior" data-click="gl-anterior" class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2">' + MJ.icon("chevron-left", 24) + "</button>" +
          '<button aria-label="Próximo ângulo" data-click="gl-proximo" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2">' + MJ.icon("chevron-right", 24) + "</button></div>" +
        '<div class="flex justify-between p-5"><span class="text-sm text-white/60">Ângulo ' + (s.angulo + 1) + " de 3 — " + a.label + "</span>" +
        '<a href="' + wa("Olá! Quero o corte " + e.nome + ".") + '" target="_blank" rel="noopener noreferrer" class="rounded-full bg-[#FF4D1A] px-4 py-2 text-sm font-extrabold text-white">Quero esse corte</a></div>' +
      "</div></div>";
  }

  /* ---------- Desenhar a página conforme o estado ---------- */
  function desenhar() {
    q('[data-r="open-badge"]').lastChild.nodeValue = " Aberto hoje · " + s.horario;
    q('[data-r="hours-line"]').lastChild.nodeValue = " " + s.horario;
    MJ.patch(q('[data-r="booking"]'), htmlAgendamento());
    MJ.patch(q('[data-r="calc"]'), htmlCalculadora());
    MJ.opcional('[data-r="panel"]', s.painel ? htmlPainel() : "", q("header"), "afterend");
    MJ.opcional('[data-r="gal-modal"]', s.galeria !== null ? htmlGaleria() : "", q('[data-r="gallery"]'), "afterend");
  }

  /* ---------- Eventos ---------- */
  MJ.bind({
    click: {
      "ag-confirmar": function () {
        s.confirmacao = s.data
          ? "Reserva pronta: " + s.servicos[s.servico].name + " com " + s.barbeiros[s.barbeiro].name + " em " + s.data + " às " + s.hora + " — " + brl(s.servicos[s.servico].price) + "."
          : "Escolha uma data para confirmar sua reserva.";
        desenhar();
      },
      "pn-fechar": function () { s.painel = false; desenhar(); },
      "pn-salvar": function () { s.salvo = "Alterações aplicadas nesta sessão."; desenhar(); },
      "gl-abrir": function (el) { s.galeria = Number(el.getAttribute("data-i")); s.angulo = 0; desenhar(); },
      "gl-fechar": function () { s.galeria = null; desenhar(); },
      "gl-angulo": function (el) { s.angulo = Number(el.getAttribute("data-i")); desenhar(); },
      "gl-anterior": function () { s.angulo = (s.angulo + 2) % 3; desenhar(); },
      "gl-proximo": function () { s.angulo = (s.angulo + 1) % 3; desenhar(); },
    },
    input: {
      "ag-data": function (el) { s.data = el.value; desenhar(); },
      "pn-barbeiro": function (el) { s.barbeiros[+el.getAttribute("data-i")].name = el.value; desenhar(); },
      "pn-nome": function (el) { s.servicos[+el.getAttribute("data-i")].name = el.value; desenhar(); },
      "pn-preco": function (el) { s.servicos[+el.getAttribute("data-i")].price = Number(el.value); desenhar(); },
      "pn-horario": function (el) { s.horario = el.value; desenhar(); },
    },
    change: {
      "ag-barbeiro": function (el) { s.barbeiro = Number(el.value); desenhar(); },
      "ag-servico": function (el) { s.servico = Number(el.value); desenhar(); },
      "ag-hora": function (el) { s.hora = el.value; desenhar(); },
      "calc-marcar": function (el) {
        var nome = s.servicos[+el.getAttribute("data-i")].name;
        s.combo = s.combo.indexOf(nome) >= 0 ? s.combo.filter(function (n) { return n !== nome; }) : s.combo.concat([nome]);
        desenhar();
      },
    },
  });

  /* Cartões da galeria: cada um abre a janela de 3 ângulos */
  [].forEach.call(document.querySelectorAll('[data-r="gallery"] .grid > button'), function (b, i) {
    b.setAttribute("data-click", "gl-abrir"); b.setAttribute("data-i", i);
  });

  MJ.avaliacoes({ negocio: "Corte Fino" });
  MJ.acessoDono(function () { s.painel = true; desenhar(); });
  desenhar();
})();
