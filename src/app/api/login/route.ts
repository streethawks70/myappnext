// /app/api/login/route.ts
export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const email = searchParams.get("email");
      const password = searchParams.get("password");
  
      console.log("Login API called with:", { email, password });
  
      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Missing credentials" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      const url = `https://script.google.com/macros/s/AKfycby2Xv5Oa_t9DIrglpqVMS8yjZtX4pejIamTeH0AoabFSIPEdIU51cuO0hpSVXUC9l5X/exec?email=${encodeURIComponent(
        email
      )}&password=${encodeURIComponent(password)}`;
  
      const res = await fetch(url);
  
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Errore chiamata script" }),
          { status: res.status, headers: { "Content-Type": "application/json" } }
        );
      }
  
      const data = await res.json();
  
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
  
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Errore API login:", error);
      return new Response(
        JSON.stringify({ error: "Errore chiamata script" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
  