import nodemailer from 'nodemailer';
import { ENV } from '../_core/env';

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: ENV.smtpHost,
  port: parseInt(ENV.smtpPort || '587'),
  secure: ENV.smtpPort === '465', // true for 465, false for other ports
  auth: {
    user: ENV.smtpUser,
    pass: ENV.smtpPassword,
  },
});

// Verify connection on startup
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error('[Email Service] SMTP connection failed:', error);
  } else if (success) {
    console.log('[Email Service] SMTP connection successful');
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: `${ENV.smtpFromName} <${ENV.smtpFromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email Service] Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    return false;
  }
}

export async function sendCustomerConfirmation(
  customerEmail: string,
  customerName: string,
  commodityType: string,
  quantity: string,
  unit: string,
  referenceNumber: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%); color: white; padding: 30px 20px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .header h1 { font-size: 28px; margin-top: 10px; }
          .content { padding: 30px 20px; }
          .greeting { font-size: 16px; margin-bottom: 20px; line-height: 1.6; }
          .reference-box { background-color: #f9f9f9; border-left: 4px solid #b8860b; padding: 15px; margin: 20px 0; border-radius: 3px; }
          .reference-box .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
          .reference-box .value { font-size: 18px; font-weight: bold; color: #b8860b; margin-top: 5px; font-family: monospace; }
          .details { margin: 25px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; width: 40%; }
          .detail-value { color: #333; width: 60%; text-align: right; }
          .info-box { background-color: #f0f8ff; border: 1px solid #b8d4e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .info-box p { margin: 5px 0; font-size: 14px; line-height: 1.5; }
          .contact-info { background-color: #fafafa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .contact-info p { margin: 8px 0; font-size: 14px; }
          .contact-info strong { color: #b8860b; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #999; }
          .footer p { margin: 5px 0; }
          .divider { height: 1px; background-color: #eee; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌾 HARVEST COMMODITIES</div>
            <h1>Quote Request Confirmed</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Dear <strong>${customerName}</strong>,</p>
            
            <p>Thank you for choosing Harvest Commodities for your commodity sourcing needs. We have successfully received your quote request and appreciate your interest in our products and services.</p>
            
            <div class="reference-box">
              <div class="label">Your Reference Number</div>
              <div class="value">${referenceNumber}</div>
            </div>
            
            <p>Please keep this reference number for your records. You can use it to track your quote request and for any future correspondence with our team.</p>
            
            <h3 style="color: #b8860b; margin-top: 25px; margin-bottom: 15px;">Quote Details</h3>
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Commodity Type</span>
                <span class="detail-value"><strong>${commodityType}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity Requested</span>
                <span class="detail-value"><strong>${quantity} ${unit}</strong></span>
              </div>
            </div>
            
            <div class="info-box">
              <p><strong>What Happens Next?</strong></p>
              <p>Our experienced sourcing team will review your requirements and prepare a competitive quote tailored to your specific needs. We typically respond within 24 hours during business days.</p>
            </div>
            
            <div class="contact-info">
              <p><strong>Need to Reach Us?</strong></p>
              <p><strong>Email:</strong> jericho.ang@theharvestman.com</p>
              <p><strong>Website:</strong> www.theharvestman.com</p>
              <p>We look forward to serving you!</p>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">Best regards,<br><strong style="color: #b8860b;">The Harvest Commodities Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply directly to this message.</p>
            <p>&copy; 2026 Harvest Commodities. All rights reserved.</p>
            <p>Connecting Global Markets | Premium Commodity Trading</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Quote Request Confirmed - Reference #${referenceNumber}`,
    html,
    text: `Quote Request Confirmed\n\nDear ${customerName},\n\nThank you for submitting your quote request to Harvest Commodities.\n\nReference Number: ${referenceNumber}\nCommodity: ${commodityType}\nQuantity: ${quantity} ${unit}\n\nOur team will contact you within 24 hours with a competitive quote.\n\nBest regards,\nHarvest Commodities Team\nwww.theharvestman.com`,
  });
}

export async function sendAdminNotification(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  companyName: string | undefined,
  commodityType: string,
  quantity: string,
  unit: string,
  deliveryTimeline: string,
  specialRequirements: string | undefined,
  referenceNumber: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f5f5f5; }
          .container { max-width: 700px; margin: 0 auto; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%); color: white; padding: 25px 20px; text-align: center; }
          .header h1 { font-size: 24px; }
          .alert-banner { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; color: #856404; font-weight: 600; }
          .content { padding: 25px 20px; }
          .section { margin: 20px 0; }
          .section-title { background-color: #e6d5a8; padding: 12px 15px; font-weight: bold; color: #333; border-radius: 3px; margin-bottom: 15px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: 600; width: 35%; color: #555; }
          .value { width: 65%; text-align: right; color: #333; word-break: break-word; }
          .action-box { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .action-box p { color: #155724; margin: 5px 0; }
          .action-box strong { color: #0c5620; }
          .footer { background-color: #f5f5f5; padding: 15px 20px; text-align: center; border-top: 1px solid #eee; font-size: 11px; color: #999; }
          .footer p { margin: 3px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 New Quote Request Received</h1>
          </div>
          
          <div class="alert-banner">
            ⚠️ NEW LEAD - Action Required: Please follow up with this customer promptly
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">📋 Customer Information</div>
              <div class="detail-row">
                <span class="label">Reference #</span>
                <span class="value"><strong>${referenceNumber}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Name</span>
                <span class="value">${customerName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email</span>
                <span class="value"><a href="mailto:${customerEmail}" style="color: #b8860b; text-decoration: none;">${customerEmail}</a></span>
              </div>
              <div class="detail-row">
                <span class="label">Phone</span>
                <span class="value"><a href="tel:${customerPhone}" style="color: #b8860b; text-decoration: none;">${customerPhone}</a></span>
              </div>
              ${companyName ? `
              <div class="detail-row">
                <span class="label">Company</span>
                <span class="value">${companyName}</span>
              </div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">📦 Quote Requirements</div>
              <div class="detail-row">
                <span class="label">Commodity</span>
                <span class="value"><strong>${commodityType}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Quantity</span>
                <span class="value"><strong>${quantity} ${unit}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Delivery Timeline</span>
                <span class="value">${deliveryTimeline}</span>
              </div>
              ${specialRequirements ? `
              <div class="detail-row">
                <span class="label">Special Requirements</span>
                <span class="value">${specialRequirements}</span>
              </div>
              ` : ''}
            </div>

            <div class="action-box">
              <p><strong>✓ Next Steps:</strong></p>
              <p>1. Review the quote requirements above</p>
              <p>2. Contact the customer at ${customerEmail} or ${customerPhone}</p>
              <p>3. Prepare and send a competitive quote</p>
              <p>4. Update the customer on delivery details and terms</p>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from Harvest Commodities Quote Management System</p>
            <p>&copy; 2026 Harvest Commodities. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: ENV.adminEmail,
    subject: `🌾 NEW QUOTE REQUEST - ${commodityType} - Ref #${referenceNumber}`,
    html,
    text: `NEW QUOTE REQUEST\n\nReference: ${referenceNumber}\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nCompany: ${companyName || 'N/A'}\n\nCommodity: ${commodityType}\nQuantity: ${quantity} ${unit}\nDelivery Timeline: ${deliveryTimeline}\n\nSpecial Requirements: ${specialRequirements || 'None'}\n\nPlease contact the customer promptly to provide a quote.`,
  });
}
