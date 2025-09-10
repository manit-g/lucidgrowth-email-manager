import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import { EmailAccount } from '../database/schemas/email-account.schema';

/**
 * IMAP service for handling email connections and operations
 * Implements connection pooling, authentication methods, and error handling
 */
@Injectable()
export class ImapService {
  private readonly logger = new Logger(ImapService.name);
  private connectionPool = new Map<string, Imap>();
  private readonly maxConnections: number;

  constructor(private configService: ConfigService) {
    this.maxConnections = this.configService.get<number>('MAX_CONCURRENT_CONNECTIONS', 10);
  }

  /**
   * Create a new IMAP connection for an email account
   * Supports OAuth2, PLAIN, and LOGIN authentication methods
   */
  async createConnection(account: EmailAccount): Promise<Imap> {
    const connectionKey = `${account.email}-${account.imapHost}`;
    
    // Return existing connection if available
    if (this.connectionPool.has(connectionKey)) {
      const existingConnection = this.connectionPool.get(connectionKey);
      if (existingConnection.state === 'authenticated') {
        return existingConnection;
      }
    }

    const config: any = {
      host: account.imapHost,
      port: account.imapPort,
      tls: account.useTLS,
      tlsOptions: {
        rejectUnauthorized: false, // For development - should be true in production
      },
      connTimeout: this.configService.get<number>('CONNECTION_TIMEOUT', 30000),
      authTimeout: 30000,
      keepalive: {
        interval: 10000,
        idleInterval: 300000,
        forceNoop: true,
      },
    };

    // Configure authentication based on method
    switch (account.authMethod) {
      case 'OAUTH2':
        config.auth = {
          user: account.email,
          accessToken: account.oauth2Token,
        };
        break;
      case 'LOGIN':
        config.auth = {
          user: account.email,
          pass: account.password,
        };
        break;
      case 'PLAIN':
      default:
        config.auth = {
          user: account.email,
          pass: account.password,
        };
        break;
    }

    return new Promise((resolve, reject) => {
      const imap = new Imap(config);
      
      imap.once('ready', () => {
        this.logger.log(`IMAP connection established for ${account.email}`);
        this.connectionPool.set(connectionKey, imap);
        resolve(imap);
      });

      imap.once('error', (err) => {
        this.logger.error(`IMAP connection error for ${account.email}:`, err);
        this.connectionPool.delete(connectionKey);
        reject(err);
      });

      imap.once('end', () => {
        this.logger.log(`IMAP connection ended for ${account.email}`);
        this.connectionPool.delete(connectionKey);
      });

      imap.connect();
    });
  }

  /**
   * Get or create a connection for an email account
   */
  async getConnection(account: EmailAccount): Promise<Imap> {
    const connectionKey = `${account.email}-${account.imapHost}`;
    
    if (this.connectionPool.has(connectionKey)) {
      const connection = this.connectionPool.get(connectionKey);
      if (connection.state === 'authenticated') {
        return connection;
      }
    }

    return this.createConnection(account);
  }

  /**
   * List all folders in the mailbox
   */
  async listFolders(account: EmailAccount): Promise<string[]> {
    const imap = await this.getConnection(account);
    
    return new Promise((resolve, reject) => {
      imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
          return;
        }

        const folders: string[] = [];
        const extractFolders = (boxList: any, prefix = '') => {
          for (const [name, box] of Object.entries(boxList)) {
            const fullName = prefix + name;
            folders.push(fullName);
            if ((box as any).children) {
              extractFolders((box as any).children, fullName + (box as any).delimiter);
            }
          }
        };

        extractFolders(boxes);
        resolve(folders);
      });
    });
  }

  /**
   * Get emails from a specific folder with pagination
   */
  async getEmails(
    account: EmailAccount,
    folder: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const imap = await this.getConnection(account);
    
    return new Promise((resolve, reject) => {
      imap.openBox(folder, true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        const totalMessages = box.messages.total;
        const start = Math.max(1, totalMessages - offset - limit + 1);
        const end = totalMessages - offset;

        if (start > end) {
          resolve([]);
          return;
        }

        const fetch = imap.seq.fetch(`${start}:${end}`, {
          bodies: '',
          struct: true,
          markSeen: false,
        });

        const emails: any[] = [];

        fetch.on('message', (msg, seqno) => {
          let buffer = '';
          
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('attributes', (attrs) => {
            const emailData = {
              seqno,
              uid: attrs.uid,
              flags: attrs.flags,
              date: attrs.date,
              size: attrs.size,
              messageId: attrs['x-gm-msgid'] || attrs.uid,
            };

            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                emails.push({
                  ...emailData,
                  subject: parsed.subject,
                  from: parsed.from?.text,
                  to: parsed.to?.text,
                  cc: parsed.cc?.text,
                  bcc: parsed.bcc?.text,
                  content: parsed.text || parsed.html,
                  htmlContent: parsed.html,
                  textContent: parsed.text,
                  receivedDate: new Date(),
                });
              } catch (parseErr) {
                this.logger.error('Error parsing email:', parseErr);
              }
            });
          });
        });

        fetch.once('error', reject);
        fetch.once('end', () => {
          resolve(emails);
        });
      });
    });
  }

  /**
   * Close a specific connection
   */
  async closeConnection(account: EmailAccount): Promise<void> {
    const connectionKey = `${account.email}-${account.imapHost}`;
    const connection = this.connectionPool.get(connectionKey);
    
    if (connection) {
      connection.end();
      this.connectionPool.delete(connectionKey);
    }
  }

  /**
   * Close all connections
   */
  async closeAllConnections(): Promise<void> {
    for (const [key, connection] of this.connectionPool) {
      connection.end();
    }
    this.connectionPool.clear();
  }

  /**
   * Test connection to an email account
   */
  async testConnection(account: EmailAccount): Promise<boolean> {
    try {
      const connection = await this.createConnection(account);
      await this.closeConnection(account);
      return true;
    } catch (error) {
      this.logger.error(`Connection test failed for ${account.email}:`, error);
      return false;
    }
  }
}
