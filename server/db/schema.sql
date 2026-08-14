-- PostgreSQL schema for Wallet & Spend Analysis
-- Run this in your PostgreSQL database to set up the tables.

-- Categories table
create table if not exists categories (
  id text primary key,
  name text not null,
  amount numeric not null default 0,
  color text not null,
  bg_hex text not null,
  icon text not null,
  type text
);

-- Users table (unique per email)
create table if not exists users (
  id text primary key,
  email text not null unique,
  name text not null,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  login_count integer not null default 0
);

-- Transactions table
create table if not exists transactions (
  id text primary key,
  title text not null,
  category_id text not null references categories(id) on delete cascade,
  category_name text not null,
  date text not null,
  raw_date date not null,
  amount numeric not null,
  payment_method text not null,
  icon_url text,
  notes text,
  created_at timestamptz not null default now()
);

-- Index for fast date-ordered queries
create index if not exists idx_transactions_raw_date on transactions (raw_date desc);

-- Seed categories
insert into categories (id, name, amount, color, bg_hex, icon) values
  ('groceries', 'Groceries', 1245.30, '#9466ff', '#9c27b0', 'shopping_bag'),
  ('transport', 'Transport', 540.00, '#2170e4', '#2196f3', 'directions_car'),
  ('entertainment', 'Entertainment', 600.00, '#27AE60', '#4caf50', 'event'),
  ('rent', 'Rent & Utilities', 1080.50, '#F39C12', '#ff9800', 'home')
on conflict (id) do nothing;

-- Seed a couple of transactions
insert into transactions (id, title, category_id, category_name, date, raw_date, amount, payment_method) values
  ('t-1', 'Supermart Groceries', 'groceries', 'Groceries', 'Sep 14, 2025', '2025-09-14', 52.30, 'Card •••• 1234'),
  ('t-2', 'Fresh Bakery', 'groceries', 'Groceries', 'Sep 13, 2025', '2025-09-13', -30.45, 'Paid with Visa')
on conflict (id) do nothing;
