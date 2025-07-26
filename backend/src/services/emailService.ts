import nodemailer from 'nodemailer';
import logger from '../utils/logger';

export interface BookingEmailData {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  serviceType: string;
  vehicleName?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: string;
  estimatedFare: number;
  status: string;
}

export interface SupportEmailData {
  name: string;
  email: string;
  phone?: string | null;
  issueType: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
      },
    });
  }

  async sendBookingNotificationToAdmin(bookingData: BookingEmailData) {
    try {
      const htmlContent = this.generateBookingEmailHTML(bookingData);

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `🚚 New Booking Alert - ${bookingData.bookingNumber}`,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('✅ Admin notification email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      logger.error('❌ Failed to send admin notification email:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  private generateBookingEmailHTML(data: BookingEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Booking Alert</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
                background-color: #ffffff; 
            }
            .header { 
                background: linear-gradient(135deg, #4F46E5, #7C3AED); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
                border-radius: 12px 12px 0 0; 
                margin-bottom: 0;
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
                font-weight: bold; 
            }
            .header p { 
                margin: 10px 0 0 0; 
                opacity: 0.9; 
            }
            .content { 
                background: #f9fafb; 
                padding: 30px 20px; 
                border-radius: 0 0 12px 12px; 
            }
            .booking-details { 
                background: white; 
                padding: 20px; 
                border-radius: 12px; 
                margin: 15px 0; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
            }
            .booking-details h2 { 
                color: #4F46E5; 
                margin-top: 0; 
                margin-bottom: 15px; 
                font-size: 18px; 
            }
            .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #e5e7eb; 
            }
            .detail-row:last-child { 
                border-bottom: none; 
            }
            .detail-label { 
                font-weight: bold; 
                color: #4F46E5; 
                flex: 1; 
            }
            .detail-value { 
                flex: 1; 
                text-align: right; 
                color: #1f2937; 
            }
            .status { 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold; 
                text-transform: uppercase; 
            }
            .status-pending { 
                background: #FEF3C7; 
                color: #D97706; 
            }
            .urgent { 
                background: linear-gradient(135deg, #FEE2E2, #FECACA); 
                color: #DC2626; 
                padding: 15px; 
                border-radius: 12px; 
                margin: 15px 0; 
                border-left: 4px solid #DC2626; 
            }
            .action-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #4F46E5, #7C3AED); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 12px; 
                font-weight: bold; 
                margin: 20px 0; 
                text-align: center; 
                transition: all 0.3s ease; 
            }
            .action-button:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4); 
            }
            .next-steps { 
                background: linear-gradient(135deg, #E0E7FF, #C7D2FE); 
                border-radius: 12px; 
                padding: 20px; 
                margin-top: 20px; 
            }
            .next-steps h3 { 
                color: #4F46E5; 
                margin-top: 0; 
            }
            .next-steps ul { 
                margin: 10px 0; 
                padding-left: 20px; 
            }
            .next-steps li { 
                margin: 8px 0; 
                color: #1e40af; 
            }
            .fare-highlight { 
                font-size: 18px; 
                font-weight: bold; 
                color: #059669; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚚 New Booking Alert</h1>
                <p>A new booking has been created and requires your attention</p>
            </div>
            
            <div class="content">
                <div class="urgent">
                    <strong>⚡ Action Required:</strong> New booking #${data.bookingNumber} needs review and driver assignment.
                </div>
                
                <div class="booking-details">
                    <h2>📋 Booking Details</h2>
                    
                    <div class="detail-row">
                        <span class="detail-label">Booking Number:</span>
                        <span class="detail-value"><strong>#${data.bookingNumber}</strong></span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Service Type:</span>
                        <span class="detail-value">${this.formatServiceType(data.serviceType)}</span>
                    </div>
                    
                    ${data.vehicleName ? `
                    <div class="detail-row">
                        <span class="detail-label">Vehicle:</span>
                        <span class="detail-value">${data.vehicleName}</span>
                    </div>
                    ` : ''}
                    
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value"><span class="status status-pending">${data.status}</span></span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Estimated Fare:</span>
                        <span class="detail-value fare-highlight">₹${data.estimatedFare}</span>
                    </div>
                </div>
                
                <div class="booking-details">
                    <h2>👤 Customer Information</h2>
                    
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${data.customerName}</span>
                    </div>
                    
                    ${data.customerEmail ? `
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${data.customerEmail}</span>
                    </div>
                    ` : ''}
                    
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value"><strong>${data.customerPhone}</strong></span>
                    </div>
                </div>
                
                <div class="booking-details">
                    <h2>📍 Trip Information</h2>
                    
                    <div class="detail-row">
                        <span class="detail-label">📍 Pickup:</span>
                        <span class="detail-value">${data.pickupAddress}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">🎯 Drop:</span>
                        <span class="detail-value">${data.dropoffAddress}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">🕒 Pickup Time:</span>
                        <span class="detail-value"><strong>${new Date(data.pickupDateTime).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</strong></span>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/admin/bookings" class="action-button">
                        📱 View in Admin Panel
                    </a>
                </div>
                
                <div class="next-steps">
                    <h3>💡 Next Steps:</h3>
                    <ul>
                        <li><strong>Review</strong> booking details in admin panel</li>
                        <li><strong>Assign</strong> an available driver</li>
                        <li><strong>Confirm</strong> booking with customer</li>
                        <li><strong>Monitor</strong> trip progress</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private formatServiceType(serviceType: string): string {
    const serviceMap: Record<string, string> = {
      'BIKE_DELIVERY': '🏍️ Bike Delivery',
      'TRUCK_DELIVERY': '🚚 Truck Delivery',
      'PACKERS_MOVERS': '📦 Packers & Movers',
      'AUTO_RIDE': '🛺 Auto Ride',
      'CAR_RIDE': '🚗 Car Ride'
    };
    return serviceMap[serviceType] || serviceType;
  }

  // Test email function
  async testEmailConnection() {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service is ready');
      return true;
    } catch (error: any) {
      logger.error('❌ Email service error:', error);
      return false;
    }
  }

  // Send test email
  async sendTestEmail() {
    const testBookingData: BookingEmailData = {
      bookingId: 'test-123',
      bookingNumber: 'BK' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 9876543210',
      serviceType: 'TRUCK_DELIVERY',
      vehicleName: 'Tata Ace',
      pickupAddress: 'Test Pickup Location, City',
      dropoffAddress: 'Test Drop Location, City',
      pickupDateTime: new Date().toISOString(),
      estimatedFare: 500,
      status: 'PENDING',
    };

    return await this.sendBookingNotificationToAdmin(testBookingData);
  }

  // Send support form email to admin
  async sendSupportFormToAdmin(supportData: SupportEmailData) {
    try {
      const htmlContent = this.generateSupportEmailHTML(supportData);

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `🎧 New Support Request - ${supportData.issueType}`,
        html: htmlContent,
        replyTo: supportData.email, // Allow admin to reply directly to user
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('✅ Support form email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      logger.error('❌ Failed to send support form email:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  private generateSupportEmailHTML(data: SupportEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>New Support Request</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px; 
                background-color: #ffffff; 
            }
            .header { 
                background: linear-gradient(135deg, #DC2626, #EF4444); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
                border-radius: 12px 12px 0 0; 
                margin-bottom: 0;
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
                font-weight: bold; 
            }
            .header p { 
                margin: 10px 0 0 0; 
                opacity: 0.9; 
            }
            .content { 
                background: #f9fafb; 
                padding: 30px 20px; 
                border-radius: 0 0 12px 12px; 
            }
            .support-details { 
                background: white; 
                padding: 20px; 
                border-radius: 12px; 
                margin: 15px 0; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
            }
            .support-details h2 { 
                color: #DC2626; 
                margin-top: 0; 
                margin-bottom: 15px; 
                font-size: 18px; 
            }
            .detail-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #e5e7eb; 
            }
            .detail-row:last-child { 
                border-bottom: none; 
            }
            .detail-label { 
                font-weight: bold; 
                color: #DC2626; 
                flex: 1; 
            }
            .detail-value { 
                flex: 2; 
                text-align: left; 
                color: #1f2937; 
                margin-left: 20px;
            }
            .message-box {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
                font-style: italic;
                color: #475569;
            }
            .priority-badge { 
                padding: 6px 12px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold; 
                text-transform: uppercase; 
            }
            .priority-high { 
                background: #FEE2E2; 
                color: #DC2626; 
            }
            .priority-medium { 
                background: #FEF3C7; 
                color: #D97706; 
            }
            .priority-low { 
                background: #D1FAE5; 
                color: #059669; 
            }
            .urgent { 
                background: linear-gradient(135deg, #FEE2E2, #FECACA); 
                color: #DC2626; 
                padding: 15px; 
                border-radius: 12px; 
                margin: 15px 0; 
                border-left: 4px solid #DC2626; 
            }
            .action-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #DC2626, #EF4444); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 12px; 
                font-weight: bold; 
                margin: 20px 0; 
                text-align: center; 
                transition: all 0.3s ease; 
            }
            .action-button:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 5px 15px rgba(220, 38, 38, 0.4); 
            }
            .next-steps { 
                background: linear-gradient(135deg, #FEE2E2, #FECACA); 
                border-radius: 12px; 
                padding: 20px; 
                margin-top: 20px; 
            }
            .next-steps h3 { 
                color: #DC2626; 
                margin-top: 0; 
            }
            .next-steps ul { 
                margin: 10px 0; 
                padding-left: 20px; 
            }
            .next-steps li { 
                margin: 8px 0; 
                color: #7f1d1d; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎧 New Support Request</h1>
                <p>A customer needs assistance and is waiting for your response</p>
            </div>
            
            <div class="content">
                <div class="urgent">
                    <strong>⚡ Customer Support Required:</strong> New ${data.issueType} issue needs immediate attention.
                </div>
                
                <div class="support-details">
                    <h2>📋 Issue Details</h2>
                    
                    <div class="detail-row">
                        <span class="detail-label">Subject:</span>
                        <span class="detail-value"><strong>${data.subject}</strong></span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Issue Type:</span>
                        <span class="detail-value">${this.formatIssueType(data.issueType)}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Priority:</span>
                        <span class="detail-value"><span class="priority-badge ${this.getPriorityClass(data.issueType)}">${this.getIssuePriority(data.issueType)}</span></span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value"><strong>${new Date(data.submittedAt).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</strong></span>
                    </div>
                </div>
                
                <div class="support-details">
                    <h2>👤 Customer Information</h2>
                    
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${data.name}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value"><strong>${data.email}</strong></span>
                    </div>
                    
                    ${data.phone ? `
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value"><strong>${data.phone}</strong></span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="support-details">
                    <h2>💬 Customer Message</h2>
                    <div class="message-box">
                        "${data.message}"
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="mailto:${data.email}?subject=Re: ${data.subject}&body=Dear ${data.name},%0D%0A%0D%0AThank you for contacting our support team. " class="action-button">
                        📧 Reply to Customer
                    </a>
                </div>
                
                <div class="next-steps">
                    <h3>💡 Next Steps:</h3>
                    <ul>
                        <li><strong>Respond quickly</strong> - Customer is waiting for assistance</li>
                        <li><strong>Address the ${data.issueType}</strong> - Provide clear solution</li>
                        <li><strong>Follow up</strong> - Ensure issue is fully resolved</li>
                        <li><strong>Document</strong> - Add to knowledge base if needed</li>
                    </ul>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private formatIssueType(issueType: string): string {
    const issueMap: Record<string, string> = {
      'technical': '🔧 Technical Issue',
      'billing': '💳 Billing & Payment',
      'delivery': '🚚 Delivery Problem',
      'account': '👤 Account Issue',
      'general': '💬 General Inquiry',
      'complaint': '😠 Complaint',
      'feature': '💡 Feature Request'
    };
    return issueMap[issueType] || issueType;
  }

  private getIssuePriority(issueType: string): string {
    const priorityMap: Record<string, string> = {
      'technical': 'HIGH',
      'delivery': 'HIGH',
      'billing': 'MEDIUM',
      'account': 'MEDIUM',
      'complaint': 'HIGH',
      'general': 'LOW',
      'feature': 'LOW'
    };
    return priorityMap[issueType] || 'MEDIUM';
  }

  private getPriorityClass(issueType: string): string {
    const priority = this.getIssuePriority(issueType);
    const classMap: Record<string, string> = {
      'HIGH': 'priority-high',
      'MEDIUM': 'priority-medium',
      'LOW': 'priority-low'
    };
    return classMap[priority] || 'priority-medium';
  }
}

export const emailService = new EmailService();
