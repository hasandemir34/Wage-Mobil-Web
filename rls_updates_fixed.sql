-- 1. Önce hatalı politikaları temizleyelim
DROP POLICY IF EXISTS "Users can view work plans they are members of" ON public.work_plans;
DROP POLICY IF EXISTS "Users can create work plans" ON public.work_plans;
DROP POLICY IF EXISTS "Members can view other members in the same plan" ON public.work_plan_members;
DROP POLICY IF EXISTS "Admins manage all data in their plan" ON public.attendance;
DROP POLICY IF EXISTS "Admins manage all advances in their plan" ON public.advances;
DROP POLICY IF EXISTS "Admins manage invitations" ON public.invitations;

-- 2. Döngüyü kırmak için yardımcı fonksiyonlar (SECURITY DEFINER ile RLS'yi baypas ederler)
CREATE OR REPLACE FUNCTION public.is_plan_member(p_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.work_plan_members
    WHERE plan_id = p_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_plan_admin(p_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.work_plan_members
    WHERE plan_id = p_id AND user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. YENİ GÜVENLİ POLİTİKALAR

-- Work Plans: Sadece üye olanlar görebilir.
CREATE POLICY "work_plans_select_policy" ON public.work_plans
FOR SELECT USING ( created_by = auth.uid() OR public.is_plan_member(id) );

CREATE POLICY "work_plans_insert_policy" ON public.work_plans
FOR INSERT WITH CHECK ( auth.uid() = created_by );

-- Work Plan Members: 
-- Herkes kendi üyeliğini görebilir. 
-- Adminler planındaki herkesi görebilir.
CREATE POLICY "work_plan_members_select_policy" ON public.work_plan_members
FOR SELECT USING ( 
  user_id = auth.uid() OR public.is_plan_admin(plan_id)
);

-- Attendance: Sadece adminler yönetebilir, işçiler sadece kendininkini görebilir.
CREATE POLICY "attendance_admin_policy" ON public.attendance
FOR ALL USING ( public.is_plan_admin(plan_id) );

CREATE POLICY "attendance_worker_select_policy" ON public.attendance
FOR SELECT USING ( worker_id = auth.uid() );

-- Advances: Sadece adminler yönetebilir, işçiler sadece kendininkini görebilir.
CREATE POLICY "advances_admin_policy" ON public.advances
FOR ALL USING ( public.is_plan_admin(plan_id) );

CREATE POLICY "advances_worker_select_policy" ON public.advances
FOR SELECT USING ( worker_id = auth.uid() );

-- Invitations: Sadece adminler yönetebilir.
CREATE POLICY "invitations_admin_policy" ON public.invitations
FOR ALL USING ( public.is_plan_admin(plan_id) );

CREATE POLICY "invitations_public_select" ON public.invitations
FOR SELECT USING ( true );
