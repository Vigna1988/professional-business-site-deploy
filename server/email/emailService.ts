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
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #b8860b; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .details { margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quote Request Received</h1>
          </div>
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Thank you for submitting your quote request to Harvest Commodities. We have received your inquiry and will get back to you with a competitive quote within 24 hours.</p>
            
            <h3>Quote Details</h3>
            <div class="details">
              <div class="detail-row">
                <span class="label">Reference Number:</span>
                <span>${referenceNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Commodity Type:</span>
                <span>${commodityType}</span>
              </div>
              <div class="detail-row">
                <span class="label">Quantity:</span>
                <span>${quantity} ${unit}</span>
              </div>
            </div>

            <p>Please keep your reference number for future correspondence. Our team will contact you shortly with pricing and availability information.</p>
            
            <p>If you have any urgent questions, please contact us at:</p>
            <p>
              <strong>Email:</strong> jericho.ang@theharvestman.com<br>
              <strong>Phone:</strong> Available on our website
            </p>

            <p>Best regards,<br><strong>Harvest Commodities Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p>&copy; 2026 Harvest Commodities. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Quote Request Confirmation - Reference #${referenceNumber}`,
    html,
    text: `Quote Request Confirmation\n\nDear ${customerName},\n\nThank you for submitting your quote request. Reference Number: ${referenceNumber}\n\nCommodity: ${commodityType}\nQuantity: ${quantity} ${unit}\n\nWe will contact you within 24 hours.`,
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
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #b8860b; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 5px; }
          .section { margin: 20px 0; }
          .section-title { background-color: #e6d5a8; padding: 10px; font-weight: bold; border-radius: 3px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; width: 40%; }
          .value { width: 60%; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Quote Request</h1>
          </div>
          <div class="content">
            <p><strong>A new quote request has been submitted. Please review and follow up promptly.</strong></p>
            
            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="detail-row">
                <span class="label">Reference #:</span>
                <span class="value">${referenceNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${customerName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${customerEmail}">${customerEmail}</a></span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${customerPhone}</span>
              </div>
              <div class="detail-row">
                <span class="label">Company:</span>
                <span class="value">${companyName || 'N/A'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Quote Details</div>
              <div class="detail-row">
                <span class="label">Commodity:</span>
                <span class="value">${commodityType}</span>
              </div>
              <div class="detail-row">
                <span class="label">Quantity:</span>
                <span class="value">${quantity} ${unit}</span>
              </div>
              <div class="detail-row">
                <span class="label">Delivery Timeline:</span>
                <span class="value">${deliveryTimeline}</span>
              </div>
            </div>

            ${specialRequirements ? `
            <div class="section">
              <div class="section-title">Special Requirements</div>
              <p>${specialRequirements}</p>
            </div>
            ` : ''}

            <p style="margin-top: 20px; padding: 10px; background-color: #fff3cd; border-radius: 3px;">
              <strong>Action Required:</strong> Please contact the customer at ${customerEmail} or ${customerPhone} to provide a quote and discuss delivery details.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from the Harvest Commodities quote system.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: ENV.adminEmail,
    subject: `New Quote Request - ${commodityType} - Ref #${referenceNumber}`,
    html,
    text: `New Quote Request\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nCompany: ${companyName}\n\nCommodity: ${commodityType}\nQuantity: ${quantity} ${unit}\nDelivery: ${deliveryTimeline}\n\nSpecial Requirements: ${specialRequirements || 'None'}`,
  });
}
