# App de Orçamento e Recibo: onde paramos

Este arquivo guarda o resumo da conversa com o Claude para retomarmos depois.
Para continuar, peça ao Claude: "leia a pasta orcamento do ta-na-mao e vamos retomar de onde paramos".

## Panorama (05/10/2026, noite)

### Onde o app está
- **Link próprio (o do celular):** https://marcospaulo869.github.io/ta-na-mao/orcamento/ . Aqui funcionam o "Segure e fale", a digital e o envio do PDF anexado. Os dados ficam só no aparelho em que foram feitos.
- **Link no Claude:** https://claude.ai/artifact/7yzK28BqRJmSpzt61nXdLG . Os dados ficam na sua conta do Claude (usado no notebook), mas ali o microfone e a digital são bloqueados.
- **Código:** `orcamento/index.html` no GitHub (`marcospaulo869/ta-na-mao`, branch `claude/project-thread-o7weyg`, PR #1 aberto e ainda não juntado na branch principal).

### O que já está pronto
1. **Entrada:** tela de boas-vindas com o selo da Madeira Forte e reflexo de luz; cadastro completo da empresa (CPF/CNPJ, IE, Instagram, endereço, logomarca, assinatura); senha com olhinho; entrar com a digital; apagar tudo e recomeçar.
2. **Orçamento:** botão "COMPRAR FORA" (06/10/2026): itens com letras e números em verde (o fundo fica igual ao resto da página, sem vermelho) e soma própria; os totais mostram Subtotal (itens normais + mão de obra − desconto), Comprar fora e VALOR TOTAL (a soma dos dois), na tela e no PDF, onde os itens vão numa tabela separada igual à dos materiais, só com as letras em verde; os botões "+ Adicionar material", "COMPRAR FORA" e "Segure e dite" ficam presos logo acima da barra do Total enquanto a lista de materiais está na tela (06/10/2026; no celular ficam lado a lado numa linha); "+ Inserir item entre X e Y" virou um botão em destaque no meio da linha tracejada; cliente com endereço em campos e botões de copiar; validade em dias úteis; materiais com sugestões da aba Materiais; nome do material em MAIÚSCULAS com acentos automáticos; unidade (Un.) com lista para escolher num toque (UN, PAR, CX, CH, M, M², JG, KIT, PCT, RL, BR, TB, LT, GL, L, KG e "Outra" para digitar), sempre em MAIÚSCULAS, também na aba Materiais e no PDF (06/10/2026); ditado "Segure e fale"; inserir e reordenar itens; mão de obra automática igual ao valor total da compra dos materiais, incluindo os de Comprar fora (materiais × 1; regra do Marcos de 06/10/2026). Digitar outro valor deixa a mão de obra fixa, e o botão "Igualar ao valor dos materiais" (ou apagar o campo) volta ao automático; desconto em %; pré-contrato; assinatura do cliente.
3. **Recibo:** valor por extenso; tipo (total, entrada, parcela, saldo); forma de pagamento; assinaturas; gerar a partir de um orçamento com o saldo que falta.
4. **PDF:** cabeçalho com logomarca e dados; QR Code (WhatsApp, Instagram ou "Orçamento com valor estimado", que abre o link de autoatendimento colado em Meus dados) com o selo dourado no meio; estilo preto e dourado ou verde; assinaturas em azul BIC.
5. **Envio:** tela de compartilhar do celular com o PDF anexado (botão verde "Enviar o PDF"); no notebook, salva o PDF e abre a conversa no WhatsApp. Se o telefone do cliente (ou de quem pagou, no recibo) for igual ao seu de Meus dados, o app avisa embaixo do campo e, na hora de enviar, não mostra "Abrir WhatsApp de ..." (abriria a conversa com você mesmo; caso da Fabiana em 06/10/2026).
6. **Facilidades:** o que está na tela fica guardado ao atualizar a página, ao tocar em Sair ou se o app fechar, e a tela inicial mostra "Continuar" para o orçamento ou recibo que ficou pela metade (o cadastro também se guarda, menos a senha); item novo aparece no meio da tela; tocar num campo seleciona o que já está nele; listas de salvos; aba Materiais com os preços. **Pensado para o celular** (06/10/2026: 90% ou mais do uso é no celular): todos os botões têm área de toque de pelo menos 44 px (o tamanho da ponta do dedo); a barra de baixo mostra o Total, Salvar e Enviar PDF maiores numa linha só; as abas, o "‹ Início" e as setas ↑ ↓ e o × de cada item ficaram maiores; a etiqueta "COMPRAR FORA ✕" fica ao lado do número do item.

### Testes com outras pessoas (06/10/2026)
- Quem testa abre o link próprio no celular, instala na tela inicial e faz o cadastro com a própria empresa. Os dados ficam só no aparelho de cada um.
- A tela inicial tem o botão verde **Mandar sugestão**, que abre o WhatsApp do Marcos com uma mensagem pronta (diz se é celular ou computador e o tamanho da tela). Para o próprio Marcos o botão não aparece.
- O link do autoatendimento da Madeira Forte só vem preenchido no QR Code quando o nome da empresa é Madeira Forte; quem testa coloca o próprio link.

### O que falta para terminar a validação
- Em Meus dados, escolher no QR Code a opção "Orçamento com valor estimado" (criada em 06/10/2026). O link do autoatendimento, https://orcamento.madeiraforteplanejados.com.br, já vem preenchido e pode ser trocado. Antes de vender, tirar esse link padrão para cada comprador colocar o seu.
- Testar no celular: "Segure e fale", digital, botão "Enviar o PDF" e ler o QR Code com outro celular.
- No celular: colocar a logomarca, escolher preto e dourado e corrigir o campo IE (saiu o e-mail nele).
- Revisar o texto padrão do pré-contrato (forma de pagamento, prazo e garantia).
- Celular e notebook não se enxergam: escolher um aparelho principal ou fazermos a cópia de segurança (exportar e importar).
- Atualizar a cópia da pasta do PC (Documentos\ta-na-mao\orcamento), que está antiga.
- Juntar o PR #1 na branch principal quando você estiver satisfeito.

### O que falta para vender
- Contas no servidor: login de verdade, recuperar senha por e-mail e os mesmos dados no celular e no notebook (o backend do ta-na-mao já tem cadastro e planos).
- Cobrança dos planos (Stripe, que o ta-na-mao já usa).
- PDF gerado no servidor, com o selo travado de verdade.
- Termos de uso e política de privacidade (LGPD).
- Publicar na Play Store.
- Opcional: envio automático pelo WhatsApp (API oficial do WhatsApp Business, paga) e importar a lista de preços do fornecedor por planilha.

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
O botão "Enviar PDF" salva o orçamento e leva o PDF ao WhatsApp (veja a atualização de 04/10).

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

## Atualização (04/10/2026, manhã): Enviar PDF pelo WhatsApp e link próprio

- **Enviar PDF:** cada orçamento salvo tem o botão verde **Enviar PDF** (e cada recibo, **Enviar recibo**). O botão laranja da barra de baixo agora também se chama **Enviar PDF** / **Enviar recibo**.
  - No navegador do celular (Chrome), abre a tela de compartilhar já com o PDF anexado: escolha o WhatsApp e o contato.
  - Dentro do app do Claude (ou no computador), o app salva o PDF e mostra o botão **Abrir WhatsApp de (cliente)**, que abre a conversa com o número do cliente e a mensagem pronta. Lá você toca no clipe, em Documento, e escolhe o PDF.
- **Abas fixas:** as abas Orçamento / Salvos e Recibo / Salvos ficam presas no topo ao rolar a tela.
- **Link próprio (Chrome / Edge):** o app também pode abrir como site pelo GitHub Pages, em https://marcospaulo869.github.io/ta-na-mao/orcamento/ (depois de ativar em Configurações → Pages do repositório, branch `claude/project-thread-o7weyg`, pasta raiz). Ali o microfone do ditado e o compartilhar com o PDF anexado funcionam direto. No Chrome, "Adicionar à tela inicial" cria um ícone como se fosse um app.
  - Os dados do site ficam guardados no navegador do celular, separados dos dados do app no Claude. Por isso o cadastro é feito de novo lá. Limpar os dados do navegador apaga os orçamentos desse site.

## Atualização (04/10/2026, 9h30): botão Novo em destaque

- O botão **+ Novo orçamento** agora é grande, ocupa a largura toda e fica no topo da tela do orçamento e da lista de Salvos (azul-petróleo). No recibo, **+ Novo recibo** (laranja), também no topo do recibo e da lista.
- Se o orçamento ou recibo atual ainda não foi salvo, o primeiro toque avisa "Toque de novo: o atual não foi salvo", para não perder o que foi digitado.

## Atualização (04/10/2026, 11h40): selo no centro do QR Code e logomarca na cor das letras

Marcos pediu uma marca discreta (o app vai ser vendido), então a marca d'água grande no fundo das páginas foi tirada. No lugar, o selo Madeira Forte ficou dentro do QR Code (versão final na atualização das 12h30) e a logomarca do cliente pode sair em silhueta na cor das letras (opção "mono" em Meus dados).
- Corrigido: cidade repetida no cabeçalho do PDF quando "Rua e número" ficava em branco.

## Atualização (04/10/2026, 11h50): estilo preto e dourado

Marcos achou o azul-petróleo desalinhado com a página e com a logomarca dourada, e pediu uma versão em preto e dourado.
- Em **Meus dados → "Cores do app e do PDF"** há três estilos: **Preto e dourado** (logomarca nas cores originais), **Azul-petróleo com logomarca em silhueta** e **Azul-petróleo com logomarca original**. A troca aparece na hora; é guardada ao tocar em "Salvar meus dados".
- **Preto e dourado no PDF:** título e linhas em dourado escuro, cabeçalho da tabela preto com letras douradas, linhas e fundos num tom areia, textos em quase preto.
- **Preto e dourado no app:** papel claro quente com botões pretos e letras douradas; no modo escuro, fundo preto-quente com dourado vivo nos botões e destaques. O botão verde do WhatsApp continua verde.
- O azul-petróleo continua disponível, e é o padrão para quem comprar o app.

## Atualização (04/10/2026, 12h30): selo dourado fixo no QR e plano para a versão vendida

Marcos aprovou o estilo preto e dourado e decidiu:
- **Versão vendida:** o cabeçalho do PDF (nome da empresa, dados e logomarca) é todo editável por quem comprar, em Meus dados. Isso já funciona assim.
- **QR Code:** continua levando os dados de quem comprou (WhatsApp ou Instagram dele).
- **Selo da Madeira Forte fixo no QR:** dourado e quase transparente no centro, em todo PDF, sem opção para o cliente tirar. No PDF, o QR ficou um pouco maior (21 mm) e abre um espaço limpo no meio para o selo (opacidade 55%, 24% da largura do QR).
- Limite honesto: o selo está dentro do próprio arquivo do app. Quem tiver o arquivo pode editá-lo. Na versão de venda (loja de aplicativos ou servidor), o PDF e o selo devem ser gerados pelo servidor, aí o selo fica realmente travado.
- Teste com leitor automático: o QR continua lendo o WhatsApp. Falta o teste no celular de verdade (apontar a câmera para o PDF de exemplo).

## Atualização (04/10/2026, 15h30): maiúsculas automáticas

Pedido do Marcos: as palavras iniciais começarem com maiúscula nos campos do orçamento e do recibo, mesmo com o caps lock ligado, e correção de digitação.
- **Nomes (cliente e quem pagou) e endereço da obra:** cada palavra com inicial maiúscula, "da/de/do/dos/das/e" em minúscula (ex.: "JOÃO DA SILVA" vira "João da Silva"). No endereço a sigla do estado no fim fica em maiúsculas ("... - SP"). Nomes com maiúscula no meio ("McDonald", "iFood") não são mexidos.
- **Material e "Referente a":** só a primeira letra da frase em maiúscula. Se vier tudo em caps lock, o app passa para minúsculas e preserva siglas (MDF, MDP, PVC, LED, TX...). Medidas como "18MM" viram "18mm". No texto do recibo ("referente a ...") a primeira palavra volta para minúscula no meio da frase.
- **Quando corrige:** ao sair do campo e também ao salvar ou enviar. A correção não acontece enquanto digita, para não mexer no cursor (problema que já tivemos no celular).
- **Teclado do celular:** os campos pedem maiúscula automática ao teclado (nomes: cada palavra; textos: início da frase) e ligam a correção ortográfica do próprio celular.
- Limite: o app não tem dicionário próprio de português. A correção de erros de digitação é a do teclado do celular (ou o sublinhado do Chrome no notebook).

## Atualização (04/10/2026, 16h): campo de e-mail que cabe tudo

Pedido do Marcos: o campo de e-mail mostrar a informação inteira.
- O campo de **e-mail** (cliente no orçamento, quem pagou no recibo e Meus dados / cadastro) agora ocupa a **linha inteira**.
- Se o e-mail ainda for maior que o campo, a **letra diminui sozinha** até caber tudo (até 12 px no mínimo). Num celular de 360 px, um e-mail de uns 35 caracteres cabe com letra de uns 13 px. Acima de uns 45 caracteres no celular, o texto rola dentro do campo.
- Se quiser o mesmo ajuste em nome ou endereço, é só pedir.

## Atualização (04/10/2026, 16h30): endereço completo, botões de copiar e validade em dias úteis

Pedidos do Marcos: um endereço completo com botão de copiar (para nota fiscal ou pré-contrato) e as datas do orçamento novo se ajustando sozinhas.
- **Endereço da obra** agora tem campos separados: CEP, número, rua ou avenida, complemento, bairro, cidade e UF. Logo abaixo aparece o **Endereço completo** montado sozinho, por exemplo: "Rua das Flores, 120, Apto 32 - Centro, Passo de Torres - SC, CEP 88980-000". Isso também vai no PDF.
- O CEP ganha o traço sozinho ("88980000" vira "88980-000"), a UF fica em maiúsculas e rua, bairro e cidade recebem as maiúsculas automáticas.
- Botões: **Copiar endereço** (só a linha do endereço) e **Copiar dados do cliente** (nome, CPF/CNPJ, telefone, e-mail e endereço, um por linha). Em Meus dados: **Copiar dados da empresa**.
- Se o navegador não deixar copiar, o texto fica selecionado na tela para copiar pelo menu.
- Orçamentos antigos: o endereço que estava em um campo só vai para "Rua ou avenida", nada se perde.
- Pré-contrato: além de {CLIENTE}, {TOTAL}, {VALIDADE} e {EMPRESA}, agora aceita **{DOCUMENTO}** (CPF/CNPJ do cliente) e **{ENDERECO}** (endereço completo). O texto padrão para cadastros novos já usa os dois no item 1. O texto que você já salvou em Meus dados não foi alterado; se quiser, coloque {DOCUMENTO} e {ENDERECO} nele.
- **Datas automáticas:** todo orçamento novo abre com a data de hoje e validade de **10 dias úteis** (segunda a sexta, sem contar feriados nacionais e a Sexta-feira Santa). Feriados da cidade ou do estado não entram na conta. Se trocar a data inicial, a validade anda junto. Em Meus dados → Preferências, o campo agora é "Validade padrão (dias úteis)"; quem tinha 15 (o padrão antigo) passou para 10.

## Atualização (04/10/2026, 17h): memória de materiais e aba Materiais

Pedidos do Marcos: (1) ao digitar um material (ex.: "chapa MDF branco"), abrir sozinha uma janela com o que já foi usado e, com um toque, preencher tudo; (2) um "banco de dados" separado, ao lado de Orçamento e Salvos, para atualizar nomes e preços (MDFs que saem de linha, preços que mudam na planilha do fornecedor).
- **Sugestões ao digitar:** no campo Material, a partir de 2 letras aparece a janela "Da sua memória" com até 6 materiais. Pode digitar só o começo das palavras, em qualquer ordem e sem acento ("mdf br" acha "Chapa MDF branco TX 18 mm"). Um toque preenche material, unidade e preço e o cursor vai para a quantidade. No notebook também dá para usar as setas e o Enter (Tab fecha a janela e vai para Un.). A janela fica logo abaixo do campo e empurra Un./Qtd./Preço para baixo, sem cobrir nada. Se o material não tiver preço na lista, o preço fica vazio e o cursor vai para ele.
- **Aba Materiais** (Orçamento | Salvos | Materiais): a lista completa em ordem alfabética, com busca. Dá para mudar nome, unidade e preço de cada material, criar um material novo ("+ Novo material") e apagar (dois toques). Mostra em quantos orçamentos cada um foi usado e a data do último uso.
- **Como a lista se enche:** ao salvar um orçamento, os materiais novos entram na lista. A lista manda: salvar um orçamento não muda nome nem preço de um material que já está nela (só completa unidade ou preço se estiverem vazios). Preço novo, você muda na aba Materiais. Orçamentos já salvos não mudam.
- Materiais apagados ou renomeados na lista não voltam sozinhos quando você salva de novo um orçamento antigo ou faz uma cópia dele.
- Na primeira vez que o app abre com essa versão, a lista é montada com os materiais dos orçamentos que você já tinha salvo.
- "18mm" e "18 mm", "2,75x1,85" e "2,75 x 1,85", "m2" e "m²" contam como o mesmo material (não criam repetidos). Preços da lista ficam sempre em centavos (1,255 vira 1,26). A lista guarda até 500 materiais; passou disso, saem os que estão há mais tempo sem uso.
- A lista fica na sua conta: é a mesma no celular e no notebook. O app busca a versão mais nova ao abrir um orçamento, ao tocar no campo Material e ao abrir a aba Materiais. Se a internet falhar, nenhuma mudança grava por cima da lista guardada: ela fica esperando e é guardada na próxima vez. "Apagar tudo e recomeçar" também apaga a lista.
- Antes de publicar, a versão passou por uma revisão com cinco revisores (celular, dados entre aparelhos, aba Materiais, integração e busca); os problemas encontrados foram corrigidos e conferidos com os próprios testes deles.

## Atualização (04/10/2026, 17h30): Orçamento e Recibo abrem na lista

Pedido do Marcos: ao tocar em Orçamento na tela inicial, ver o botão "+ Novo orçamento" e, logo abaixo, todos os orçamentos já salvos, em vez de cair direto no formulário.
- **Orçamento** (tela inicial) abre a aba Salvos: "+ Novo orçamento" em cima e a lista "Orçamentos salvos (N)" embaixo, do mais novo para o mais antigo. "Abrir" leva ao formulário daquele orçamento.
- **Recibo** ficou igual: "+ Novo recibo" em cima e "Recibos salvos" embaixo.
- A aba "Orçamento" lá em cima continua levando ao formulário (por exemplo, para voltar a um orçamento que ainda não foi salvo).

## Atualização (04/10/2026, 21h): microfone como no WhatsApp

Marcos disse que o botão "Ditar" não ouvia nada (nem com um toque, nem segurando) e pediu o jeito do WhatsApp.
- **Segure e fale**: segure o botão do microfone enquanto fala; ao soltar, o item é preenchido (material, unidade, quantidade, valor). Arrastar o dedo para longe do botão cancela. Toque rápido mostra o aviso "Segure o botão enquanto fala".
- **Por que não ouvia**: dentro do link do Claude a página não recebe permissão para usar o microfone (não existe essa permissão para apps publicados lá). O app agora detecta isso: o botão vira "Ditar", um toque abre o campo já com o teclado e a mensagem "O microfone do app está bloqueado aqui. Toque no 🎤 do teclado e fale. Depois toque em Preencher." No notebook com Windows a dica é "Windows + H".
- O "segurar e falar" de verdade funciona onde o navegador libera o microfone: o app aberto como site próprio ou a futura versão da Play Store.

## Atualização (04/10/2026, 23h): ditado dentro do Claude

- No notebook (app do Claude), o app mostrou "Ditar" e a caixa com "Windows + H": a página não recebe o microfone ali. Dentro do Claude, o jeito que funciona é o microfone do teclado (celular: 🎤 do teclado; notebook: Windows + H) e depois "Preencher".
- A caixa agora mostra, em letra pequena, o motivo do bloqueio ("Motivo: ...").
- Corrigido: o total do item saía do painel na tela larga (versão 20); o toque no Ditar às vezes caía em outro botão logo depois de a caixa abrir (versão 21).
- Em aberto: escolher entre ficar no Claude (recomendado enquanto valida) ou abrir um link próprio (GitHub Pages), onde o "Segure e fale" funciona no Chrome, mas os dados ficam só no aparelho.

## Atualização (05/10/2026): link próprio no celular e ajustes do dia

- **Link próprio ligado** (GitHub Pages). Cada vez que o app muda, ele se atualiza sozinho em cerca de 1 minuto.
- **Tela inicial:** selo da Madeira Forte acima do título, com um reflexo de luz passando (testamos no canto e voltamos para cima).
- **Material em MAIÚSCULAS** com acentos e erros comuns corrigidos ao sair do campo ("dobradica" vira DOBRADIÇA).
- **Rascunho:** atualizar a página não apaga mais os itens; o app volta na mesma tela.
- **Digital** para entrar (ativa em Meus dados) e **olhinho** para ver a senha. A senha continua valendo.
- **Tocar num campo** seleciona o que já está nele; tocar de novo põe o cursor no lugar.
- **Desconto em %** sobre materiais + mão de obra.
- **Assinaturas em azul BIC**, inclusive as antigas.
- **Envio do PDF:** o WhatsApp não deixa site nenhum anexar arquivo direto na conversa; o PDF só vai pela tela de compartilhar do celular. Quando ela não abre sozinha, aparece o botão verde "Enviar o PDF".

## Próximos passos

Veja "O que falta" no Panorama, no começo deste arquivo.
