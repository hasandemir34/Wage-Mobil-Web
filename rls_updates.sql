-- DEPRECATED: DO NOT RUN THIS FILE.
-- The profiles.role column no longer exists. Role is now in work_plan_members.
-- Use supabase_migration_final.sql instead.

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by admin." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert/update profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all attendance." ON public.attendance;
DROP POLICY IF EXISTS "Workers can view their own attendance." ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage attendance." ON public.attendance;
DROP POLICY IF EXISTS "Admins can view all advances." ON public.advances;
DROP POLICY IF EXISTS "Workers can view their own advances." ON public.advances;
DROP POLICY IF EXISTS "Admins can manage advances." ON public.advances;

-- 1. Profiles Policies
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- 2. Attendance Policies
CREATE POLICY "Admins can manage all attendance"
ON public.attendance FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Workers can view their own attendance"
ON public.attendance FOR SELECT
USING ( auth.uid() = worker_id );

-- 3. Advances Policies
CREATE POLICY "Admins can manage all advances"
ON public.advances FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Workers can view their own advances"
ON public.advances FOR SELECT
USING ( auth.uid() = worker_id );
