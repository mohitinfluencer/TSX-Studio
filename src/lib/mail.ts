import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendExportCompletedEmail(email: string, projectName: string, downloadUrl: string) {
    try {
        await resend.emails.send({
            from: 'TSX Studio <exports@tsxstudio.com>',
            to: email,
            subject: `Export Ready: ${projectName}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0B; color: #fff; padding: 40px; border-radius: 20px;">
          <h1 style="font-style: italic; font-weight: 900; letter-spacing: -0.05em;">TSX STUDIO</h1>
          <p style="color: #888; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 0.1em;">Production Pipeline</p>
          <h2 style="margin-top: 40px;">Your export is complete.</h2>
          <p style="color: #ccc; line-height: 1.6;">The rendering for <strong>${projectName}</strong> has finished successfully on our high-performance cluster.</p>
          <div style="margin-top: 40px;">
            <a href="${downloadUrl}" style="background: #fff; color: #000; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; font-style: italic;">Download MP4</a>
          </div>
          <p style="margin-top: 60px; font-size: 11px; color: #555;">&copy; 2026 TSX Studio. All rights reserved.</p>
        </div>
      `,
        });
    } catch (err) {
        console.error('Failed to send email:', err);
    }
}
