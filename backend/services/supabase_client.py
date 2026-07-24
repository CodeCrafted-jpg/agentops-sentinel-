import os
from supabase import create_client, Client

supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    supabase_client = None
else:
    try:
        supabase_client = create_client(supabase_url, supabase_key)
    except Exception:
        supabase_client = None
