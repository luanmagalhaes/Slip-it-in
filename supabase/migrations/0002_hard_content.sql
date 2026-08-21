alter table rooms
  add column if not exists hard_content_enabled boolean not null default false;
