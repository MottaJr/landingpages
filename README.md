# Portfólio MottaJr • Páginas

Site de portfólio com 4 exemplos de páginas para clientes (barbearia, pizzaria, salão e loja).
Não usa React nem nenhum programa para montar: são só arquivos HTML, CSS e JavaScript comuns.

## Como abrir

Dê dois cliques em `index.html`. Ou suba a pasta inteira para qualquer hospedagem (Netlify, GitHub Pages etc.).
**Mantenha as pastas juntas**, do jeito que estão.

## O que tem em cada pasta

```
index.html          página inicial (o portfólio)
style.css           estilos do portfólio
script.js           menu do topo do portfólio

assets/
  img/              as 4 fotos dos exemplos (.webp)
  js/shared.js      código usado por todas as páginas:
                    número do WhatsApp, formatação de preço (R$),
                    avaliações e "Acesso do Dono" (senha de demonstração: 1234)

sites/
  barbearia/        Corte Fino      → index.html, style.css, script.js
  pizzaria/         Forno Alto      → index.html, style.css, script.js
  salao/            Studio Bella    → index.html, style.css, script.js
  loja/             Atelier & Threads → index.html, style.css, script.js

backup-react/       a versão anterior (feita com React), guardada por segurança.
                    Pode apagar quando tiver certeza de que não precisa mais.
```

Cada site é independente: tem o seu próprio HTML (o conteúdo), CSS (a aparência) e JS (o que acontece ao clicar).

## Mudanças simples

- **Trocar o número do WhatsApp:** abra `assets/js/shared.js` e troque o valor de `WA_NUMBER` (só números, com 55 + DDD).
  Os links que já estão escritos direto no HTML (botões "Chamar no WhatsApp" etc.) usam o número dentro do próprio link;
  procure por `5561999999999` nos arquivos `index.html` e troque também.
- **Trocar textos, títulos e preços fixos:** edite o `index.html` do site.
- **Trocar uma foto:** substitua o arquivo em `assets/img/` mantendo o mesmo nome.

## Como adicionar um novo site

1. Copie uma pasta de `sites/` (por exemplo `sites/salao`) e renomeie (por exemplo `sites/academia`).
2. Edite o `index.html` e o `script.js` da cópia.
3. Se usar classes novas de estilo, o `style.css` precisa ser atualizado (ele só contém as regras das classes que a página usa).
   O mais fácil é me pedir para gerar.
4. Em `index.html` (raiz), adicione um cartão apontando para `sites/academia/index.html`.
