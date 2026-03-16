// Seed script - generates seed SQL with hashed passwords
// Usage: npx tsx seed.ts > seed-hashed.sql

const ITERATIONS = 100000;
const KEY_LENGTH = 256;

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH
  );
  return `${bufferToBase64(salt.buffer)}:${bufferToBase64(hash)}`;
}

async function main() {
  const hashedPassword = await hashPassword('demo1234');

  const sql = `-- Seed data (password: demo1234, hashed with PBKDF2-SHA256)
INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', '${hashedPassword}');

INSERT OR IGNORE INTO sites (name, address, short_url, checklist_items) VALUES (
  '인천 남동 아파트 신축공사',
  '인천광역시 남동구 구월동 123-45',
  'incheon1',
  '["안전모 착용 확인","안전화 착용 확인","안전벨트 착용 확인","작업 전 장비 점검","소화기 비치 확인","작업구역 정리정돈","위험표지판 설치 확인","안전난간 설치 확인"]'
);

INSERT OR IGNORE INTO workers (name, phone, site_id) VALUES ('김철수', '010-1234-5678', 1);
INSERT OR IGNORE INTO workers (name, phone, site_id) VALUES ('박영희', '010-2345-6789', 1);
INSERT OR IGNORE INTO workers (name, phone, site_id) VALUES ('이민호', '010-3456-7890', 1);
`;

  console.log(sql);
}

main();
