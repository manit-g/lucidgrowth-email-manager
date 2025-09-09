import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import * as tls from 'tls';
import { promisify } from 'util';

const dnsResolve = promisify(dns.resolve);
const dnsResolveMx = promisify(dns.resolveMx);

/**
 * Email analytics service for processing email metadata
 * Detects ESP types, validates TLS certificates, and checks for open relays
 */
@Injectable()
export class EmailAnalyticsService {
  private readonly logger = new Logger(EmailAnalyticsService.name);

  // ESP detection patterns
  private readonly espPatterns = {
    'Gmail': /googlemail\.com|gmail\.com|google\.com/,
    'Outlook': /outlook\.com|hotmail\.com|live\.com|msn\.com/,
    'Yahoo': /yahoo\.com|yahoo\.co\.uk|ymail\.com/,
    'SendGrid': /sendgrid\.net|sendgrid\.com/,
    'Mailgun': /mailgun\.net|mailgun\.com/,
    'Amazon SES': /amazonaws\.com|ses\.amazonaws\.com/,
    'Mandrill': /mandrillapp\.com/,
    'Postmark': /postmarkapp\.com/,
    'Mailchimp': /mailchimp\.com|list-manage\.com/,
    'Constant Contact': /constantcontact\.com/,
    'AWeber': /aweber\.com/,
    'GetResponse': /getresponse\.com/,
    'Campaign Monitor': /campaignmonitor\.com/,
    'ConvertKit': /convertkit\.com/,
    'ActiveCampaign': /activecampaign\.com/,
    'HubSpot': /hubspot\.com/,
    'Pardot': /pardot\.com/,
    'Marketo': /marketo\.com/,
    'Salesforce': /salesforce\.com/,
    'Zendesk': /zendesk\.com/,
  };

  /**
   * Analyze email headers and extract sending information
   */
  async analyzeEmail(emailData: any): Promise<any> {
    try {
      const analysis = {
        sendingDomain: null,
        espType: 'Unknown',
        espName: 'Unknown',
        sendingServer: null,
        isOpenRelay: false,
        supportsTLS: false,
        hasValidCertificate: false,
        timeDelta: null,
        certificateDetails: null,
      };

      // Extract sending domain from email address
      if (emailData.from) {
        const emailMatch = emailData.from.match(/<(.+)>|(.+)/);
        const emailAddress = emailMatch[1] || emailMatch[2];
        if (emailAddress) {
          analysis.sendingDomain = emailAddress.split('@')[1];
        }
      }

      // Detect ESP type based on sending domain
      if (analysis.sendingDomain) {
        const espDetection = this.detectESP(analysis.sendingDomain);
        analysis.espType = espDetection.type;
        analysis.espName = espDetection.name;
      }

      // Extract sending server from headers
      analysis.sendingServer = this.extractSendingServer(emailData);

      // Calculate time delta between sent and received
      if (emailData.date && emailData.receivedDate) {
        analysis.timeDelta = emailData.receivedDate.getTime() - emailData.date.getTime();
      }

      // Check TLS and certificate if sending server is available
      if (analysis.sendingServer) {
        const tlsAnalysis = await this.analyzeTLS(analysis.sendingServer);
        analysis.supportsTLS = tlsAnalysis.supportsTLS;
        analysis.hasValidCertificate = tlsAnalysis.hasValidCertificate;
        analysis.certificateDetails = tlsAnalysis.certificateDetails;
        analysis.isOpenRelay = await this.checkOpenRelay(analysis.sendingServer);
      }

      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing email:', error);
      return {
        sendingDomain: null,
        espType: 'Unknown',
        espName: 'Unknown',
        sendingServer: null,
        isOpenRelay: false,
        supportsTLS: false,
        hasValidCertificate: false,
        timeDelta: null,
        certificateDetails: null,
      };
    }
  }

  /**
   * Detect ESP type based on domain patterns
   */
  private detectESP(domain: string): { type: string; name: string } {
    const lowerDomain = domain.toLowerCase();
    
    for (const [espName, pattern] of Object.entries(this.espPatterns)) {
      if (pattern.test(lowerDomain)) {
        return {
          type: this.categorizeESP(espName),
          name: espName,
        };
      }
    }

    return { type: 'Custom', name: 'Custom/Unknown' };
  }

