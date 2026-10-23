-- Controle de Horas: estrutura do banco no Supabase (versão 2).
-- Como usar: Supabase > SQL Editor > New query > cole tudo > Run.
-- Pode rodar de novo quando houver atualização: o script não apaga dados.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tabelas

-- Colaboradores. Cada empresa (conta de administrador) só vê os seus.
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),   -- link de acesso do colaborador
  data jsonb not null default '{}'::jsonb,                -- ficha: nome, função, regime, salário, escala...
  created_at timestamptz not null default now()
);

-- Horários de cada dia (o que vale para a folha).
create table if not exists entries (
  emp_id uuid not null references employees(id) on delete cascade,
  day date not null,
  a text, b text, c text, d text,                         -- entrada/saída manhã, entrada/saída tarde
  t text not null default '',                             -- situação: '', folga, just, falta
  editado boolean not null default false,                 -- corrigido pelo administrador
  updated_at timestamptz not null default now(),
  primary key (emp_id, day)
);
alter table entries add column if not exists editado boolean not null default false;

-- Registros de ponto feitos pelo colaborador (cada toque no botão é um evento que ninguém altera).
create table if not exists punches (
  id uuid primary key default gen_random_uuid(),
  emp_id uuid not null references employees(id) on delete cascade,
  day date not null,                                      -- dia em Brasília
  field text not null check (field in ('a','b','c','d')),
  ts timestamptz not null default now(),                  -- hora gravada pelo servidor
  status text not null default 'ok' check (status in ('ok','pending','approved','rejected')),
  place text not null default 'sem_verificacao',          -- no_local | fora | sem_gps | externo | externo_autorizado | sem_verificacao
  motivo text,                                            -- justificativa de trabalho externo
  ip text,
  lat double precision, lon double precision, acc double precision,
  dist_m integer, local_nome text,
  device_ts timestamptz, skew_sec integer,                -- relógio do celular e diferença para o servidor
  decided_at timestamptz
);
create index if not exists punches_emp_day on punches (emp_id, day);
create index if not exists punches_pending on punches (status) where status = 'pending';

-- Confirmação de recebimento de pagamento. A empresa cria o pedido (aguardando); só o colaborador
-- (pelo link pessoal, via emp_recibo) responde. Depois de respondido, ninguém altera nem apaga.
create table if not exists recibos (
  id uuid primary key default gen_random_uuid(),
  emp_id uuid not null references employees(id) on delete cascade,
  pag_id text not null,                                   -- id do pagamento na ficha do colaborador
  snapshot jsonb not null,                                -- o que o colaborador viu (valor, data, semana, forma...)
  status text not null default 'aguardando' check (status in ('aguardando','confirmado','contestado')),
  criado_em timestamptz not null default now(),
  decidido_em timestamptz,                                -- hora gravada pelo servidor
  obs text,                                               -- motivo, se contestou
  ip text, ua text,                                       -- rede e aparelho de quem respondeu (lidos pelo servidor)
  selo text                                               -- código de verificação (SHA-256)
);
create unique index if not exists recibos_ativo on recibos (emp_id, pag_id) where status <> 'contestado';
create index if not exists recibos_emp on recibos (emp_id, criado_em desc);

-- Parâmetros da empresa (salário mínimo, feriados municipais, regras de ponto, locais).
create table if not exists company_settings (
  owner uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb
);

alter table employees enable row level security;
alter table entries enable row level security;
alter table punches enable row level security;
alter table company_settings enable row level security;
alter table recibos enable row level security;

-- --------------------------------------------------- acesso do administrador

drop policy if exists emp_owner on employees;
create policy emp_owner on employees for all
  using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists ent_owner on entries;
create policy ent_owner on entries for all
  using (exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()))
  with check (exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()));

drop policy if exists pun_owner on punches;
create policy pun_owner on punches for all
  using (exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()))
  with check (exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()));

drop policy if exists cfg_owner on company_settings;
create policy cfg_owner on company_settings for all
  using (owner = auth.uid()) with check (owner = auth.uid());

