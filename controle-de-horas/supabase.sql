-- Controle de Horas: estrutura do banco no Supabase.
-- Como usar: Supabase > SQL Editor > New query > cole tudo > Run.

create extension if not exists pgcrypto;

-- Colaboradores. Cada empresa (conta de administrador) só vê os seus.
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),   -- link de acesso do colaborador
  data jsonb not null default '{}'::jsonb,                -- ficha: nome, função, regime, salário, escala...
  created_at timestamptz not null default now()
);

-- Horários de cada dia.
create table if not exists entries (
  emp_id uuid not null references employees(id) on delete cascade,
  day date not null,
  a text, b text, c text, d text,                         -- entrada/saída manhã, entrada/saída tarde
  t text not null default '',                             -- situação: '', folga, just, falta
  updated_at timestamptz not null default now(),
  primary key (emp_id, day)
);

-- Parâmetros da empresa (salário mínimo, feriados municipais).
create table if not exists company_settings (
  owner uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb
);

alter table employees enable row level security;
alter table entries enable row level security;
alter table company_settings enable row level security;

drop policy if exists emp_owner on employees;
create policy emp_owner on employees for all
  using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists ent_owner on entries;
create policy ent_owner on entries for all
  using (exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()))
  with check (exists (select 1 from employees e where e.id = emp_id and e.owner = auth.uid()));

drop policy if exists cfg_owner on company_settings;
create policy cfg_owner on company_settings for all
  using (owner = auth.uid()) with check (owner = auth.uid());

-- O colaborador não tem login: acessa pelo link (token).
-- Ele só consegue ler os próprios dados e gravar os horários de HOJE.

create or replace function emp_get(p_token uuid, p_from date, p_to date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  e employees;
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  dados jsonb;
begin
  select * into e from employees where token = p_token;
  if not found then return null; end if;
  dados := e.data - 'fgtsSaldo' - 'mediaExtras' - 'deslig' - 'motivo' - 'feriasGozadas';
  if coalesce(e.data->>'verValores', 'true') = 'false' then
    dados := dados - 'salario' - 'valorHora';
  end if;
  return jsonb_build_object(
    'id', e.id,
    'data', dados,
    'today', hoje,
    'today_entry', (select to_jsonb(x) from entries x where x.emp_id = e.id and x.day = hoje),
    'entries', coalesce((select jsonb_agg(to_jsonb(x) order by x.day) from entries x
                          where x.emp_id = e.id and x.day between p_from and p_to
                          and p_to - p_from <= 31), '[]'::jsonb),
    'settings', (select jsonb_build_object('feriados', s.data->'feriados') from company_settings s where s.owner = e.owner)
  );
end $$;

create or replace function emp_punch(p_token uuid, p_a text, p_b text, p_c text, p_d text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  e employees;
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v text;
begin
  select * into e from employees where token = p_token;
  if not found then return jsonb_build_object('ok', false, 'erro', 'Link inválido. Peça um novo ao responsável.'); end if;
  foreach v in array array[coalesce(p_a,''), coalesce(p_b,''), coalesce(p_c,''), coalesce(p_d,'')] loop
    if v <> '' and v !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
      return jsonb_build_object('ok', false, 'erro', 'Horário inválido.');
    end if;
  end loop;
  if not (coalesce(e.data->'dias', '[1,2,3,4,5,6]'::jsonb) @> to_jsonb(extract(dow from hoje)::int)) then
    return jsonb_build_object('ok', false, 'erro', 'Hoje não é um dia liberado na sua escala.');
  end if;
  insert into entries (emp_id, day, a, b, c, d)
  values (e.id, hoje, nullif(p_a,''), nullif(p_b,''), nullif(p_c,''), nullif(p_d,''))
  on conflict (emp_id, day) do update
    set a = excluded.a, b = excluded.b, c = excluded.c, d = excluded.d, updated_at = now();
  return jsonb_build_object('ok', true);
end $$;

revoke all on function emp_get(uuid, date, date) from public;
revoke all on function emp_punch(uuid, text, text, text, text) from public;
grant execute on function emp_get(uuid, date, date) to anon, authenticated;
grant execute on function emp_punch(uuid, text, text, text, text) to anon, authenticated;
