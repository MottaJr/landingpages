/* ==========================================================================
   Portfólio MottaJr • Páginas (script.js)

   O HTML (index.html) já traz a página pronta. Este script cuida só do menu
   do topo: ao clicar em Início, Serviços, Projetos ou Contato, a página rola
   até a seção e o item do menu fica destacado.
   Os cartões dos exemplos (barbearia, pizzaria, salão e loja) são links
   normais para as páginas dentro da pasta sites/.
   ========================================================================== */
(function () {
  "use strict";

  var CLASSE_BASE = "rounded-full px-3 py-2 text-sm font-bold ";
  var CLASSE_ATIVO = "bg-[#1B1512] text-white";
  var CLASSE_INATIVO = "hover:bg-black/5";

  function rolarPara(id) {
    var alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
  }

  /* Destaca no menu o item da seção atual */
  function marcarMenu(id) {
    [].forEach.call(document.querySelectorAll("header nav button[data-id]"), function (b) {
      var ativo = b.getAttribute("data-id") === id;
      b.className = CLASSE_BASE + (ativo ? CLASSE_ATIVO : CLASSE_INATIVO);
      if (ativo) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }

  MJ.bind({
    click: {
      /* menu, logo e "Voltar ao início": destaca e rola */
      ir: function (el) { var id = el.getAttribute("data-id"); marcarMenu(id); rolarPara(id); },
      /* botão "Ver exemplos": só rola, sem mudar o destaque do menu */
      rolar: function (el) { rolarPara(el.getAttribute("data-id")); },
    },
  });
})();
// Função para pegar e formatar a data atual
    function exibirDataAtual() {
      const elementoData = document.getElementById('data-atual');
      const hoje = new Date();

      // Formata a data no padrão brasileiro (dia/mês/ano) e semana
      const dataFormatada = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        weekday: 'long'
      });

      // Exibe com a primeira letra maiúscula
      elementoData.textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
    }

    exibirDataAtual();