-- recibos: a empresa lê, pede (insere) e só apaga pedidos ainda sem resposta. Nunca altera.
drop policy if exists rec_sel on recibos;
create policy rec_sel on recibos for select
  using (exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()));
drop policy if exists rec_ins on recibos;
create policy rec_ins on recibos for insert
  with check (status = 'aguardando' and decidido_em is null and selo is null and ip is null
    and exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()));
drop policy if exists rec_del on recibos;
create policy rec_del on recibos for delete
  using (status = 'aguardando'
    and exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on employees, entries, punches, company_settings to authenticated;
grant select, insert, delete on recibos to authenticated;
revoke update on recibos from authenticated;
revoke all on recibos from anon;
revoke truncate, references, trigger on recibos from authenticated;

-- Defesa extra: uma resposta já dada não muda, e o que o colaborador viu também não.
create or replace function recibos_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if old.status <> 'aguardando' then
    raise exception 'Este registro já foi respondido e não pode ser alterado.';
  end if;
  if new.snapshot is distinct from old.snapshot or new.emp_id <> old.emp_id or new.pag_id <> old.pag_id
     or new.criado_em <> old.criado_em or new.id <> old.id then
    raise exception 'Os dados do pagamento não podem ser alterados.';
  end if;
  return new;
end $$;
drop trigger if exists recibos_guard_t on recibos;
create trigger recibos_guard_t before update on recibos for each row execute function recibos_guard();

-- ------------------------------------------------------------- utilidades

-- IP de quem fez a requisição (o servidor lê; o colaborador não consegue alterar).
create or replace function client_ip() returns text language sql stable as $$
  select nullif(trim(coalesce(
    nullif(nullif(current_setting('request.headers', true), '')::jsonb ->> 'cf-connecting-ip', ''),
    split_part(coalesce(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-forwarded-for', ''), ',', 1)
  )), '')
$$;

create or replace function meu_ip() returns text language sql stable as $$ select client_ip() $$;

create or replace function haversine_m(lat1 float8, lon1 float8, lat2 float8, lon2 float8)
returns float8 language sql immutable as $$
  select 2 * 6371000 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)))
$$;

