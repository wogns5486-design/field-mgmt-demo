CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  short_url TEXT NOT NULL UNIQUE,
  checklist_items TEXT NOT NULL DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  site_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  worker_id INTEGER NOT NULL,
  checklist_data TEXT NOT NULL DEFAULT '{}',
  text_note TEXT DEFAULT '',
  photos TEXT NOT NULL DEFAULT '[]',
  submitted_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submissions_site ON submissions(site_id);
CREATE INDEX IF NOT EXISTS idx_submissions_worker ON submissions(worker_id);
CREATE INDEX IF NOT EXISTS idx_sites_short_url ON sites(short_url);
CREATE INDEX IF NOT EXISTS idx_workers_site ON workers(site_id);
