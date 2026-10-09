import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "JN MATES <resend@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Error enviando email:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("Email enviado a:", to);
    return NextResponse.json({ success: true, data });

    if (error) {
      console.error("Error enviando email:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("Email enviado a:", to);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error en send-email:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
