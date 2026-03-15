INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', 'demo1234');

INSERT OR IGNORE INTO sites (name, address, short_url, checklist_items) VALUES (
  '인천 남동 아파트 신축공사',
  '인천광역시 남동구 구월동 123-45',
  'incheon1',
  '["안전모 착용 확인","안전화 착용 확인","안전벨트 착용 확인","작업 전 장비 점검","소화기 비치 확인","작업구역 정리정돈","위험표지판 설치 확인","안전난간 설치 확인"]'
);

INSERT OR IGNORE INTO workers (name, phone, site_id) VALUES ('김철수', '010-1234-5678', 1);
INSERT OR IGNORE INTO workers (name, phone, site_id) VALUES ('박영희', '010-2345-6789', 1);
INSERT OR IGNORE INTO workers (name, phone, site_id) VALUES ('이민호', '010-3456-7890', 1);
