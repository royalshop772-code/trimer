export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const RESEND_KEY = process.env.RESEND_KEY;
  const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
  const AIRTABLE_BASE = process.env.AIRTABLE_BASE;

  let data;
  try {
    data = await request.json();
  } catch(e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { ime, telefon, grad, adresa } = data;
  const vrijemeNarudzbe = new Date().toLocaleString("bs-BA", { timeZone: "Europe/Sarajevo" });
  const proizvod = "Motorni Trimer 5.2 KS";

  try {
    // 1. Airtable
    await fetch("https://api.airtable.com/v0/" + AIRTABLE_BASE + "/Royal%20shop%20narudzbe", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + AIRTABLE_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: {
        "Ime": ime,
        "Telefon": telefon,
        "Grad": grad,
        "Adresa": adresa,
        "Proizvod": proizvod,
        "Cijena": "129,90 KM",
        "Dostava": "Besplatna",
        "Vrijeme": vrijemeNarudzbe,
        "Status": "Nova"
      }})
    });

    // 2. Resend email
    const emailHtml = "<div style='font-family:Arial,sans-serif;max-width:500px;padding:24px;background:#f9f9f9;border-radius:12px;'>"
      + "<h2 style='color:#F26522;'>🛒 Nova narudžba - Royal Shop</h2>"
      + "<p><b>Ime:</b> " + ime + "</p>"
      + "<p><b>Telefon:</b> " + telefon + "</p>"
      + "<p><b>Grad:</b> " + grad + "</p>"
      + "<p><b>Adresa:</b> " + adresa + "</p>"
      + "<hr style='border:1px solid #eee;margin:16px 0;'/>"
      + "<p><b>Proizvod:</b> <span style='color:#F26522;'>" + proizvod + "</span></p>"
      + "<p><b>Cijena:</b> 129,90 KM</p>"
      + "<p><b>Dostava:</b> Besplatna</p>"
      + "<p><b>Plaćanje:</b> Pouzećem</p>"
      + "<hr style='border:1px solid #eee;margin:16px 0;'/>"
      + "<p><b>Vrijeme narudžbe:</b> " + vrijemeNarudzbe + "</p>"
      + "<p style='background:#F26522;color:white;padding:10px 16px;border-radius:6px;font-weight:bold;'>Status: NOVA ✓</p>"
      + "</div>";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: ["royalshop772@gmail.com"],
        subject: "🛒 Nova narudžba - " + proizvod + " - " + ime + " (" + grad + ")",
        html: emailHtml
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch(err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = {
  path: "/api/order"
};
