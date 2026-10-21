import { v4 as uuidv4 } from 'uuid';

export const emailUtils = {
  processEmailTemplate(
    htmlTemplate: string,
    recipientEmail: string,
    trackingId: string,
    unsubscribeToken: string,
    backendUrl: string,
  ): string {
    let processedHtml = htmlTemplate;

    // Add tracking pixel before closing body tag (email-safe 1x1)
    const trackingPixel = `<img src="${backendUrl}/api/tracking/pixel/${trackingId}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;line-height:1px;font-size:1px;max-height:1px;max-width:1px;opacity:0;" />`;

    if (processedHtml.includes('</body>')) {
      processedHtml = processedHtml.replace('</body>', `${trackingPixel}</body>`);
    } else {
      processedHtml += trackingPixel;
    }

    // Add unsubscribe link
    const unsubscribeUrl = `${backendUrl}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;

    // Add GDPR footer if not present
    if (
      !processedHtml.includes('unsubscribe') &&
      !processedHtml.includes('отписване') &&
      !processedHtml.includes('{{unsubscribe_url}}')
    ) {
      const gdprFooter = `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:30px;">
          <tr>
            <td style="padding:20px;background-color:#f8f9fa;border:1px solid #dee2e6;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.4;color:#6c757d;">
              <p style="margin:0 0 8px;"><strong>Why are you receiving this email?</strong></p>
              <p style="margin:0 0 8px;">You are receiving this email because you have been a customer of our company or have signed up for our services.</p>
              <p style="margin:0 0 8px;">If you do not wish to receive any more emails from us, you can <a href="${unsubscribeUrl}" style="color:#007bff;text-decoration:underline;">unsubscribe here</a>.</p>
              <p style="margin:0;"><small>According to GDPR, you have the right to access, correct and delete your personal data.</small></p>
            </td>
          </tr>
        </table>
      `;

      if (processedHtml.includes('</body>')) {
        processedHtml = processedHtml.replace('</body>', `${gdprFooter}</body>`);
      } else {
        processedHtml += gdprFooter;
      }
    } else {
      // Replace existing unsubscribe links
      processedHtml = processedHtml.replace(
        /\{\{unsubscribe_url\}\}/g,
        unsubscribeUrl,
      );
    }

    // Replace email placeholder
    processedHtml = processedHtml.replace(/\{\{email\}\}/g, recipientEmail);

    return processedHtml;
  },

  extractSubjectFromTemplate(htmlTemplate: string): string | null {
    const titleMatch = htmlTemplate.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    const h1Match = htmlTemplate.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].trim();
    }

    return null;
  },

  validateEmailList(emails: string[]): { valid: string[]; invalid: string[] } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid: string[] = [];
    const invalid: string[] = [];

    emails.forEach(email => {
      const trimmedEmail = email.trim().toLowerCase();
      if (emailRegex.test(trimmedEmail)) {
        valid.push(trimmedEmail);
      } else if (trimmedEmail) {
        invalid.push(trimmedEmail);
      }
    });

    return { valid: [...new Set(valid)], invalid };
  },
};