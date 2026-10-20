# Controle de Horas

Aplicativo web (instalável no celular) para controle de horas de colaboradores CLT e diaristas.

## Como funciona

- **Administrador** (empresa): entra com e-mail e senha, cadastra os colaboradores (nome, função, regime,
  salário ou valor da hora, dias liberados) e acompanha a folha do mês, com totais por semana e do mês.
- **Colaborador**: recebe um link, abre no celular, instala na tela inicial e registra entrada e saída
  da manhã e da tarde. Ele só vê os próprios dados e só registra o dia de hoje. Correções de dias
  anteriores são feitas pelo administrador.

## Modos

- **Modo local** (padrão, `config.js` vazio): os dados ficam só no navegador. Bom para testar sozinho.
- **Modo nuvem** (Supabase): login do administrador, dados salvos no servidor e link do colaborador
  funcionando em qualquer celular.

## Ligar a nuvem (Supabase, plano gratuito)

1. Crie uma conta em supabase.com e um projeto novo (região São Paulo, se houver).
2. No projeto, abra **SQL Editor > New query**, cole todo o conteúdo de `supabase.sql` e clique em **Run**.
3. Em **Authentication > URL Configuration**, coloque o endereço do site (ex.: `https://controlehoras.netlify.app`)
   em **Site URL**.
4. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public**.
5. Cole os dois valores em `config.js` e publique a pasta de novo no Netlify.

A chave `anon public` pode ficar no site: quem protege os dados são as regras de acesso criadas pelo `supabase.sql`.
Nunca coloque a chave `service_role` no site.

## Arquivos

- `index.html`: o aplicativo inteiro.
- `config.js`: liga ou desliga a nuvem.
- `supabase.sql`: tabelas, regras de acesso e funções do link do colaborador.
- `manifest.webmanifest`, `sw.js`, ícones: instalação no celular e funcionamento offline do app.
