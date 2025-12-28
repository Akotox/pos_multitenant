import nodemailer from 'nodemailer';
import { EmailTemplate, EmailOptions, EmailAttachment } from './types/EmailTypes';
import { EmailTemplateService } from './EmailTemplateService';

export class EmailService {
    private transporter!: nodemailer.Transporter;
    private templateService: EmailTemplateService;

    constructor() {
        this.templateService = new EmailTemplateService();
        this.initializeTransporter();
    }

    private initializeTransporter(): void {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: {
                    name: 'Horizon POS',
                    address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@horizonpos.com'
                },
                to: options.to,
                cc: options.cc,
                bcc: options.bcc,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }

    async sendTemplateEmail(
        template: EmailTemplate,
        to: string | string[],
        variables: Record<string, any>,
        options?: Partial<EmailOptions>
    ): Promise<boolean> {
        try {
            const { subject, html, text } = await this.templateService.renderTemplate(template, variables);

            return await this.sendEmail({
                to,
                subject,
                html,
                text,
                ...options
            });
        } catch (error) {
            console.error('Failed to send template email:', error);
            return false;
        }
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('SMTP connection failed:', error);
            return false;
        }
    }

    async sendBulkEmails(emails: EmailOptions[]): Promise<{ success: number; failed: number }> {
        let success = 0;
        let failed = 0;

        for (const email of emails) {
            const result = await this.sendEmail(email);
            if (result) {
                success++;
            } else {
                failed++;
            }
            
            // Add small delay to avoid overwhelming SMTP server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return { success, failed };
    }
}

export const emailService = new EmailService();