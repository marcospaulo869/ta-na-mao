# TUDO MAIS FÁCIL — Plano de Blindagem contra Cópia

> **Confidencial. Uso interno do fundador.**
> _Versão 1.0 · Fev/2026_

## 🎯 Objetivo

Impedir que qualquer pessoa, empresa ou concorrente **copie, replique ou se aproveite** da tecnologia, marca, método e conjunto da obra do TUDO MAIS FÁCIL nos próximos 5 anos.

**Regra de ouro:** proteção é _camada sobre camada_. Nenhum item sozinho salva — todos juntos criam uma parede.

---

## 🏛️ CAMADA 1 — Proteção legal formal (Brasil)

### 1.1. Registro da marca no INPI 🔴 URGENTE (fazer agora)

| Item | Valor | Prazo |
|---|---|---|
| **Classe 09** (softwares e apps) | R$ 355 | 6–12 meses |
| **Classe 42** (serviços de tecnologia) | R$ 355 | 6–12 meses |
| **Classe 35** (publicidade / SaaS) | R$ 355 | 6–12 meses |
| Honorários de advogado especializado | R$ 1.500–3.000 | — |
| **Total inicial** | **~R$ 4.500** | — |

**O que registrar:**
- Marca nominativa: **"TUDO MAIS FÁCIL"**
- Marca nominativa: **"MADEIRA FORTE"** (se ainda não registrada)
- Marca mista (logo + nome) do TUDO MAIS FÁCIL

**Ação:** contratar advogado especialista em propriedade intelectual **esta semana**. Enquanto o registro sai, você tem prioridade nacional a partir da data do protocolo.

---

### 1.2. Registro do domínio 🟡 (verificar imediatamente)

Verifique se você tem:
- [ ] `tudomaisfacil.com.br` (Registro.br)
- [ ] `tudomaisfacil.com` (Namecheap / GoDaddy — internacional)
- [ ] `tudomaisfacil.app` (opção premium para PWA)
- [ ] `madeirafortemoveis.com.br`
- [ ] Variações: `tmf.app.br`, `tudo-mais-facil.com`, com hífen, sem hífen, no plural

**Custo:** R$ 40/ano por domínio no Registro.br + R$ 60/ano no .com.

**Comprar HOJE** os que ainda estão livres. Concorrente pode registrar de má-fé.

---

### 1.3. Registro do software no INPI 🟢 (média prioridade)

Registro de programa de computador — protege o **código-fonte** como direito autoral.

- **Custo:** R$ 185 (taxa) + R$ 500–1.500 (advogado)
- **Prazo:** 30–60 dias
- **Validade:** 50 anos
- **O que protege:** cópia literal do código. Não protege a ideia, mas protege a implementação.

**Como funciona:** você gera um hash SHA-512 dos arquivos principais e submete + descrição funcional. Não precisa entregar código real.

---

### 1.4. Patente do método (a joia da coroa) 🔴 ESTRATÉGICO

**Título sugerido:** _"Método assistido por inteligência artificial para captura de dimensões e características arquitetônicas de ambientes internos e geração automatizada de modelos tridimensionais em software de modelagem paramétrica."_

**O que a patente cobre:**
- O **processo específico**: fotografar → IA extrai medidas → salva estrutura JSON → plugin gera 3D → gera módulos parametrizados
- **Não o software em si** — o método/fluxo

**Passos:**
1. Contratar agente de propriedade industrial (**não é qualquer advogado**)
2. Fazer **busca de anterioridade** internacional (INPI + USPTO + WIPO) — R$ 800–2.000
3. Se estiver livre → protocolar como **patente de invenção** ou **modelo de utilidade**
4. Custo total: R$ 8.000–15.000
5. Prazo até concessão: 4–7 anos (mas você tem prioridade desde o protocolo)

**Estratégia PCT (opcional):** protocolar internacionalmente via Tratado de Cooperação em Patentes — permite pedir proteção em 156 países em 30 meses. Custo adicional: R$ 15–30k.

**Efeito prático:** _competidor que copiar seu método após seu protocolo pode ser processado e forçado a pagar royalties ou parar a operação._

---

### 1.5. Copyright dos ativos criativos (automático + registro extra)

Textos, imagens, ícones, animações, sons — tudo que você criou já tem direito autoral automático desde a fixação em meio tangível. Para reforçar:

