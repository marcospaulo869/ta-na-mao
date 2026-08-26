# PRD — TUDO MAIS FÁCIL (Madeira Forte Planejados)

## Original problem statement
Criar um app com ferramentas e plugins que funcione dentro do SketchUp — produto comercial para arquitetos, projetistas e marceneiros, com potencial de venda em assinatura no Brasil e depois internacional.

## Visão do produto
Suite completa (Marcenaria + Arquitetura + Documentação + Apresentação) que reduz o tempo de captura de medidas em obra e gera automaticamente o modelo 3D dentro do SketchUp.

## Arquitetura (fases)
- **Fase 1 (MVP — implementado 2026-01)**: Web app responsivo (React + FastAPI + MongoDB) para captura de fotos e medidas do ambiente. Cada parede é salva com todos os dados e exportável em JSON para consumo pelo plugin.
- **Fase 2 (backlog)**: Plugin Ruby dentro do SketchUp (.rbz) que consome o JSON exportado e gera automaticamente:
  - Paredes 3D com dimensões corretas
  - Colunas, vigas, rodapés
  - Portas e janelas (recortes automáticos)
  - Componentes para tomadas, interruptores, pontos hidráulicos e de gás
  - Materiais aplicados a partir das cores dominantes das fotos

## Personas
1. **Marceneiro** — mede o ambiente do cliente no celular, salva as paredes, chega no escritório e o modelo 3D já está pronto no SketchUp.
2. **Arquiteto/Projetista** — recebe medições da equipe de campo já digitalizadas e importa em 1 clique.

## Dados fiscais do proprietário
- **Cidade**: Torres — Rio Grande do Sul (RS)
- **Regime**: MEI, emite NFS-e (serviço)
- **NFS-e automática**: adiada — usuário vai emitir manual até validar produto. Quando escalar (~20 vendas/mês), integrar API (NFE.io recomendado, ~R$ 0,25/nota) com credenciais da prefeitura de Torres/RS + certificado digital.

## Requisitos estáticos (core)
- Interface preto + dourado, aspecto high-tech, botões dourado-claro retangulares com texto preto
- 100% responsivo (mobile-first para uso em obra)
- 24 campos de medida agrupados por categoria (Estrutura, Aberturas, Elétrica, Hidráulica, Gás)
- Suporte a múltiplas instâncias por categoria (várias colunas, portas, tomadas...)
- Cada parede numerada automaticamente (Parede 01, 02...)
- Export JSON no formato `TUDO_MAIS_FACIL_WALL v1.0` (mm) para SketchUp
- Captura de foto com extração de cor dominante (Canvas 2D)

## Modelo de negócio
- Assinatura mensal/anual + Freemium

## Stack
- **Frontend**: React 19, react-router-dom 7, Phosphor Icons, sonner, TailwindCSS
- **Backend**: FastAPI, MongoDB (motor), Pydantic v2, uvicorn
- **URLs**: `REACT_APP_BACKEND_URL` + `/api` prefix

## Endpoints implementados
- `GET /api/` — metadata do app
- `POST /api/walls` — cria parede (auto-numera se sem nome)
- `GET /api/walls` — lista paredes
- `GET /api/walls/{id}` — detalhe
- `PUT /api/walls/{id}` — atualiza
- `DELETE /api/walls/{id}` — exclui
- `GET /api/walls/{id}/export` — exporta JSON para SketchUp (mm)
- `POST /api/photos` — salva foto + cor dominante hex
- `GET /api/photos` — lista fotos (sem base64)
- `GET /api/photos/{id}` — foto completa
- `DELETE /api/photos/{id}` — remove foto

## Telas implementadas
- `/` — Home com logo Madeira Forte + brand + 3 CTAs + atalho paredes salvas
- `/foto/parede` e `/foto/piso` — captura de foto com preview e extração de cor
- `/parede/nova` e `/parede/:id` — formulário completo (24 campos em accordions)
- `/paredes` — lista de paredes com export/editar/excluir

## Implementado até agora
- **2026-01-25** — MVP Fase 1: backend CRUD, formulário 24 campos, captura de foto (100%)
- **2026-01-25** — MVP Fase 2: Plugin SketchUp Ruby (`tudo_mais_facil.rbz`) — gera geometria 3D
- **2026-01-25** — Fixes: PontoParede.tipo Optional, tipografia Archivo Black, logo vertical, textos revisados
- **2026-01-25** — Auth + Freemium + Stripe (14/14 backend + 100% frontend)
- **2026-01-25** — Projetos + PDF (15/15 backend + 100% frontend). Botão WhatsApp direto.
- **2026-01-26** — **🎙️ Ditado por Voz**: MediaRecorder API + Whisper (whisper-1) para transcrição em pt-BR + GPT-5.4 para extração estruturada JSON. Testes reais confirmaram: "Pé direito 2,80m, largura 4,20m, porta 80×210, 3 tomadas..." → parsed corretamente (altura_pe_direito=280, largura=420, portas[1], tomadas[3]). Timeout 60s, session id único por request. Componente VoiceRecorder com botão dourado no CriarParede entre nome/projeto e Estrutura. **8/8 backend + regressão + frontend 100%**.
- **2026-01-26** — **Landing + PWA + Play Store readiness**: Landing page comercial em `/lp` (hero, 6 features, fluxo em 3 passos, preços com dados reais do Stripe, testimonials placeholder, CTA final, footer com links legais). Root `/` mostra Landing para deslogado e Home para logado. Páginas `/privacidade` e `/termos` (LGPD-compliant, MEI Torres/RS). PWA completo: manifest.json v2 com 11 ícones (72-512 + maskable), apple-touch-icon, favicon, meta tags Open Graph pt-BR (WhatsApp share). Guia de publicação Play Store em `/app/PLAY_STORE_GUIDE.md` (custo total ~R$ 165, plano de 4 semanas).

## Prioridade — Backlog

### P0 (próxima sessão)
- **📁 Agrupar paredes em Projetos**: modelo Project (nome, cliente, endereço, walls[]), CRUD, importar projeto inteiro no SketchUp
- **📄 PDF do ambiente** com todas as medidas + fotos para WhatsApp
- **🎙️ Ditado por voz** (Whisper + IA para preencher campos)

### P1
- Autenticação (JWT ou Google Login) para separar clientes/assinantes
- Múltiplos ambientes/projetos (agrupar várias paredes em um projeto único)
- Stripe/Razorpay para assinatura freemium
- PDF do "Relatório do Ambiente" com todas as medidas + fotos

### P2
- Módulo Marcenaria: gerador de armários planejados com plano de corte de chapas
- Anotações por voz (converte áudio em campo preenchido via Whisper)
- Compartilhamento de projetos entre projetista e marceneiro
- Biblioteca de componentes (portas prontas, ferragens, etc.)
- Marketplace de projetos entre profissionais

## Próximos passos imediatos
1. Validar app com o usuário no celular real (mobile)
2. Iniciar Plugin Ruby do SketchUp para leitura do JSON exportado
3. Adicionar autenticação e sistema de assinatura
