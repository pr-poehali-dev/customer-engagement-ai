-- Добавление пользователя AVT63 с админскими правами
INSERT INTO t_p3568014_customer_engagement_.users 
  (username, password_hash, email, phone, is_active, is_admin, created_at, salt)
VALUES 
  ('AVT63', 
   '2a5b5e02c3a4d0f8c9e1b3d7a6f4e8c1d2b9a7f5e3c8d6b4a2f9e7c5d3b1a8f6', 
   'avt63@system.local', 
   '+79277486868', 
   true, 
   true, 
   CURRENT_TIMESTAMP,
   'avt63_salt_2026');