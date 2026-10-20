# Instruções para o Claude neste repositório

## Projeto "Controle de Horas" (pasta `controle-de-horas/`)

Sistema de controle de horas de colaboradores (CLT e diaristas), instalável no celular.
O usuário não é técnico e fala português: responda sempre em português do Brasil, com linguagem simples.

### Regra fixa: ao final de TODA atualização ou correção

Sempre termine a resposta com estas duas partes, nesta ordem:

1. **Passo a passo para atualizar o site**, completo e numerado, sem supor que o usuário lembra dos passos anteriores.
2. **Os links de acesso**, prontos para clicar (lista abaixo).

Também diga em uma frase o que mudou e o que o usuário deve testar depois de atualizar.
Se algo não foi testado (por exemplo, a parte da nuvem), diga isso claramente.

### Passo a passo padrão para atualizar o site (Netlify)

1. Baixe a versão nova: abra o link do ZIP (abaixo). O download começa sozinho.
2. Na pasta Downloads, clique com o botão direito no ZIP, escolha **Extrair tudo** e depois **Extrair**.
3. Entre na pasta extraída e localize a pasta **controle-de-horas**. Suba um nível, para ver a pasta como ícone.
4. Abra o painel do Netlify, no projeto do sistema, na página **Deploys** (link abaixo).
5. Role até o fim da página, até a área tracejada "Drag and drop your project folder here", e arraste a pasta **controle-de-horas** para lá. Não arraste o ZIP.
6. Espere o deploy ficar **Published**.
7. Abra o site e aperte **Ctrl + Shift + R** para carregar a versão nova.
8. No celular, feche o app instalado e abra de novo (ou recarregue a página no Chrome).

Aviso importante: arrastar a pasta na página `app.netlify.com/drop` cria um projeto NOVO, com endereço e dados vazios.
Para manter o mesmo endereço e os dados, use sempre a página **Deploys** do projeto existente.

Se os dados do sistema estão no navegador (modo local), eles não se perdem ao atualizar o mesmo site.

### Links de acesso (manter atualizado)

- ZIP da versão mais recente (branch `claude/blissful-einstein-hb4333`):
  https://github.com/marcospaulo869/ta-na-mao/archive/refs/heads/claude/blissful-einstein-hb4333.zip
- Painel do Netlify: https://app.netlify.com/
- Site em uso (confirmado pelo usuário em 20/10/2026): https://controlehorasmf.netlify.app
  - Painel de deploys: https://app.netlify.com/projects/controlehorasmf/deploys
  - Existe também o projeto `admirable-llama-f2b59f` (criado por engano, ignorar): https://admirable-llama-f2b59f.netlify.app
- Prévia no Claude (versão reduzida, só no navegador do dono): https://claude.ai/artifact/PtQZZ9BecJ9wf6kr5XuNiF
- Repositório: https://github.com/marcospaulo869/ta-na-mao (login do GitHub é pelo Google, e-mail do usuário)

### Fluxo de trabalho

- Desenvolver na branch `claude/blissful-einstein-hb4333`; commit e push a cada entrega.
- Antes de entregar, testar no navegador de teste (Playwright) os cálculos e o layout no tamanho de celular.
- Os dados do usuário ficam no navegador dele (modo local) até a nuvem (Supabase) ser ligada; não há como o Claude acessá-los.
- Atualizar este arquivo quando mudarem os links ou o passo a passo.
