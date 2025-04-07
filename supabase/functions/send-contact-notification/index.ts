
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { id, name, email, subject, message }: ContactMessage = await req.json();

    // Send notification email to the site owner
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "site-admin@example.com";
    
    const adminEmailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h2>Message:</h2>
        <p>${message}</p>
        <hr>
        <p>You can view all messages in your admin dashboard.</p>
      `,
    });

    // Send confirmation email to the submitter
    const userEmailResponse = await resend.emails.send({
      from: "Your Website <onboarding@resend.dev>",
      to: [email],
      subject: "We've received your message",
      html: `
        <h1>Thank you for contacting us, ${name}!</h1>
        <p>We have received your message regarding "${subject}" and will get back to you as soon as possible.</p>
        <p>For your records, here is what you sent us:</p>
        <blockquote>${message}</blockquote>
        <p>Best regards,<br>The Team</p>
      `,
    });

    console.log("Email notifications sent:", { adminEmailResponse, userEmailResponse });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
