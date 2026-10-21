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

### Como o site é atualizado (Cloudflare Pages, automático)

O site está no **Cloudflare Pages**, ligado ao repositório do GitHub: toda vez que o Claude envia (push) código para a branch `claude/blissful-einstein-hb4333`, o Cloudflare publica a pasta `controle-de-horas` sozinho, em cerca de 1 a 2 minutos. **O usuário não baixa ZIP nem arrasta pasta.**

Passo a passo que o usuário faz depois de uma atualização:

1. Esperar cerca de 2 minutos depois do aviso do Claude.
2. Abrir o site (link abaixo) e apertar **Ctrl + Shift + R**.
3. Em **Ajustes → Sobre**, conferir o número da versão (o Claude diz qual deve aparecer).
4. No celular, fechar o app instalado e abrir de novo.

Se a versão não mudar depois de uns 5 minutos, abrir o painel do Cloudflare (link abaixo), projeto `controle-horas-mf`, aba **Implantações**, e ver se a última está com **Sucesso**.

Quando a atualização mexer no banco, avisar para rodar o `supabase.sql` inteiro (veja a seção abaixo): Supabase > SQL Editor > New query > colar > Run. Esse passo continua manual.

Atenção: nunca mais usar as áreas de "arrastar pasta" do Netlify. O Netlify (créditos limitados) fica só como cópia antiga.

### Links de acesso (manter atualizado)

- **Site em uso (Cloudflare Pages, desde 21/10/2026):** https://controle-horas-mf.pages.dev
- Painel do Cloudflare: https://dash.cloudflare.com (projeto `controle-horas-mf`, em Calcular > Trabalhadores e Páginas)
- ZIP da versão mais recente (só para pegar o `supabase.sql`; branch `claude/blissful-einstein-hb4333`):
  https://github.com/marcospaulo869/ta-na-mao/archive/refs/heads/claude/blissful-einstein-hb4333.zip
- Netlify (antigo, pode ser apagado): `beamish-bavarois-228a5e`, `admirable-llama-f2b59f`, `controlehorasmf`, `sparkly-creponne-67ec9b`. O link do colaborador é gerado com o endereço do site em que o administrador está: gerar sempre a partir do site novo.
- Prévia no Claude (versão reduzida, só no navegador do dono): https://claude.ai/artifact/PtQZZ9BecJ9wf6kr5XuNiF
- Supabase (nuvem): projeto `controle_horas`, URL https://egbkmsauwwtvonngemcn.supabase.co, painel https://supabase.com/dashboard (conta do usuário, entrada pelo GitHub). O outro projeto do mesmo painel (`kyam382@gmail.com's Project`) é de outro sistema (orçamentos, tabelas com RLS desligado): não mexer.
- Repositório: https://github.com/marcospaulo869/ta-na-mao (login do GitHub é pelo Google, e-mail do usuário)

### Ao atualizar o banco (supabase.sql)

Sempre dizer ao usuário para rodar o `supabase.sql` inteiro de novo: Supabase > SQL Editor > New query > colar > Run.
O script é reexecutável. Testar mudanças no SQL num Postgres local antes de entregar.

### Pendências combinadas (21/10/2026)

1. **Proteger o outro projeto do Supabase** (orçamento online): roteiro em `seguranca/proteger-outro-banco.sql`. Fazer um passo de cada vez com o usuário: (0) rodar as consultas só de leitura, (1) perguntar como o site de autoatendimento usa o banco, (2) ligar a proteção, (3) testar o site e, se quebrar, desfazer.
2. ~~Atualização automática do site~~: **feita em 21/10/2026** (Cloudflare Pages). Pendente: apagar os sites antigos do Netlify quando o usuário quiser.

### Fluxo de trabalho

- Desenvolver na branch `claude/blissful-einstein-hb4333`; commit e push a cada entrega.
- Antes de entregar, testar no navegador de teste (Playwright) os cálculos e o layout no tamanho de celular.
- Os dados do usuário ficam no navegador dele (modo local) até a nuvem (Supabase) ser ligada; não há como o Claude acessá-los.
- Atualizar este arquivo quando mudarem os links ou o passo a passo.
