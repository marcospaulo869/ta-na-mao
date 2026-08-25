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
- **2026-01-25** — MVP Fase 1 completa: backend CRUD + export mm, frontend com brand identity dourado/preto, formulário 24 campos, captura de foto, integração da logomarca oficial da Madeira Forte, testado end-to-end pelo testing agent (100% pass após 1 fix)
- **Fix**: `PontoParede.tipo` tornou-se `Optional` para compatibilidade com frontend

## Prioridade — Backlog

### P0 (próxima sessão)
- **Plugin Ruby SketchUp (.rbz)** que lê o JSON exportado e gera o modelo 3D automaticamente
  - Menu customizado dentro do SketchUp com botão "Importar Parede TMF"
  - Geração paramétrica: paredes com recortes, colunas, vigas, rodapés
  - Aplicação de materiais a partir das cores dominantes

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
