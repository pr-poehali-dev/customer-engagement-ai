-- Добавляем поле notes для хранения ИИ-анализа звонков
ALTER TABLE calls ADD COLUMN IF NOT EXISTS notes TEXT;