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

## Fechamento semanal e pagamentos

- Aba **Pagar**: resumo da semana (dias, horas, extras, vales, valor a pagar), botão para enviar o resumo
  pelo WhatsApp (abre a conversa com o texto pronto), copiar e imprimir.
- Na **sexta-feira depois das 18h**, e nos dias seguintes enquanto a semana não tiver pagamento registrado,
  aparece um aviso no topo do sistema.
- **Registrar pagamento**: data, valor, forma, observação e comprovante (foto, print ou PDF).
  O histórico fica por colaborador. No modo nuvem o comprovante vai para uma pasta privada (rode de novo o
  `supabase.sql`, que cria a pasta `comprovantes`).
- O envio **automático** do WhatsApp às 18h exige servidor e um serviço de WhatsApp pago; fica para a fase da nuvem.

## Nuvem ligada (Supabase)

- `config.js` já aponta para o projeto `controle_horas` (URL e chave pública/publishable; essa chave pode ficar no site).
- Rode o `supabase.sql` inteiro no **SQL Editor** do Supabase (pode rodar de novo a cada atualização, ele não apaga dados).
- A biblioteca do Supabase está em `supabase.min.js` (cópia local, sem depender de CDN).
- Ponto pelo celular: o colaborador toca em "Registrar"; o servidor grava a hora, lê o IP e confere o GPS
  contra os locais cadastrados. Registro fora do local fica **pendente** até o administrador aprovar (aba Ponto).

## Cadastro completo e privacidade

- Ficha com foto (selfie), CPF (com validação), RG, nascimento, PIS, CTPS, contato, endereço (busca por CEP),
  Pix e banco, e documentos anexados (pasta privada `documentos`).
- O colaborador vê o próprio perfil, tira a selfie e atualiza telefone, contato de emergência e endereço.
  Ele **não** vê CPF inteiro, RG, Pix, banco nem documentos, e **não** altera Pix, CPF ou valores.
- Aviso de privacidade (LGPD) em linguagem simples: no login, no primeiro acesso do colaborador (com aceite registrado
  com data e hora), na tela dele e em Ajustes. O texto é um **modelo** e deve ser revisado por advogado ou contador.
- Dados da empresa (nome, CNPJ, responsável, e-mail) em Ajustes alimentam o aviso.
