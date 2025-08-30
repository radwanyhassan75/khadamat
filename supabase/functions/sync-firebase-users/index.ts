import { serve } from "std/http/server.ts";
import { createClient } from "supabase-js";

// قيم Supabase مباشرة
const supabaseUrl = "https://dlzmyxsycjzedhuqzvpg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsem15eHN5Y2p6ZWRodXF6dnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE1Mjk4MCwiZXhwIjoyMDcxNzI4OTgwfQ.H8C8-qebsdFJzYvMcRE8_I5ooeqXtWggffNg_Ii7WgU";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async () => {
  try {
    // Firebase API Key مباشر
    const firebaseApiKey = "AIzaSyBfuVxOgengj2b1JBdt9V3u5WAnyYWsd78";

    // جلب المستخدمين من Firebase REST API
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:batchGet?key=${firebaseApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxResults: 1000 }),
      }
    );

    const data = await res.json();
    const firebaseUsers = data.users || [];

    // تهيئة البيانات للمزامنة مع جدول users
    type FirebaseUser = {
      localId: string;
      email: string;
      customAttributes?: string;
      createdAt: string;
      [key: string]: any;
    };

    const usersToSync = (firebaseUsers as FirebaseUser[])
      .filter((u: FirebaseUser) => u.customAttributes !== "admin")
      .map((u: FirebaseUser) => ({
        id: u.localId,
        email: u.email,
        role: "user",
        raw_user_meta_data: u,
        created_at: new Date(parseInt(u.createdAt)).toISOString(),
      }));

    // مزامنة كل المستخدمين في جدول Supabase
    for (const user of usersToSync) {
      const { error } = await supabase.from("users").upsert(user, {
        onConflict: ["id"],
      });
      if (error) console.error("Supabase upsert error:", error.message);
    }

    return new Response(
      JSON.stringify({ message: `تمت مزامنة ${usersToSync.length} مستخدم.` }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