-- Salva as configurações do administrador sem apagar o que o servidor aprendeu (IPs recentes).
create or replace function cfg_salvar(p_data jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  insert into company_settings (owner, data) values (auth.uid(), p_data - 'ip_recentes')
  on conflict (owner) do update
    set data = (company_settings.data - 'ip_recentes') || (p_data - 'ip_recentes')
               || case when company_settings.data ? 'ip_recentes'
                       then jsonb_build_object('ip_recentes', company_settings.data -> 'ip_recentes')
                       else '{}'::jsonb end;
end $$;

create or replace function ips_limpar() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  update company_settings set data = data - 'ip_recentes' where owner = auth.uid();
end $$;

-- Guarda o IP como "IP recente da empresa" (vale por 30 dias, no máximo 10 IPs).
create or replace function ip_aprender(p_owner uuid, p_ip text) returns void
language plpgsql security definer set search_path = public as $$
declare arr jsonb; agora timestamptz := now();
begin
  if p_ip is null then return; end if;
  select coalesce(jsonb_agg(x order by x->>'ts' desc), '[]'::jsonb) into arr from (
    select x from company_settings cs, jsonb_array_elements(coalesce(cs.data->'ip_recentes', '[]'::jsonb)) x
    where cs.owner = p_owner and (x->>'ts')::timestamptz > agora - interval '30 days' and x->>'ip' <> p_ip
    order by x->>'ts' desc limit 9) q;
  arr := jsonb_build_array(jsonb_build_object('ip', p_ip, 'ts', agora)) || arr;
  insert into company_settings (owner, data) values (p_owner, jsonb_build_object('ip_recentes', arr))
  on conflict (owner) do update set data = jsonb_set(company_settings.data, '{ip_recentes}', arr, true);
end $$;
revoke all on function ip_aprender(uuid, text) from public;

-- Quando um registro é aceito (ok ou aprovado), o horário vai para o dia do colaborador.
create or replace function punches_sync() returns trigger
language plpgsql security definer set search_path = public as $$
declare hhmm text; own uuid; cfg jsonb;
begin
  -- aprovar um registro pendente que o GPS confirma perto da empresa ensina o IP novo
  if tg_op = 'UPDATE' and new.status = 'approved' and old.status = 'pending'
     and new.ip is not null and new.dist_m is not null and new.dist_m <= 150 then
    select e.owner, cs.data into own, cfg from employees e left join company_settings cs on cs.owner = e.owner where e.id = new.emp_id;
    if coalesce((cfg->'ponto'->>'aprender_ip')::boolean, true) and coalesce(cfg->'ponto'->>'metodo', 'both') in ('any', 'both') then
      perform ip_aprender(own, new.ip);
    end if;
  end if;
  if new.status in ('ok', 'approved') then
    hhmm := to_char(new.ts at time zone 'America/Sao_Paulo', 'HH24:MI');
    insert into entries (emp_id, day, a, b, c, d) values (
      new.emp_id, new.day,
      case when new.field = 'a' then hhmm end, case when new.field = 'b' then hhmm end,
      case when new.field = 'c' then hhmm end, case when new.field = 'd' then hhmm end)
    on conflict (emp_id, day) do update set
      a = case when new.field = 'a' then hhmm else entries.a end,
      b = case when new.field = 'b' then hhmm else entries.b end,
      c = case when new.field = 'c' then hhmm else entries.c end,
      d = case when new.field = 'd' then hhmm else entries.d end,
      updated_at = now();
  end if;
  return null;
end $$;

drop trigger if exists punches_sync_t on punches;
create trigger punches_sync_t after insert or update of status on punches
  for each row execute function punches_sync();

-- -------------------------------------------------- acesso do colaborador

create or replace function emp_get(p_token uuid, p_from date, p_to date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  e employees;
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  dados jsonb;
  cfg jsonb;
  cpf_n text;
  n int;
begin
  select * into e from employees where token = p_token;
  if not found then return null; end if;
  -- o colaborador só recebe o que precisa (sem CPF inteiro, RG, Pix, banco, documentos, rescisão...)
  dados := coalesce((select jsonb_object_agg(t.k, t.v) from jsonb_each(e.data) as t(k, v)
    where t.k = any (array['nome','funcao','tipo','salario','base','metaSem','metaSab','capSemana','adicExtra','adicFer',
      'valorHora','jornada','pagaExtra','adm','dias','autoFalta','verValores','vales','externos','foto','telefone',
      'emailPessoal','emergNome','emergTel','cep','rua','numero','complemento','bairro','cidade','uf','aceite'])), '{}'::jsonb);
  cpf_n := regexp_replace(coalesce(e.data->>'cpf', ''), '\D', '', 'g');
  if length(cpf_n) = 11 then dados := dados || jsonb_build_object('cpfMask', '***.***.***-' || right(cpf_n, 2)); end if;
  if coalesce(e.data->>'verValores', 'true') = 'false' then
    dados := dados - 'salario' - 'valorHora' - 'vales';
  end if;
  select data into cfg from company_settings where owner = e.owner;
  select count(*) into n from punches where emp_id = e.id and day = hoje and status <> 'rejected';
  return jsonb_build_object(
    'id', e.id,
    'data', dados,
    'today', hoje,
    'now', to_char(now() at time zone 'America/Sao_Paulo', 'HH24:MI'),
    'today_entry', (select to_jsonb(x) from entries x where x.emp_id = e.id and x.day = hoje),
    'entries', coalesce((select jsonb_agg(to_jsonb(x) order by x.day) from entries x
                          where x.emp_id = e.id and x.day between p_from and p_to
                          and p_to - p_from <= 31), '[]'::jsonb),
    'punches', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'field', p.field,
                          'hora', to_char(p.ts at time zone 'America/Sao_Paulo', 'HH24:MI'),
                          'status', p.status, 'place', p.place) order by p.ts)
                          from punches p where p.emp_id = e.id and p.day = hoje), '[]'::jsonb),
    'recibos', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'snapshot', x.snapshot, 'status', x.status,
                          'criado_em', x.criado_em, 'decidido_em', x.decidido_em, 'selo', x.selo, 'obs', x.obs)
                          order by x.criado_em desc)
                          from (select * from recibos where emp_id = e.id order by criado_em desc limit 30) x), '[]'::jsonb),
    'proximo', case n when 0 then 'a' when 1 then 'b' when 2 then 'c' when 3 then 'd' else null end,
    'ponto', jsonb_build_object(
      'verif', coalesce(cfg->'ponto'->>'verif', 'block'),
      'externo', coalesce((cfg->'ponto'->>'externo')::boolean, true),
      'foto', coalesce((cfg->'ponto'->>'foto')::boolean, false)),
    'settings', jsonb_build_object('feriados', cfg->'feriados', 'empresa', cfg->'empresa')
  );
