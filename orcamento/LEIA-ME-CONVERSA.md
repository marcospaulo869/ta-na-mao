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

## Próximos passos (a combinar)

- Você testar o app e dizer o que ajustar.
- Fazer a parte de **recibo**, que ainda não foi feita.
- Revisar o texto padrão do pré-contrato (forma de pagamento, prazo e garantia).
