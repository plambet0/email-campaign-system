const fs = require('fs');
const path = require('path');

const campaignsPath = path.join(
  __dirname,
  '..',
  'backend',
  'data',
  'campaigns.json'
);

function decodeMojibake(text) {
  return text
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â†’/g, '→')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â©/g, '©')
    .replace(/ðŸŽ¯/g, '')
    .replace(/ðŸ“©/g, '')
    .replace(/\u0000/g, '');
}

function extract(html) {
  const decoded = decodeMojibake(html);
  const hrefMatch = decoded.match(
    /href="(https?:\/\/(?:www\.)?[^"]+)"/i
  );
  const imgMatch = decoded.match(
    /src="(https?:\/\/i\.imgur\.com\/[^"]+)"/i
  );
  const brandMatch =
    decoded.match(/valued user at <strong>([^<]+)<\/strong>/i) ||
    decoded.match(/©\s*20\d{2}\s*([^–\-]+)/i);
  const h2Match = decoded.match(/<h2>([^<]+)<\/h2>/i);
  const offerMatch = decoded.match(
    /<p><strong>(Buy 10 Days[^<]*)<\/strong><\/p>/i
  );

  let brand = brandMatch ? brandMatch[1].trim() : '';
  brand = brand.replace(/\s*All rights reserved\.?/i, '').trim();

  let siteUrl = hrefMatch ? hrefMatch[1] : '';
  if (siteUrl && !siteUrl.endsWith('/')) {
    // keep as-is for CTA
  }

  return {
    siteUrl: siteUrl || 'https://example.com/',
    heroImg: imgMatch ? imgMatch[1] : '',
    brand: brand || 'Our Service',
    headline: h2Match
      ? h2Match[1].replace(/^[^\w\s]+/, '').trim()
      : 'Get 20 Days for the Price of 10!',
    offerLine: offerMatch
      ? offerMatch[1]
      : 'Buy 10 Days → Get 20 Days Access',
  };
}

function buildEmailHtml({ siteUrl, heroImg, brand, headline, offerLine }) {
  const brandDisplay = brand.replace(/\.com$/i, (m) => m); // keep
  const year = 2026;
  const heroBlock = heroImg
    ? `
          <tr>
            <td align="center" bgcolor="#fff8dc" style="padding:0;background-color:#fff8dc;">
              <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                <img src="${heroImg}" width="600" alt="${brandDisplay}" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;" />
              </a>
            </td>
          </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${brandDisplay} – Comeback Offer</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f2f4f7; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f2f4f7;width:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Exclusive comeback offer: ${offerLine}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f4f7;margin:0;padding:0;width:100%;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:10px;overflow:hidden;">
${heroBlock}
          <tr>
            <td align="center" class="mobile-padding" style="padding:30px 20px;font-family:Arial, Helvetica, sans-serif;color:#000000;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#FFD700" style="border-radius:30px;background-color:#FFD700;">
                    <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 30px;font-family:Arial, Helvetica, sans-serif;font-size:16px;font-weight:bold;color:#000000;text-decoration:none;border-radius:30px;">
                      GET ACCESS
                    </a>
                  </td>
                </tr>
              </table>
              <h2 style="margin:24px 0 12px;font-family:Arial, Helvetica, sans-serif;font-size:22px;line-height:1.3;color:#e6b800;font-weight:bold;">
                ${headline}
              </h2>
              <p style="margin:0 0 10px;font-family:Arial, Helvetica, sans-serif;font-size:16px;line-height:1.5;color:#000000;">
                You were a valued user at <strong>${brandDisplay}</strong>.
              </p>
              <p style="margin:0 0 10px;font-family:Arial, Helvetica, sans-serif;font-size:16px;line-height:1.5;color:#000000;">
                <strong>${offerLine}</strong>
              </p>
              <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:16px;line-height:1.5;color:#000000;">
                More value. More wins. No risk.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" class="mobile-padding" style="padding:0 20px 10px;font-family:Arial, Helvetica, sans-serif;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="stack-column" width="33.33%" align="center" valign="top" style="padding:12px 8px;font-family:Arial, Helvetica, sans-serif;">
                    <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" width="50" height="50" alt="Reply" style="display:block;margin:0 auto 10px;width:50px;height:50px;border:0;" />
                    <p style="margin:0;font-size:14px;line-height:1.4;color:#000000;">Reply to this email</p>
                  </td>
                  <td class="stack-column" width="33.33%" align="center" valign="top" style="padding:12px 8px;font-family:Arial, Helvetica, sans-serif;">
                    <img src="https://cdn-icons-png.flaticon.com/512/992/992651.png" width="50" height="50" alt="Buy" style="display:block;margin:0 auto 10px;width:50px;height:50px;border:0;" />
                    <p style="margin:0;font-size:14px;line-height:1.4;color:#000000;">Buy 10 Days Access</p>
                  </td>
                  <td class="stack-column" width="33.33%" align="center" valign="top" style="padding:12px 8px;font-family:Arial, Helvetica, sans-serif;">
                    <img src="https://cdn-icons-png.flaticon.com/512/4213/4213958.png" width="50" height="50" alt="Bonus" style="display:block;margin:0 auto 10px;width:50px;height:50px;border:0;" />
                    <p style="margin:0;font-size:14px;line-height:1.4;color:#000000;">We Give You 10 More</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="mobile-padding" style="padding:20px;font-family:Arial, Helvetica, sans-serif;color:#000000;">
              <p style="margin:0;font-size:16px;line-height:1.5;">
                <strong>Interested?</strong> Just reply with "I want the offer" and we'll activate it for you!
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px;font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:1.4;color:#777777;">
              © ${year} ${brandDisplay} – All rights reserved.<br />
              <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="color:#777777;text-decoration:underline;">${siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a><br /><br />
              If you no longer wish to receive these emails, you can
              <a href="{{unsubscribe_url}}" target="_blank" rel="noopener noreferrer" style="color:#777777;text-decoration:underline;">unsubscribe here</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const campaigns = JSON.parse(fs.readFileSync(campaignsPath, 'utf8'));
const backupPath = campaignsPath.replace(
  'campaigns.json',
  `campaigns.backup-${Date.now()}.json`
);
fs.writeFileSync(backupPath, JSON.stringify(campaigns, null, 2));

const updated = campaigns.map((campaign) => {
  const meta = extract(campaign.htmlTemplate || '');
  return {
    ...campaign,
    htmlTemplate: buildEmailHtml(meta),
  };
});

fs.writeFileSync(campaignsPath, JSON.stringify(updated, null, 2));

console.log(`Updated ${updated.length} campaigns`);
console.log(`Backup: ${backupPath}`);
updated.forEach((c) => {
  const meta = extract(c.htmlTemplate);
  console.log(`- ${c.name}: ${meta.brand} | ${meta.siteUrl}`);
});