- Registro na **Biblioteca Nacional** (Fundação Biblioteca Nacional): R$ 20/obra
- Registro na **BNBIP** para artes gráficas: R$ 40–60/obra
- Manter **originais editáveis** com metadados de autoria em Google Drive privado + backup criptografado

---

## 🕵️ CAMADA 2 — Proteção técnica

### 2.1. Ofuscação de código frontend

O frontend em React é **público por natureza** (o browser precisa ler o JS). Mas dá pra:

- **Minificação + ofuscação agressiva** no build de produção (`terser` + `javascript-obfuscator`)
- **Chunk splitting** — dividir em pedaços que só carregam quando necessário
- **Encryption of API contracts** — endpoints com nomes obscuros (`/api/v1/x1a`, não `/api/walls`)
- **Rate limit + JWT com fingerprint do dispositivo** — dificulta scraping automático

**Nota:** não impede copiar, mas atrasa MUITO. Um dev decente leva 2–3 meses só pra entender o que faz o quê.

### 2.2. Server-side = fortaleza

Toda **lógica de valor** fica no backend:
- ✅ Regras de negócio (limites, freemium, cobrança)
- ✅ Chamadas de IA (Gemini/GPT) — nunca do cliente direto
- ✅ Prompts e templates específicos
- ✅ Cálculos de conversão (cm → SketchUp inches)
- ✅ Parser de comandos de voz customizado
- ✅ Geração de PDF, DXF, plano de corte

**Regra:** frontend é a vitrine. Backend é o cofre.

### 2.3. Repositório privado + backup em escrow

