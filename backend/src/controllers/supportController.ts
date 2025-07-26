import { Request, Response } from 'express';
import { EmailService, SupportEmailData } from '../services/emailService';
import logger from '../utils/logger';

export class SupportController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // Handle support form submission
  async submitSupportForm(req: Request, res: Response) {
    try {
      const { name, email, phone, issueType, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !issueType || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields. Please provide name, email, issue type, subject, and message.'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      // Validate issue type
      const validIssueTypes = ['technical', 'billing', 'delivery', 'account', 'general', 'complaint', 'feature'];
      if (!validIssueTypes.includes(issueType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid issue type. Please select a valid option.'
        });
      }

      // Prepare support data
      const supportData: SupportEmailData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        issueType: issueType.trim(),
        subject: subject.trim(),
        message: message.trim(),
        submittedAt: new Date()
      };

      // Send email to admin
      const emailResult = await this.emailService.sendSupportFormToAdmin(supportData);

      if (emailResult.success) {
        logger.info(`✅ Support form submitted successfully by ${supportData.email}`, {
          issueType: supportData.issueType,
          subject: supportData.subject,
          messageId: emailResult.messageId
        });

        return res.status(200).json({
          success: true,
          message: 'Your support request has been submitted successfully. Our team will get back to you soon!',
          messageId: emailResult.messageId
        });
      } else {
        logger.error('❌ Failed to send support email', {
          error: emailResult.error,
          supportData: { ...supportData, message: '[REDACTED]' }
        });

        return res.status(500).json({
          success: false,
          message: 'Failed to submit your support request. Please try again or contact us directly.',
          error: emailResult.error
        });
      }

    } catch (error: any) {
      logger.error('❌ Error in support form submission:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Test support email functionality
  async testSupportEmail(req: Request, res: Response) {
    try {
      const testSupportData: SupportEmailData = {
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '+1234567890',
        issueType: 'technical',
        subject: 'Test Support Request - Please Ignore',
        message: 'This is a test support request to verify the email functionality is working correctly. You can safely ignore this message.',
        submittedAt: new Date()
      };

      const result = await this.emailService.sendSupportFormToAdmin(testSupportData);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Test support email sent successfully!',
          messageId: result.messageId
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send test support email',
          error: result.error
        });
      }
    } catch (error: any) {
      logger.error('❌ Error testing support email:', error);
      return res.status(500).json({
        success: false,
        message: 'Error testing support email',
        error: error.message
      });
    }
  }
}
