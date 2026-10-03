# App de Orçamento e Recibo: onde paramos

Este arquivo guarda o resumo da conversa com o Claude para retomarmos depois.
Para continuar, peça ao Claude: "leia a pasta orcamento do ta-na-mao e vamos retomar de onde paramos".

## O que você pediu (03/10/2026)

> Quero criar um app em que eu consiga gerar um orçamento de materiais, com quantidades e preços, e enviar para o cliente. Tem que ter data inicial e data de validade, tem que salvar em PDF, tem que ter assinatura no final e uma página "Obs" para já inserir o pré-contrato e enviar junto com o orçamento.

## O que decidimos

- O app é **separado**. Ele não mexe no app de medição do ta-na-mao, só fica guardado nesta pasta.
- Vamos ajustando ao longo da criação.

## O que já está pronto

- **App online:** https://claude.ai/artifact/7yzK28BqRJmSpzt61nXdLG
- **Código:** `orcamento/index.html`, um arquivo só. Ele também abre direto no navegador do computador (precisa de internet para carregar o gerador de PDF).
- **No GitHub:** repositório `marcospaulo869/ta-na-mao`, branch `claude/project-thread-o7weyg`.
- **Exemplo de PDF:** `exemplo-orcamento-0001.pdf`, nesta pasta.

### Telas
1. **Orçamento:** cliente (nome, CPF/CNPJ, telefone, e-mail, endereço da obra), data inicial, válido até, materiais (descrição, unidade, quantidade, preço unitário e total), mão de obra, desconto e total. Tem também o texto Obs/pré-contrato e a assinatura do cliente, que é opcional e feita no celular.
2. **Salvos:** lista dos orçamentos com selo de válido ou vencido. Dá para abrir, duplicar ou excluir.
3. **Meus dados:** nome ou empresa, CPF/CNPJ, telefone, e-mail, endereço, logo, sua assinatura (desenhada uma vez), validade padrão em dias, próximo número e texto padrão do pré-contrato.

### PDF
- **Página 1:** seus dados e logo, "ORÇAMENTO Nº 0001", cliente, data inicial, validade, tabela de materiais e totais.
- **Última página:** "Observações e pré-contrato", local e data, e as assinaturas do prestador e do cliente.
- No texto do pré-contrato, os campos {CLIENTE}, {TOTAL}, {VALIDADE} e {EMPRESA} são trocados automaticamente pelos dados do orçamento.

### Envio
O botão "Gerar PDF" salva o orçamento, baixa o PDF e mostra uma mensagem pronta para colar no WhatsApp ou no e-mail.

## Atualização (03/10/2026, à tarde): cadastro e senha

Você disse que quer **vender o app depois**, então:
- **Primeiro acesso:** abre a tela de cadastro com seu nome, nome da empresa, CPF/CNPJ, inscrição estadual, profissão ou ramo, telefone/WhatsApp, e-mail, Instagram, CEP, rua e número, bairro, cidade, UF e logomarca. Nessa mesma tela você cria a senha (mínimo de 6 caracteres, digitada duas vezes).
- **Próximos acessos:** tela "Entrar" com a logomarca, o nome da empresa e o campo de senha. Tem também um botão "Sair" e, em Meus dados, a opção "Trocar senha".
- **QR Code:** aparece no topo do PDF, ao lado dos seus dados, e abre o seu WhatsApp ou o seu Instagram (você escolhe). Também dá para tirar.
- **Limite atual:** a senha protege o app neste navegador, mas ainda não é uma conta de verdade num servidor. Para vender, cada cliente precisa de uma conta própria, com recuperação de senha por e-mail e cobrança. O backend do ta-na-mao já tem cadastro com senha, planos e pagamento pelo Stripe, e pode servir de base para isso.
- Sua última mensagem terminou em "E logo abaixo...". Falta você dizer o que vai abaixo dos dados.

## Atualização (03/10/2026, noite): um app com duas funções

Decidimos fazer **um app só**, com Orçamento e Recibo juntos (mesmo cadastro, logomarca e senha; o recibo nasce do orçamento).
- **Tela inicial:** foto real de um profissional (imagens do próprio ta-na-mao, em `img/`), uma chamada que passa confiança e dois botões grandes, **Orçamento** (azul-petróleo, para passar confiança) e **Recibo** (laranja, para chamar a ação). Embaixo aparecem os números: orçamentos feitos, recebido no mês e quanto falta receber.
- **Recibo:** data, tipo (total, entrada, parcela ou saldo), quem pagou, valor com **valor por extenso** automático, forma de pagamento (Pix, dinheiro, cartão etc.), "referente a" e as assinaturas na tela de quem recebeu e de quem pagou. O PDF tem o texto "Recebi(emos) de..." e a quitação.
- **Gerar recibo** a partir de um orçamento salvo: preenche o cliente e o valor. Se já houver pagamentos, sugere o saldo e mostra no PDF o total, o que já foi recebido e o que falta.
- O cabeçalho do app mostra sua logomarca e o nome da empresa (ao tocar, volta para o início).

## Atualização (03/10/2026, noite): ditado por voz e inserir itens

- **Ditar item:** cada item da tabela tem o botão **Ditar** (microfone). Você fala, por exemplo, "MDF chapa branco TX 18 milímetros, quatro unidades, valor 289,90", e o app separa material, unidade, quantidade e preço sozinho. Também há o botão **Ditar novo item**, que cria a linha e já abre o ditado.
- Onde o navegador não deixa o app usar o microfone (como dentro da página do Claude), aparece uma caixa: você toca no microfone do teclado do celular, fala e toca em **Preencher**. O resultado é o mesmo.
- Palavras que o app entende como unidade: chapa, unidade/peça, metro, metro quadrado, par, caixa, rolo, barra, litro, quilo, pacote, jogo, kit, lata, galão, tubo. "Milímetros" e "centímetros" viram mm e cm na descrição. O valor pode ser dito como "valor 289,90", "R$ 42" ou "18 reais e 50 centavos".
- **Inserir entre itens:** entre duas linhas aparece "+ Inserir item entre 1 e 2". Cada item também tem as setas ↑ ↓ para mudar a ordem.

## Atualização (03/10/2026, noite): boas-vindas e recomeçar

- **Ordem das telas:** 1) **Boas-vindas** (foto da moça com o celular, chamada "Feche mais serviços com orçamentos que passam confiança", três vantagens, "Como funciona" em 3 passos e o botão laranja **Começar cadastro**); 2) **Cadastro** (dados, logomarca e senha, com "‹ Voltar"); 3) **Página inicial** com os botões Orçamento e Recibo. Nas próximas vezes, abre direto em **Entrar** (senha).
- **Recomeçar do zero:** em Meus dados, "Apagar tudo e recomeçar". Na tela Entrar, "Esqueci minha senha → Apagar tudo e cadastrar de novo". Os dois pedem dois toques. Serve para simular o primeiro acesso de um cliente que comprou o app.

## Decisão (03/10/2026, 22h): validar antes de vender

Marcos vai usar o app no dia a dia com os dados reais da empresa e a logomarca, para validar e anotar ajustes. Só depois de validado é que vamos montar a estrutura para vender (Play Store ou venda online), com contas no servidor, recuperação de senha e cobrança.

## Próximos passos (a combinar)

- Você testar o app e dizer o que ajustar.
- Ajustes de dentro do Orçamento e do Recibo que você for pedindo.
- Para vender: contas de verdade no servidor (o backend do ta-na-mao já tem cadastro, planos e Stripe).
- Revisar o texto padrão do pré-contrato (forma de pagamento, prazo e garantia).
