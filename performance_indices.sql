-- PERFORMANS İYİLEŞTİRME İNDEKSLERİ
-- Bu indeksler sorguların (özellikle plan_id ve date bazlı olanların) çok daha hızlı çalışmasını sağlar.

-- 1. Attendance Tablosu İndeksleri
CREATE INDEX IF NOT EXISTS idx_attendance_plan_date ON public.attendance(plan_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_worker_id ON public.attendance(worker_id);

-- 2. Advances Tablosu İndeksleri
CREATE INDEX IF NOT EXISTS idx_advances_plan_date ON public.advances(plan_id, date);
CREATE INDEX IF NOT EXISTS idx_advances_worker_id ON public.advances(worker_id);

-- 3. Work Plan Members İndeksleri
CREATE INDEX IF NOT EXISTS idx_wp_members_plan_id ON public.work_plan_members(plan_id);
CREATE INDEX IF NOT EXISTS idx_wp_members_user_id ON public.work_plan_members(user_id);

-- 4. Invitations İndeksleri
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_plan_id ON public.invitations(plan_id);