  /**
   * Categorize ESP into broader types
   */
  private categorizeESP(espName: string): string {
    const categories = {
      'Gmail': 'Webmail',
      'Outlook': 'Webmail',
      'Yahoo': 'Webmail',
      'SendGrid': 'Transactional',
      'Mailgun': 'Transactional',
      'Amazon SES': 'Transactional',
      'Mandrill': 'Transactional',
      'Postmark': 'Transactional',
      'Mailchimp': 'Marketing',
      'Constant Contact': 'Marketing',
      'AWeber': 'Marketing',
      'GetResponse': 'Marketing',
      'Campaign Monitor': 'Marketing',
      'ConvertKit': 'Marketing',
      'ActiveCampaign': 'Marketing',
      'HubSpot': 'Marketing',
      'Pardot': 'Marketing',
      'Marketo': 'Marketing',
      'Salesforce': 'Marketing',
      'Zendesk': 'Support',
    };

    return categories[espName] || 'Other';
  }

  /**
   * Extract sending server from email headers
   */
  private extractSendingServer(emailData: any): string | null {
    // This would typically come from email headers like Received, X-Originating-IP, etc.
    // For now, we'll use a placeholder implementation
    if (emailData.sendingDomain) {
      return `mail.${emailData.sendingDomain}`;
    }
    return null;
  }

  /**
   * Analyze TLS support and certificate validity
   */
  private async analyzeTLS(server: string): Promise<{
    supportsTLS: boolean;
    hasValidCertificate: boolean;
    certificateDetails: any;
  }> {
    try {
      return new Promise((resolve) => {
        const socket = tls.connect(587, server, {
          rejectUnauthorized: false,
          timeout: 5000,
        });

        socket.on('secureConnect', () => {
          const cert = socket.getPeerCertificate();
          const isSecure = socket.authorized;
          
          resolve({
            supportsTLS: true,
            hasValidCertificate: isSecure,
            certificateDetails: {
              issuer: cert.issuer?.CN,
              subject: cert.subject?.CN,
              validFrom: cert.valid_from,
              validTo: cert.valid_to,
              fingerprint: cert.fingerprint,
            },
          });
          
          socket.destroy();
        });

        socket.on('error', () => {
          resolve({
            supportsTLS: false,
            hasValidCertificate: false,
            certificateDetails: null,
          });
        });

        socket.on('timeout', () => {
          resolve({
            supportsTLS: false,
            hasValidCertificate: false,
            certificateDetails: null,
          });
          socket.destroy();
        });
      });
    } catch (error) {
      this.logger.error(`TLS analysis error for ${server}:`, error);
      return {
        supportsTLS: false,
        hasValidCertificate: false,
        certificateDetails: null,
      };
    }
  }

  /**
   * Check if a server is an open relay
   */
  private async checkOpenRelay(server: string): Promise<boolean> {
    try {
      // This is a simplified check - in reality, you'd need to test actual relay behavior
      // For now, we'll check if the server responds to SMTP commands
      return new Promise((resolve) => {
        const net = require('net');
        const socket = new net.Socket();
        
        socket.setTimeout(5000);
        
        socket.connect(25, server, () => {
          socket.write('EHLO test.com\r\n');
        });

        socket.on('data', (data) => {
          const response = data.toString();
          // Basic check - if server accepts EHLO without authentication, it might be an open relay
          const isOpenRelay = response.includes('250') && !response.includes('AUTH');
          socket.destroy();
          resolve(isOpenRelay);
        });

        socket.on('error', () => {
          resolve(false);
        });

        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
      });
    } catch (error) {
      this.logger.error(`Open relay check error for ${server}:`, error);
      return false;
    }
  }

  /**
   * Generate searchable content for full-text search
   */
  generateSearchableContent(emailData: any): string {
    const content = [
      emailData.subject || '',
      emailData.from || '',
      emailData.to?.join(' ') || '',
      emailData.cc?.join(' ') || '',
      emailData.bcc?.join(' ') || '',
      emailData.textContent || '',
      emailData.htmlContent?.replace(/<[^>]*>/g, '') || '', // Strip HTML tags
    ].join(' ');

    return content.toLowerCase().trim();
  }
}
