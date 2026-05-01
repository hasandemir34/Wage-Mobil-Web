-- Create profiles table
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text check (role in ('admin', 'worker')),
  base_wage numeric default 0
);

-- Create attendance table
CREATE TABLE public.attendance (
  id uuid default gen_random_uuid() primary key,
  worker_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent')) not null,
  overtime_hours numeric default 0,
  multiplier numeric default 1.5
);

-- Create advances table
CREATE TABLE public.advances (
  id uuid default gen_random_uuid() primary key,
  worker_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null,
  date date not null,
  description text
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by admin."
  ON public.profiles FOR SELECT
  USING ( auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') );

CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Admins can insert/update profiles."
  ON public.profiles FOR ALL
  USING ( auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') );

-- Attendance Policies
CREATE POLICY "Admins can view all attendance."
  ON public.attendance FOR SELECT
  USING ( auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') );

CREATE POLICY "Workers can view their own attendance."
  ON public.attendance FOR SELECT
  USING ( auth.uid() = worker_id );

CREATE POLICY "Admins can manage attendance."
  ON public.attendance FOR ALL
  USING ( auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') );

-- Advances Policies
CREATE POLICY "Admins can view all advances."
  ON public.advances FOR SELECT
  USING ( auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') );

CREATE POLICY "Workers can view their own advances."
  ON public.advances FOR SELECT
  USING ( auth.uid() = worker_id );

CREATE POLICY "Admins can manage advances."
  ON public.advances FOR ALL
  USING ( auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin') );
