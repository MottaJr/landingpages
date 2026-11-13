/* ==========================================================================
   Studio Bella — Salão (sites/salao/script.js)

   O HTML (index.html) já traz a página pronta. Este script cuida de:
     - agendamento multi-serviço (serviços, profissional de cada um, data, horário, total)
     - painel do dono (edita nome e preço dos serviços na hora)
     - avaliações e acesso do dono (vêm de ../../assets/js/shared.js)
   ========================================================================== */
(function () {
  "use strict";
  var wa = MJ.wa, brl = MJ.brl, esc = MJ.esc;

  /* ---------- Dados e estado ---------- */
  var TODAS = ["Ana Souza", "Beatriz Lima", "Carla Mendes"];
  var HORARIOS = ["09:00", "11:00", "14:00", "16:00", "18:00"];
  var s = {
    servicos: [
      { name: "Corte", price: 90, pros: TODAS },
      { name: "Coloração", price: 180, pros: ["Ana Souza"] },
      { name: "Hidratação", price: 120, pros: TODAS },
      { name: "Manicure", price: 60, pros: ["Beatriz Lima", "Carla Mendes"] },
      { name: "Maquiagem", price: 150, pros: ["Beatriz Lima"] },
      { name: "Penteado", price: 130, pros: TODAS },
    ],
    marcados: ["Corte"],          /* nomes dos serviços marcados */
    profissionais: { Corte: "Ana Souza" },  /* serviço -> profissional escolhida */
    data: "", hora: "14:00", confirmacao: "",
    painel: false, salvo: "",
  };
  function q(seletor) { return document.querySelector(seletor); }
  function total() {
    return s.servicos.filter(function (x) { return s.marcados.indexOf(x.name) >= 0; }).reduce(function (a, x) { return a + x.price; }, 0);
  }

  /* ---------- Trechos da página ---------- */

  function htmlPacote() {
    var cards = s.servicos.map(function (p, i) {
      var on = s.marcados.indexOf(p.name) >= 0;
      var escolha = "";
      if (on) {
        var atual = s.profissionais[p.name] || p.pros[0];
        var ops = p.pros.map(function (v) { return "<option" + (v === atual ? " selected" : "") + ">" + v + "</option>"; }).join("");
        escolha = '<div class="mt-3"><label class="text-xs font-bold uppercase tracking-wide">Profissional ' + (p.pros.length === 1 ? "· seleção automática" : "") + "</label>" +
          '<select class="input mt-1 !bg-white" data-change="profissional" data-i="' + i + '">' + ops + "</select></div>";
      }
      return '<div class="rounded-2xl border-2 p-4 ' + (on ? "border-[#B84A7A] bg-[#FFF2F7]" : "border-zinc-100") + '">' +
        '<label class="flex justify-between gap-3"><span class="flex gap-3"><input type="checkbox"' + (on ? " checked" : "") + ' class="h-5 w-5 accent-[#B84A7A]" data-change="marcar" data-i="' + i + '">' +
        "<span><b>" + esc(p.name) + '</b><span class="block text-xs text-zinc-500">Sem duração fixa · atendimento personalizado</span></span></span><b>' + brl(p.price) + "</b></label>" + escolha + "</div>";
    }).join("");
    var horas = HORARIOS.map(function (h) { return "<option" + (h === s.hora ? " selected" : "") + ">" + h + "</option>"; }).join("");
    var t = total();
    var caixa = "";
    if (s.confirmacao) {
      var msg = "Olá! Quero agendar no Studio Bella: " + s.marcados.join(", ") + " em " + s.data + " às " + s.hora + ". Total " + brl(t) + ".";
      caixa = '<div class="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm"><b>✓ ' + esc(s.confirmacao) + "</b><br>" +
        '<a class="underline font-bold" href="' + wa(msg) + '" target="_blank" rel="noopener noreferrer">Confirmar no WhatsApp →</a></div>';
    }
    return '<section data-r="package" id="agendar-salao" class="rounded-[26px] bg-white p-6 sm:p-8 shadow-sm">' +
      '<p class="text-xs font-extrabold tracking-widest text-[#B84A7A] uppercase">Agendamento multi-serviço</p>' +
      '<h2 class="font-display text-3xl mt-2">Monte seu pacote em um só agendamento</h2>' +
      '<p class="mt-2 text-sm text-zinc-600">Marque quantos serviços quiser. Quando um serviço tem só uma profissional, ela já vem selecionada automaticamente.</p>' +
      '<div class="mt-6 grid gap-3 md:grid-cols-2">' + cards + "</div>" +
      '<div class="mt-6 grid gap-3 sm:grid-cols-3">' +
        '<div><label class="text-sm font-bold">Data</label><input type="date" class="input mt-1" value="' + esc(s.data) + '" data-input="data"></div>' +
        '<div><label class="text-sm font-bold">Horário</label><select class="input mt-1" data-change="hora">' + horas + "</select></div>" +
        '<div class="rounded-2xl bg-[#FFF2F7] p-3 flex justify-between items-center"><span><b>' + s.marcados.length + ' serviço(s)</b><span class="block text-xs text-zinc-500">Total do pacote</span></span><b class="font-display text-2xl">' + brl(t) + "</b></div>" +
      "</div>" +
      '<button class="mt-5 w-full rounded-full bg-[#B84A7A] py-3.5 font-extrabold text-white" data-click="confirmar">Confirmar pacote</button>' +
      caixa + "</section>";
  }

  function htmlPainel() {
    var linhas = s.servicos.map(function (p, i) {
      return '<div class="flex gap-2"><input class="input !bg-white !text-black" value="' + esc(p.name) + '" data-input="pn-nome" data-i="' + i + '">' +
        '<input type="number" class="input !bg-white !text-black w-24" value="' + p.price + '" data-input="pn-preco" data-i="' + i + '"></div>';
    }).join("");
    return '<section data-r="panel" class="mx-auto max-w-7xl px-4 sm:px-6 pb-8"><div class="rounded-3xl bg-[#2A1D24] p-6 text-white">' +
      '<div class="flex justify-between flex-wrap gap-3"><h2 class="font-display text-2xl">Painel do dono — Studio Bella</h2>' +
      '<button class="rounded-full bg-white px-4 py-2 text-sm font-bold text-black" data-click="pn-fechar">Fechar</button></div>' +
      '<div class="mt-4 grid gap-3 md:grid-cols-2">' + linhas + "</div>" +
      '<button class="mt-4 rounded-full bg-[#FFB8D1] px-5 py-3 text-sm font-extrabold text-black" data-click="pn-salvar">Salvar serviços</button>' +
      (s.salvo ? '<p class="mt-2 text-sm font-bold text-emerald-300">✓ ' + s.salvo + "</p>" : "") + "</div></section>";
  }

  function desenhar() {
    MJ.patch(q('[data-r="package"]'), htmlPacote());
    MJ.opcional('[data-r="panel"]', s.painel ? htmlPainel() : "", q("header"), "afterend");
  }

  /* ---------- Eventos ---------- */
  MJ.bind({
    click: {
      confirmar: function () {
        var t = total();
        s.confirmacao = !s.data ? "Escolha uma data para confirmar."
          : s.marcados.length === 0 ? "Escolha pelo menos um serviço."
          : "Pacote confirmado: " + s.marcados.map(function (n) { return n + " com " + (s.profissionais[n] || ""); }).join(" · ") + " em " + s.data + " às " + s.hora + " — " + brl(t) + ".";
        desenhar();
      },
      "pn-fechar": function () { s.painel = false; desenhar(); },
      "pn-salvar": function () { s.salvo = "Serviços atualizados nesta sessão."; desenhar(); },
    },
    input: {
      data: function (el) { s.data = el.value; desenhar(); },
      "pn-nome": function (el) { s.servicos[+el.getAttribute("data-i")].name = el.value; desenhar(); },
      "pn-preco": function (el) { s.servicos[+el.getAttribute("data-i")].price = Number(el.value); desenhar(); },
    },
    change: {
      marcar: function (el) {
        var p = s.servicos[+el.getAttribute("data-i")];
        if (s.marcados.indexOf(p.name) >= 0) s.marcados = s.marcados.filter(function (n) { return n !== p.name; });
        else { s.marcados = s.marcados.concat([p.name]); s.profissionais[p.name] = p.pros[0]; }
        desenhar();
      },
      profissional: function (el) { s.profissionais[s.servicos[+el.getAttribute("data-i")].name] = el.value; desenhar(); },
      hora: function (el) { s.hora = el.value; desenhar(); },
    },
  });

  MJ.avaliacoes({ negocio: "Studio Bella", cor: "#B84A7A" });
  MJ.acessoDono(function () { s.painel = true; desenhar(); });
  desenhar();
})();
