import { Resend } from 'resend';
import { OrderInquiryFormData } from '@/types/database';

export async function sendOrderNotificationEmails(orderData: OrderInquiryFormData, orderId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const storeOwnerEmail = process.env.STORE_OWNER_EMAIL || 'atelier@walaabaya.com';

  if (!apiKey || apiKey.startsWith('re_12345') || apiKey.trim() === '') {
    console.info('[Resend] Skipping live email notification: RESEND_API_KEY not configured.');
    return { success: true, mocked: true };
  }

  try {
    const resend = new Resend(apiKey);

    // 1. Notify Store Owner / Atelier
    const storeEmailContent = `
      <div style="font-family: 'Georgia', serif; background-color: #F7F7F9; padding: 40px; color: #18181B;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E8E8EC; padding: 32px; border-radius: 4px;">
          <div style="text-align: center; border-bottom: 1px solid #7C5C8A; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #18181B; letter-spacing: 4px; font-size: 24px; margin: 0;">WALA ABAYA</h1>
            <p style="color: #7C5C8A; letter-spacing: 2px; font-size: 11px; text-transform: uppercase; margin: 4px 0 0 0;">Bespoke Order Inquiry • Chennai</p>
          </div>

          <h3 style="color: #18181B; margin-top: 0;">Order Reference: #${orderId.slice(0, 8).toUpperCase()}</h3>
          <p style="color: #666; font-size: 14px;">A new bespoke tailoring request has been received from your Chennai atelier website.</p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888;">Piece Requested:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #18181B; text-align: right;">${orderData.product_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888;">Selected Size:</td>
              <td style="padding: 10px 0; font-weight: bold; color: #18181B; text-align: right;">${orderData.selected_size}</td>
            </tr>
            ${
              orderData.custom_height
                ? `<tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Custom Height:</td>
                    <td style="padding: 10px 0; color: #18181B; text-align: right;">${orderData.custom_height}</td>
                   </tr>`
                : ''
            }
            ${
              orderData.applied_discount_code
                ? `<tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Offer Applied:</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #7C5C8A; text-align: right;">${orderData.applied_discount_code} (-₹${orderData.discount_amount || 0})</td>
                   </tr>
                   <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Estimated Total:</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #18181B; text-align: right;">₹${orderData.final_price}</td>
                   </tr>`
                : ''
            }
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888;">Client Name:</td>
              <td style="padding: 10px 0; color: #18181B; text-align: right;">${orderData.customer_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888;">WhatsApp Phone:</td>
              <td style="padding: 10px 0; color: #18181B; text-align: right;">${orderData.customer_phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888;">Email:</td>
              <td style="padding: 10px 0; color: #18181B; text-align: right;">${orderData.customer_email || 'Not provided'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888;">City / Destination:</td>
              <td style="padding: 10px 0; color: #18181B; text-align: right;">${orderData.city}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #888;">Delivery Address:</td>
              <td style="padding: 10px 0; color: #18181B; text-align: right;">${orderData.shipping_address}</td>
            </tr>
          </table>

          ${
            orderData.custom_notes
              ? `<div style="background: #F7F7F9; padding: 16px; border-left: 3px solid #7C5C8A; margin: 16px 0; font-size: 13px;">
                  <strong style="color: #18181B;">Tailoring Notes:</strong>
                  <p style="margin: 4px 0 0 0; color: #444;">${orderData.custom_notes}</p>
                 </div>`
              : ''
          }

          <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E8EC; font-size: 12px; color: #999;">
            WALA ABAYA ATELIER • CHENNAI • CONCIERGE ORDER DESK
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Wala Abaya Atelier <orders@resend.dev>',
      to: storeOwnerEmail,
      subject: `[New Inquiry] ${orderData.product_name} - ${orderData.customer_name}`,
      html: storeEmailContent,
    });

    // 2. If customer entered an email, send an aesthetic confirmation acknowledgment
    if (orderData.customer_email && orderData.customer_email.includes('@')) {
      const clientEmailContent = `
        <div style="font-family: 'Georgia', serif; background-color: #F7F7F9; padding: 40px; color: #18181B;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E8E8EC; padding: 32px; border-radius: 4px;">
            <div style="text-align: center; border-bottom: 1px solid #7C5C8A; padding-bottom: 20px; margin-bottom: 24px;">
              <h1 style="color: #18181B; letter-spacing: 4px; font-size: 24px; margin: 0;">WALA ABAYA</h1>
              <p style="color: #7C5C8A; letter-spacing: 2px; font-size: 11px; text-transform: uppercase; margin: 4px 0 0 0;">Bespoke Order Receipt</p>
            </div>

            <p style="font-size: 16px; color: #18181B;">Dear ${orderData.customer_name},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #444;">
              We have graciously received your bespoke order request for <strong>${orderData.product_name}</strong> (Size ${orderData.selected_size}).
              ${
                orderData.applied_discount_code
                  ? `<br />Offer code <strong>${orderData.applied_discount_code}</strong> has been applied for savings of ₹${orderData.discount_amount}.`
                  : ''
              }
              Our master tailors in Chennai will review your sizing and tailoring specifications.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #444;">
              Our concierge will connect with you via WhatsApp at <strong>${orderData.customer_phone}</strong> to confirm tailoring nuances, delivery across Chennai, or nationwide courier dispatch.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 10px 24px; background: #7C5C8A; color: #FFFFFF; letter-spacing: 2px; font-size: 12px; text-transform: uppercase; border-radius: 2px;">
                Order Reference: #${orderId.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E8EC; font-size: 12px; color: #999;">
              With warmest regards,<br />
              <strong style="color: #18181B;">WALA ABAYA ATELIER</strong><br />
              Bespoke Modest Couture • Crafted in Chennai
            </div>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'Wala Abaya Atelier <orders@resend.dev>',
        to: orderData.customer_email,
        subject: `Your Bespoke Inquiry with Wala Abaya: ${orderData.product_name}`,
        html: clientEmailContent,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[Resend Error]', error);
    return { success: false, error };
  }
}
