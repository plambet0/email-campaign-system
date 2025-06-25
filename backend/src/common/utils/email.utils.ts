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

    // Add tracking pixel before closing body tag
    const trackingPixel = `<img src="${backendUrl}/api/tracking/pixel/${trackingId}" width="1" height="1" style="display: none;" alt="">`;
    
    if (processedHtml.includes('</body>')) {
      processedHtml = processedHtml.replace('</body>', `${trackingPixel}</body>`);
    } else {
      processedHtml += trackingPixel;
    }

    // Add unsubscribe link
    const unsubscribeUrl = `${backendUrl}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;
    
    // Add GDPR footer if not present
    if (!processedHtml.includes('unsubscribe') && !processedHtml.includes('отписване')) {
      const gdprFooter = `
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
          <p><strong>Why are you receiving this email?</strong></p>
          <p>You are receiving this email because you have been a customer of our company or have signed up for our services.</p>
          <p>If you do not wish to receive any more emails from us, you can <a href="${unsubscribeUrl}" style="color: #007bff;">unsubscribe here</a>.</p>
          <p><small>According to GDPR, you have the right to access, correct and delete your personal data.</small></p>
        </div>
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