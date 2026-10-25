-- ==============================================================================
-- Mydobby Instant Demo Seed Script
-- Run this in Supabase Dashboard -> SQL Editor
-- It seeds realistic progress history & letters for your existing user!
-- ==============================================================================

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Grab the most recently registered user (or replace with your specific UID)
  SELECT id INTO target_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'No user found in auth.users. Please sign up in the app first!';
  ELSE
    -- 1. Seed or Update Profile
    INSERT INTO public.profiles (id, email, mind_dump, time_budget, energy_level, goal, messenger, updated_at)
    VALUES (
      target_user_id,
      (SELECT email FROM auth.users WHERE id = target_user_id),
      'I want to launch my project without burning out. Balancing work, learning AI skills, and staying calm.',
      '20 min',
      'medium',
      'Ship Mydobby Hackathon Project',
      'Phoenix',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      mind_dump = EXCLUDED.mind_dump,
      goal = EXCLUDED.goal,
      messenger = EXCLUDED.messenger;

    -- 2. Clear old demo data for clean demo
    DELETE FROM public.check_ins WHERE user_id = target_user_id;
    DELETE FROM public.letters WHERE user_id = target_user_id;

    -- 3. Seed Realistic Action Results (check_ins)
    INSERT INTO public.check_ins (user_id, title, status, date, created_at) VALUES
      (target_user_id, 'Drafted core user journey in spec.md', 'done', '10/22/2026', NOW() - INTERVAL '3 days'),
      (target_user_id, 'Organized project file structure & 3D models', 'done', '10/23/2026', NOW() - INTERVAL '2 days'),
      (target_user_id, 'Took a 10-minute quiet walk to clear mental fog', 'partial', '10/23/2026', NOW() - INTERVAL '1 day'),
      (target_user_id, 'Refined PostgreSQL schema and resolved reserved keywords', 'done', '10/24/2026', NOW() - INTERVAL '4 hours'),
      (target_user_id, 'Tested Supabase Auth and cloud sync flow', 'done', '10/24/2026', NOW() - INTERVAL '1 hour');

    -- 4. Seed Heartfelt Letters from Future Self (letters)
    INSERT INTO public.letters (user_id, type, title, body, summary, messenger, created_at) VALUES
      (
        target_user_id,
        'milestone',
        'A note from your future self',
        E'Dear you,\n\nI want you to remember this: you did not wait for perfect conditions. You kept moving with what was real.\n\nYou have already completed 5 meaningful actions toward shipping your dream project. That is not small. That is steady.\n\nThe reason this matters is not that you became flawless. It is that you kept returning to what actually mattered, even when your mind was loud.\n\nKeep honoring the quiet rhythm of your life. Your next chapter is built from these daily, honest steps.\n\nWith love,\nYour future self.',
        'A reflection on your steady courage and 5 completed steps.',
        'Owl',
        NOW() - INTERVAL '1 day'
      ),
      (
        target_user_id,
        'monthly',
        'Phoenix Letter: The Quiet Steps',
        E'Dear you,\n\nYou have been carrying a lot. The task is not to solve everything at once. It is to keep returning to the small, honest thing that matters.\n\nYou made room for quiet momentum, even when your mind felt full. You kept showing up with a little more clarity and a little more courage. That is the quiet work that changes a life.\n\nYou do not need a perfect plan. You need presence, gentleness, and a next step. Keep listening to what is truly important.\n\nWith care,\nYour future self.',
        'A phoenix arrives carrying your real progress through uncertainty.',
        'Phoenix',
        NOW()
      );

    RAISE NOTICE 'Successfully seeded demo data for user %!', target_user_id;
  END IF;
END $$;
