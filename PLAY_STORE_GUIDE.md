# 📱 Guia — Publicar TUDO MAIS FÁCIL na Play Store

**Estratégia**: publicar como **PWA (Progressive Web App)** usando o **PWA Builder da Microsoft/Google** — é o caminho mais rápido, barato e não requer manter código separado.

---

## ✅ Pré-requisitos (o que o app já tem)

- ✓ HTTPS ativo (Emergent preview URL)
- ✓ `manifest.json` completo com nome, ícones em vários tamanhos, cores
- ✓ Ícones 192x192 e 512x512 (any + maskable)
- ✓ Meta tags `<meta name="theme-color">` e `<meta name="apple-mobile-web-app-capable">`
- ✓ Política de Privacidade acessível em `/privacidade`
- ✓ Termos de Uso acessíveis em `/termos`
- ✓ Página inicial responsiva

---

## 📋 O que você precisa preparar (fora do código)

### 1. Conta Google Play Console
- Acessar https://play.google.com/console
- Criar conta de desenvolvedor: **US$ 25 (~R$ 125) taxa ÚNICA vitalícia**
- Confirmar documento (RG ou CNH) — leva ~48h para aprovar

### 2. Domínio próprio (recomendado ANTES de publicar)
Play Store prefere apps hospedados em domínios definitivos. Sugestões:
- `tudomaisfacil.com.br` (~R$ 40/ano no Registro.br)
- `madeiraforte.app.br` (mais curto, ~R$ 40/ano)

Depois: apontar o domínio para o app (me pede quando for a hora, eu ajudo).

### 3. Assets gráficos (posso gerar TODOS quando você pedir)
- **Ícone da Play Store**: 512×512 PNG (já temos: `/icons/icon-512.png` ✓)
- **Feature graphic**: 1024×500 PNG (banner do topo da listagem — gero em 1 min)
- **Screenshots do app** (mínimo 2, máximo 8):
  - Telefone: 1080×1920 (ou similar 9:16)
  - Tablet: 1200×1920 (opcional)
- **Vídeo curto** (opcional mas ajuda muito): 30s mostrando o app

### 4. Textos da listagem (posso escrever)
- **Título curto**: até 30 caracteres → "Tudo Mais Fácil — Madeira"
- **Descrição curta**: até 80 caracteres
- **Descrição completa**: até 4000 caracteres (SEO — palavras-chave)
- **Categoria**: Produtividade OU Empresarial
- **Classificação etária**: Livre (todos os públicos)

### 5. Compliance
- **Política de Privacidade**: já pronta em `https://<seu-dominio>/privacidade` ✓
- **Declaração de segurança de dados**: formulário no Play Console (10 min)
- **Anúncios**: Não (app sem publicidade)
- **Compras dentro do app**: Sim (assinaturas via Stripe externo) — **atenção**: Google cobra 15-30% de compras processadas via Play Billing, MAS assinaturas SaaS de serviço externo (Stripe) NÃO precisam usar Play Billing se você declarar como "serviço fora do app"

---

## 🚀 Passo a passo de publicação (~2 horas depois de tudo pronto)

### Passo 1 — Gerar o APK (via PWA Builder)
1. Acesse https://www.pwabuilder.com/
2. Cole a URL do app (ex: `https://tudomaisfacil.com.br`)
3. Clique "Package for Stores" → "Android"
4. Baixa o **AAB (Android App Bundle)** + arquivo `assetlinks.json`
5. Guarda o AAB — é o que sobe pra Play Store

### Passo 2 — Assetlinks (importante!)
1. Copie o `assetlinks.json` gerado pelo PWA Builder
2. Coloque em `https://tudomaisfacil.com.br/.well-known/assetlinks.json`
3. Testa acessando a URL — deve retornar JSON

### Passo 3 — Play Console
1. Criar novo app → nome, idioma, tipo (Aplicativo), preço (Grátis)
2. **Configuração da loja** → subir assets (ícone, banner, screenshots, descrições)
3. **Política e conteúdo** → preencher classificação, público-alvo, política de privacidade
4. **Lançamento em produção** → subir o AAB gerado pelo PWA Builder
5. Enviar para revisão

### Passo 4 — Aguardar aprovação
- **3-7 dias** para primeira aprovação (depois, updates são mais rápidos, ~24h)
- Play envia e-mail quando aprovar

---

## 💰 Custo total

| Item | Valor |
|---|---|
| Google Play Developer | ~R$ 125 (única vez) |
| Domínio próprio | ~R$ 40/ano |
| PWA Builder | Grátis |
| **Total ano 1** | **~R$ 165** |

Depois: só R$ 40/ano do domínio.

---

## ⚠️ Alternativa: distribuir sem Play Store

Se preferir evitar a fila do Google e a taxa, dá pra fazer **APK direto**:
1. Gera o AAB no PWA Builder
2. Você distribui o link do site → usuário instala como PWA (nossa opção atual)
3. OU distribui o APK direto por WhatsApp / e-mail
4. Usuário abre APK no celular → Android pede permissão de "fontes desconhecidas" → instala

**Prós**: sem taxa, sem burocracia
**Contras**: passa impressão de "app não-oficial" → menos confiança dos clientes

---

## 🎯 Minha recomendação

**Ordem sugerida**:
1. **Agora**: testar via PWA direto do navegador (você já fez ✓)
2. **1-2 semanas**: registrar `tudomaisfacil.com.br` (R$ 40, imediato)
3. **1 mês**: quando tiver 5-10 clientes pagantes → registrar conta Google Play (R$ 125)
4. **1 mês + 2 dias**: publicar via PWA Builder (te ajudo tudo)

Assim você **não gasta R$ 125 antes de saber se o produto vende**.

---

**Quando estiver pronto, me chama que a gente faz junto!** 🚀
