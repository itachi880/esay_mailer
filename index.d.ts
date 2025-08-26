declare class Mailer {
  /**
   * A map of common host settings (GMAIL, YAHOO, OUTLOOK, ...)
   */
  static HOSTS_DEFAULT_LIST: { [key: string]: Mailer.HostService };

  constructor(options?: Mailer.Options);

  /**
   * Send an email. Returns a Promise that resolves once the send flow completes.
   */
  sendEmail(options: Mailer.SendEmailOptions): Promise<void>;

  /**
   * Update sender credentials and return the same Mailer instance for chaining.
   */
  updateCredentials(options?: { user?: string; pass?: string }): this;

  /**
   * Switch the host service configuration and return the same Mailer instance for chaining.
   */
  switchHostService(options?: { host_service?: Mailer.HostService }): this;
}

declare namespace Mailer {
  interface HostService {
    domain: string;
    smtp_host: string;
    smtp_port: number;
    secure_smtp_port: number;
  }

  interface Options {
    host_service?: HostService;
    user?: string;
    pass?: string;
  }

  interface FileAttachment {
    mime_type: string;
    name: string;
    buffer: Buffer | false;
  }

  interface SendEmailOptions {
    to: string;
    subject: string;
    text?: string;
    file?: FileAttachment;
    /**
     * html can be a full HTML string or an object described by the library (template string, data to replace, etc.)
     */
    html?: any;
    log?: boolean;
  }
}

export default Mailer;
