-- 1. Tabloları Temizle
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.advances CASCADE;
DROP TABLE IF EXISTS public.work_plan_members CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Profiller (Global Kullanıcı Verileri)
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint username_format check (username ~* '^[a-z0-9_]+$')
);

-- 3. İş Planları (Projeler/Şantiyeler)
CREATE TABLE public.work_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. İş Planı Üyeleri (Multi-Tenant İlişkisi)
CREATE TABLE public.work_plan_members (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.work_plans(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'worker')) not null,
  base_daily_wage numeric default 0,
  full_name text, -- Görünen isim (Profille aynı olabilir ama plana özel de tutulabilir)
  unique(plan_id, user_id)
);

-- 4. Davetiyeler (E-posta istemeden işçi eklemek için)
CREATE TABLE public.invitations (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.work_plans(id) on delete cascade not null,
  token uuid default gen_random_uuid() unique not null,
  worker_name text not null,
  base_daily_wage numeric not null,
  status text check (status in ('pending', 'accepted')) default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Yevmiye (Attendance)
CREATE TABLE public.attendance (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.work_plans(id) on delete cascade not null,
  worker_id uuid references auth.users on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent', 'half_day')) not null,
  overtime_hours numeric default 0,
  multiplier numeric default 1.5,
  unique(plan_id, worker_id, date)
);

-- 6. Avanslar
CREATE TABLE public.advances (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.work_plans(id) on delete cascade not null,
  worker_id uuid references auth.users on delete cascade not null,
  amount numeric not null,
  date date not null,
  description text
);

-- RLS (ROW LEVEL SECURITY) AYARLARI
ALTER TABLE public.work_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_plan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Herkes birbirinin ismini ve kullanıcı adını görebilir.
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
FOR SELECT USING ( true );

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING ( auth.uid() = id );

-- Politikalar: Kullanıcı sadece ÜYESİ olduğu iş planının verilerini görebilir.

-- Work Plans: Üyeler görebilir, Oluşturan yönetebilir.
CREATE POLICY "Users can view work plans they are members of" ON public.work_plans
FOR SELECT USING ( EXISTS ( SELECT 1 FROM public.work_plan_members WHERE plan_id = public.work_plans.id AND user_id = auth.uid() ) );

CREATE POLICY "Users can create work plans" ON public.work_plans FOR INSERT WITH CHECK ( auth.uid() = created_by );

-- Work Plan Members: Üyeler birbirini görebilir.
CREATE POLICY "Members can view other members in the same plan" ON public.work_plan_members
FOR SELECT USING ( EXISTS ( SELECT 1 FROM public.work_plan_members m2 WHERE m2.plan_id = public.work_plan_members.plan_id AND m2.user_id = auth.uid() ) );

-- Attendance & Advances: Admin her şeyi yapar, Worker sadece kendi verisini görür.
CREATE POLICY "Admins manage all data in their plan" ON public.attendance
FOR ALL USING ( EXISTS ( SELECT 1 FROM public.work_plan_members WHERE plan_id = public.attendance.plan_id AND user_id = auth.uid() AND role = 'admin' ) );

CREATE POLICY "Workers view their own attendance in plan" ON public.attendance
FOR SELECT USING ( worker_id = auth.uid() );

CREATE POLICY "Admins manage all advances in their plan" ON public.advances
FOR ALL USING ( EXISTS ( SELECT 1 FROM public.work_plan_members WHERE plan_id = public.advances.plan_id AND user_id = auth.uid() AND role = 'admin' ) );

CREATE POLICY "Workers view their own advances in plan" ON public.advances
FOR SELECT USING ( worker_id = auth.uid() );

-- Invitations: Sadece plan adminleri davetiye oluşturabilir.
CREATE POLICY "Admins manage invitations" ON public.invitations
FOR ALL USING ( EXISTS ( SELECT 1 FROM public.work_plan_members WHERE plan_id = public.invitations.plan_id AND user_id = auth.uid() AND role = 'admin' ) );

CREATE POLICY "Public can view invitation by token" ON public.invitations
FOR SELECT USING ( true );

-- 7. Audit & Integrity Updates
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS accepted_by uuid REFERENCES auth.users(id);

-- İşveren işçiyi ekler eklemez ghost kullanıcı oluşturulur ve bu kolona kaydedilir.
-- İşçi davet linkiyle hesabını aktifleştirince ghost kullanıcı gerçek bilgilerle güncellenir.
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.attendance
  ADD CONSTRAINT no_overtime_when_absent
  CHECK (NOT (status = 'absent' AND overtime_hours > 0));

-- Performans İndeksleri
-- attendance: plan bazlı toplu sorgular ve işçi bazlı filtreleme için
CREATE INDEX IF NOT EXISTS idx_attendance_plan_id ON public.attendance(plan_id);
CREATE INDEX IF NOT EXISTS idx_attendance_plan_worker ON public.attendance(plan_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_attendance_plan_date ON public.attendance(plan_id, date);

-- advances: plan bazlı toplu sorgular ve işçi bazlı filtreleme için
CREATE INDEX IF NOT EXISTS idx_advances_plan_id ON public.advances(plan_id);
CREATE INDEX IF NOT EXISTS idx_advances_plan_worker ON public.advances(plan_id, worker_id);

-- work_plan_members: kullanıcı ve rol bazlı filtreleme için
CREATE INDEX IF NOT EXISTS idx_wpm_plan_role ON public.work_plan_members(plan_id, role);
CREATE INDEX IF NOT EXISTS idx_wpm_user_id ON public.work_plan_members(user_id);

-- invitations: plan + status bazlı filtreleme için
CREATE INDEX IF NOT EXISTS idx_invitations_plan_status ON public.invitations(plan_id, status);