end $$;

-- O colaborador atualiza só o próprio perfil (foto, telefone, contato de emergência, endereço).
-- Nunca altera Pix, CPF, salário ou qualquer dado de pagamento.
create or replace function emp_perfil(p_token uuid, p_data jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  e employees; k text; v jsonb; txt text;
  permitido text[] := array['foto','telefone','emailPessoal','emergNome','emergTel','cep','rua','numero','complemento','bairro','cidade','uf'];
begin
  select * into e from employees where token = p_token;
  if not found then return jsonb_build_object('ok', false, 'erro', 'Link inválido.'); end if;
  for k, v in select * from jsonb_each(coalesce(p_data, '{}'::jsonb)) loop
    if not (k = any (permitido)) or jsonb_typeof(v) <> 'string' then continue; end if;
    txt := v #>> '{}';
    if k = 'foto' then
      if txt <> '' and (txt not like 'data:image/jpeg;base64,%' or length(txt) > 150000) then
        return jsonb_build_object('ok', false, 'erro', 'Foto inválida ou muito grande.');
      end if;
    elsif length(txt) > 200 then
      return jsonb_build_object('ok', false, 'erro', 'Texto muito longo em ' || k || '.');
    end if;
    update employees set data = jsonb_set(data, array[k], v, true) where id = e.id;
  end loop;
  return jsonb_build_object('ok', true);
end $$;

-- Registra que o colaborador leu o aviso de privacidade (com data e hora).
create or replace function emp_aceite(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare e employees;
begin
  select * into e from employees where token = p_token;
  if not found then return jsonb_build_object('ok', false, 'erro', 'Link inválido.'); end if;
  update employees set data = jsonb_set(data, '{aceite}',
    to_jsonb(to_char(now() at time zone 'America/Sao_Paulo', 'YYYY-MM-DD"T"HH24:MI')), true) where id = e.id;
  return jsonb_build_object('ok', true);
end $$;

-- O colaborador confirma (ou contesta) o recebimento de um pagamento. O servidor grava hora, rede e aparelho
-- e gera um código de verificação; depois disso o registro não muda mais.
create or replace function emp_recibo(p_token uuid, p_id uuid, p_acao text, p_obs text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  e employees; r recibos; hdr jsonb; agora timestamptz := now(); novo text; h text; motivo text;
begin
  select * into e from employees where token = p_token;
  if not found then return jsonb_build_object('ok', false, 'erro', 'Link inválido.'); end if;
  if p_acao not in ('confirmar', 'contestar') then return jsonb_build_object('ok', false, 'erro', 'Ação inválida.'); end if;
  motivo := nullif(left(trim(coalesce(p_obs, '')), 500), '');
  if p_acao = 'contestar' and length(coalesce(motivo, '')) < 5 then
    return jsonb_build_object('ok', false, 'erro', 'Explique o motivo em poucas palavras.');
  end if;
  select * into r from recibos where id = p_id and emp_id = e.id for update;
  if not found then return jsonb_build_object('ok', false, 'erro', 'Pagamento não encontrado.'); end if;
  if r.status <> 'aguardando' then
    return jsonb_build_object('ok', false, 'erro', 'Este pagamento já foi respondido.');
  end if;
  novo := case when p_acao = 'confirmar' then 'confirmado' else 'contestado' end;
  hdr := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  h := encode(sha256(convert_to(r.id::text || '|' || r.emp_id::text || '|' || r.snapshot::text || '|' || novo || '|' ||
        to_char(agora at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US') || '|' || coalesce(client_ip(), '') || '|' ||
        coalesce(motivo, ''), 'UTF8')), 'hex');
  update recibos set status = novo, decidido_em = agora, obs = motivo, ip = client_ip(),
    ua = left(hdr ->> 'user-agent', 300), selo = upper(h) where id = r.id;
  return jsonb_build_object('ok', true, 'status', novo, 'decidido_em', agora, 'selo', upper(h));
end $$;

-- O colaborador toca no botão; o servidor grava a hora e confere o local.
create or replace function emp_punch(
  p_token uuid, p_lat float8, p_lon float8, p_acc float8,
  p_device_ts timestamptz, p_externo boolean, p_motivo text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  e employees;
  agora timestamptz := now();
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  s jsonb; pr jsonb; verif text; metodo text; externo_ok boolean; aprender boolean;
  l jsonb; ips jsonb; raio int; d float8; best_d float8; best_n text;
  ip text; ipok boolean := false; gpsok boolean := false; tem_local boolean := false;
  n int; fld text; place text; st text; ok boolean; need_gps boolean; skew int;
  dia_externo boolean;
begin
  select * into e from employees where token = p_token;
  if not found then return jsonb_build_object('ok', false, 'erro', 'Link inválido. Peça um novo ao responsável.'); end if;

  if not (coalesce(e.data->'dias', '[1,2,3,4,5,6]'::jsonb) @> to_jsonb(extract(dow from hoje)::int)) then
    return jsonb_build_object('ok', false, 'erro', 'Hoje não é um dia liberado na sua escala.');
  end if;

  select count(*) into n from punches where emp_id = e.id and day = hoje and status <> 'rejected';
  if n >= 4 then return jsonb_build_object('ok', false, 'erro', 'Você já registrou os 4 horários de hoje.'); end if;
  if exists (select 1 from punches where emp_id = e.id and ts > agora - interval '20 seconds') then
    return jsonb_build_object('ok', false, 'erro', 'Aguarde alguns segundos antes de registrar de novo.');
  end if;
  fld := (array['a','b','c','d'])[n + 1];

  select data into s from company_settings where owner = e.owner;
  s := coalesce(s, '{}'::jsonb);
  pr := coalesce(s->'ponto', '{}'::jsonb);
  verif := coalesce(pr->>'verif', 'block');
  metodo := coalesce(pr->>'metodo', 'both');
  externo_ok := coalesce((pr->>'externo')::boolean, true);
  aprender := coalesce((pr->>'aprender_ip')::boolean, true);
  if coalesce((e.data->>'semVerificacao')::boolean, false) then verif := 'off'; end if;
  dia_externo := coalesce(e.data->'externos', '[]'::jsonb) ? hoje::text;

  ip := client_ip();

  -- confere os locais cadastrados
  for l in select * from jsonb_array_elements(coalesce(pr->'locais', '[]'::jsonb)) loop
    tem_local := true;
    raio := coalesce((l->>'raio')::int, 100);
    ips := coalesce(l->'ips', '[]'::jsonb);
    if ip is not null and ips ? ip then ipok := true; end if;
    if p_lat is not null and p_lon is not null and l->>'lat' is not null and l->>'lon' is not null then
      d := haversine_m(p_lat, p_lon, (l->>'lat')::float8, (l->>'lon')::float8);
      if best_d is null or d < best_d then best_d := d; best_n := l->>'nome'; end if;
      if d <= raio and coalesce(p_acc, 0) <= 200 then gpsok := true; end if;
    end if;
  end loop;
  if not ipok and ip is not null and exists (
      select 1 from jsonb_array_elements(coalesce(s->'ip_recentes', '[]'::jsonb)) x
      where x->>'ip' = ip and (x->>'ts')::timestamptz > agora - interval '30 days') then
    ipok := true;
  end if;

  need_gps := metodo in ('gps', 'both');
  ok := case metodo when 'ip' then ipok when 'gps' then gpsok when 'any' then (ipok or gpsok) else (ipok and gpsok) end;
  if not tem_local then
    place := 'sem_verificacao'; ok := true;
  elsif ok then place := 'no_local';
  elsif need_gps and p_lat is null then place := 'sem_gps';
  else place := 'fora';
  end if;

  -- decide o status do registro
  if p_externo then
    if dia_externo then st := 'ok'; place := 'externo_autorizado';
    elsif externo_ok and length(trim(coalesce(p_motivo, ''))) >= 3 then st := 'pending'; place := 'externo';
    elsif externo_ok then return jsonb_build_object('ok', false, 'erro', 'Escreva o motivo do trabalho fora da empresa.');
    else return jsonb_build_object('ok', false, 'erro', 'Registro fora da empresa não está liberado.');
    end if;
  elsif verif = 'off' or place in ('no_local', 'sem_verificacao') then st := 'ok';
  elsif dia_externo then st := 'ok'; place := 'externo_autorizado';
  elsif verif = 'alert' then st := 'ok';
  else st := 'pending';
  end if;

  -- o servidor aprende o IP da empresa quando o GPS confirma o local
  if place = 'no_local' and gpsok and not ipok and ip is not null and aprender and metodo in ('any', 'both') then
    perform ip_aprender(e.owner, ip);
  end if;

  if p_device_ts is not null then skew := round(extract(epoch from (p_device_ts - agora)))::int; end if;

  insert into punches (emp_id, day, field, ts, status, place, motivo, ip, lat, lon, acc, dist_m, local_nome, device_ts, skew_sec)
  values (e.id, hoje, fld, agora, st, place, nullif(trim(coalesce(p_motivo, '')), ''), ip, p_lat, p_lon, p_acc,
          round(best_d)::int, best_n, p_device_ts, skew);

  return jsonb_build_object('ok', true, 'status', st, 'place', place, 'field', fld,
    'hora', to_char(agora at time zone 'America/Sao_Paulo', 'HH24:MI'), 'dist', round(best_d)::int);
end $$;

revoke all on function emp_get(uuid, date, date) from public;
revoke all on function emp_punch(uuid, float8, float8, float8, timestamptz, boolean, text) from public;
revoke all on function emp_perfil(uuid, jsonb) from public;
revoke all on function emp_aceite(uuid) from public;
revoke all on function emp_recibo(uuid, uuid, text, text) from public;
revoke all on function cfg_salvar(jsonb) from public;
revoke all on function ips_limpar() from public;
revoke all on function meu_ip() from public;
grant execute on function emp_get(uuid, date, date) to anon, authenticated;
grant execute on function emp_punch(uuid, float8, float8, float8, timestamptz, boolean, text) to anon, authenticated;
grant execute on function emp_perfil(uuid, jsonb) to anon, authenticated;
grant execute on function emp_aceite(uuid) to anon, authenticated;
grant execute on function emp_recibo(uuid, uuid, text, text) to anon, authenticated;
grant execute on function cfg_salvar(jsonb) to authenticated;
grant execute on function ips_limpar() to authenticated;
grant execute on function meu_ip() to authenticated;

-- -------------------------------------------- comprovantes de pagamento
-- Pasta privada: cada administrador só acessa a própria.
insert into storage.buckets (id, name, public) values ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;

drop policy if exists comprovantes_owner on storage.objects;
create policy comprovantes_owner on storage.objects for all to authenticated
  using (bucket_id = 'comprovantes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'comprovantes' and (storage.foldername(name))[1] = auth.uid()::text);

-- Documentos dos colaboradores (RG, comprovante de residência, atestados...): pasta privada.
insert into storage.buckets (id, name, public) values ('documentos', 'documentos', false)
on conflict (id) do nothing;

drop policy if exists documentos_owner on storage.objects;
create policy documentos_owner on storage.objects for all to authenticated
  using (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ------------------------------------------------ endurecimento (avisos do Supabase Advisor)
alter function haversine_m(float8, float8, float8, float8) set search_path = public;
alter function client_ip() set search_path = public;
alter function meu_ip() set search_path = public;
-- funções internas: ninguém precisa chamar pela internet
revoke all on function punches_sync() from public, anon, authenticated;
revoke all on function recibos_guard() from public, anon, authenticated;
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
