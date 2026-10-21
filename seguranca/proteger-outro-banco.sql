-- Protege o outro projeto do Supabase (autoatendimento / orçamento online).
-- Rode SOMENTE no projeto antigo ("kyam382@gmail.com's Project"), NÃO no controle_horas.
-- Faça os passos na ordem e teste o site de autoatendimento depois do PASSO 2.

-- ============ PASSO 0: só olhar (não muda nada) ============
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;
-- select count(*) as orcamentos from public.orcamentos;
-- select count(*) as chapas from public.mdf_chapas;

-- ============ PASSO 2: ligar a proteção ============
-- Com a proteção ligada, quem tem só a chave pública do site:
--   * consegue LER a lista de chapas (preços), mas não alterar;
--   * consegue ENVIAR um orçamento novo, mas NÃO consegue ler, alterar nem apagar orçamentos.
-- O painel do Supabase e o servidor (chave secreta) continuam com acesso total.
alter table public.mdf_chapas enable row level security;
alter table public.orcamentos enable row level security;

drop policy if exists chapas_leitura_publica on public.mdf_chapas;
create policy chapas_leitura_publica on public.mdf_chapas
  for select to anon, authenticated using (true);

drop policy if exists orcamentos_envio_publico on public.orcamentos;
create policy orcamentos_envio_publico on public.orcamentos
  for insert to anon, authenticated with check (true);

-- ============ DESFAZER (se o site de autoatendimento parar de funcionar) ============
-- drop policy if exists chapas_leitura_publica on public.mdf_chapas;
-- drop policy if exists orcamentos_envio_publico on public.orcamentos;
-- alter table public.mdf_chapas disable row level security;
-- alter table public.orcamentos disable row level security;