- GitHub **privado** com 2FA obrigatório em toda conta com acesso
- **Code escrow**: contrato com terceiro (ex: [SES Escrow](https://www.sesescrow.com/) ou similar) que guarda uma cópia lacrada do código — só liberada em caso de morte/incapacidade do fundador OU quebra de contrato
- **Backups automáticos criptografados** (AWS S3 + GPG) em 2 regiões geográficas

### 2.4. Chaves e segredos fora do código

- Todas as API keys em `.env` **fora do repositório**
- Uso de **secret manager** (AWS Secrets Manager ou HashiCorp Vault) em produção
- **Rotação trimestral** de chaves críticas (Stripe, Gemini, OpenAI)

---

## 🧬 CAMADA 3 — Moats naturais (o que não dá pra copiar)

### 3.1. Efeito de dados 🥇 (o moat mais forte)

**Cada parede capturada por um usuário treina indiretamente nossos modelos.**

- Após 10.000 capturas, temos um dataset único no mundo de "medidas reais de ambientes brasileiros com fotos, cores, tipos de parede"
- Isso permite que a IA fique **cada vez melhor** que qualquer concorrente que começar do zero
- Concorrente novo precisa de 2–3 anos rodando pra ter dados equivalentes

**Ação:** guardar dados anonimizados com consentimento LGPD para uso em ML interno.

### 3.2. Efeito de rede (SketchUp plugin)

- Marceneiro instala o plugin **uma vez**
- Todos os projetistas do escritório passam a usar
- Cada projeto novo gera JSON que só nosso plugin lê perfeitamente
- **Custo de troca** para concorrente: reinstalar, reeducar equipe, refazer templates

### 3.3. Marca "Madeira Forte" e conteúdo

- Enquanto crescemos, produzimos **conteúdo massivo** (YouTube, Instagram, blog):
  - "Como medir uma cozinha em 3 minutos"
  - "Dobradiças 35mm: guia completo"
  - "Plano de corte otimizado com IA"
- SEO orgânico se acumula → concorrente precisa gastar 2 anos + R$ 500k em ads pra igualar

### 3.4. Fidelização por integração vertical

Vamos criar (roadmap futuro):
- Marketplace de projetos prontos
- Integração com fornecedores de MDF (Duratex, Berneck, Arauco)
- Certificação "Marceneiro Madeira Forte"
- API para lojas de material de construção

Cada camada aumenta o **custo de sair da plataforma**.

---

## 📄 CAMADA 4 — Contratos e pessoas

### 4.1. NDA (Acordo de Confidencialidade) obrigatório

Todo mundo assina antes de ver detalhes técnicos:

- Investidores potenciais
- Colaboradores (dev, designer, marketing)
- Consultores
- Prestadores (advogado, contador, agência)
- Parceiros comerciais (fornecedor MDF, escola SENAI, etc.)

**Cláusulas essenciais:**
- Sigilo por **5 anos** após término da relação
- Multa mínima: **R$ 100.000** por violação + danos
- Foro: comarca do fundador

### 4.2. Contratos de trabalho com PI

**Todo contratado (CLT ou PJ) assina cessão total de direitos:**
- Cláusula que **cede à empresa** qualquer código, design, ideia produzida durante o contrato
- **Não concorrência** por 12 meses após saída (dentro do mesmo nicho, mesmo território)
- **Não aliciamento** de clientes e outros funcionários por 24 meses

### 4.3. Contrato SCP do investidor silencioso

Cláusulas de proteção do fundador:
- ✅ Investidor **não vira sócio** (sem quotas)
- ✅ Sem direito a voto ou veto
- ✅ Sem acesso ao código-fonte
- ✅ Cláusula anti-vazamento (multa 3× o aporte)
- ✅ Cláusula de anti-arbitrariedade: investidor não pode processar por decisões operacionais
- ✅ Cláusula de exit: se houver venda da empresa, ele recebe proporção da receita até o momento e sai

---

## 🌐 CAMADA 5 — Proteção internacional (Ano 3+)

Quando começar tradução para outros idiomas:

- **WIPO / PCT** para patente internacional (protocolar antes de abrir mercado)
- **USPTO** (EUA) — marca em inglês
- **EUIPO** (Europa) — marca comunitária cobrindo 27 países
- **INPI Portugal + México + Argentina** — mercados-alvo LATAM
- **Registro no Google Play Console e App Store** com titularidade da PJ, não pessoa física

---

## 📊 Investimento total em blindagem (5 anos)

| Fase | Item | Custo |
|---|---|---|
| **Ano 1** | Marca INPI (3 classes) + Software INPI + Domínios | R$ 6.000 |
| **Ano 1** | Advogado PI + NDA + contratos modelo | R$ 5.000 |
| **Ano 2** | Patente método (BR) | R$ 12.000 |
| **Ano 3** | PCT internacional | R$ 25.000 |
| **Ano 3** | Marcas EUA + Europa + LATAM | R$ 15.000 |
| **Ano 4–5** | Manutenção anuidades | R$ 5.000/ano |
| **Total 5 anos** | | **~R$ 68.000** |

**ROI da blindagem:** proteger a curva de valuation projetada (R$ 85M–R$ 100M no ano 5). **Cada R$ 1 investido em proteção vale R$ 1.300 de valuation preservado.**

---

## 🚨 Checklist de urgência — 30 dias

### Semana 1
- [ ] Contratar advogado de propriedade intelectual
- [ ] Verificar e comprar todos os domínios livres
- [ ] Criar NDA padrão (modelo pronto) e começar a usar em toda conversa nova
- [ ] Fazer inventário de tudo que existe (código, imagens, textos, plugin, IA prompts)

### Semana 2
- [ ] Protocolar marca "TUDO MAIS FÁCIL" no INPI (classes 09, 42, 35)
- [ ] Protocolar marca "MADEIRA FORTE" (se aplicável)
- [ ] Habilitar 2FA em TODAS as contas críticas (GitHub, Stripe, MongoDB, Gemini)
- [ ] Fazer backup criptografado completo em cofre externo

### Semana 3
- [ ] Registrar programa de computador no INPI
- [ ] Contratar agente de patentes para busca de anterioridade
- [ ] Setup do repositório privado com regras de branch (main protegida, PR obrigatório)
- [ ] Redigir contrato SCP com advogado

### Semana 4
- [ ] Fazer ofuscação agressiva do frontend em produção
- [ ] Migrar segredos para secret manager (se ainda não migrou)
- [ ] Contratar serviço de code escrow
- [ ] Ter contrato de trabalho/PJ modelo pronto para futuras contratações

---

## ⚡ Regra de bolso

> **Enquanto você é pequeno e desconhecido, sua proteção principal é a velocidade.**
>
> Cada mês em que você cresce mais rápido que um copiador consegue começar, você acumula:
> - Mais dados (moat 3.1)
> - Mais usuários fiéis (moat 3.2)
> - Mais autoridade de marca (moat 3.3)
> - Mais códigos protocolados (camada 1)
>
> **Portanto:** a blindagem começa com a marca (INPI) e continua com a EXECUÇÃO. Toda vez que você entrega feature nova, você aumenta a distância do concorrente hipotético.

---

**Última recomendação:** guarde este documento em **local privado** (não no repositório do código). Compartilhe apenas com o advogado de PI e, se necessário, com o investidor **após** NDA assinada.
