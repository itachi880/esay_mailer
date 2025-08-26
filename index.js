import tls from "tls";
/**
 * @typedef {Object} HostService
 * @property {string} domain - The email domain (e.g., "gmail.com").
 * @property {string} smtp_host - The SMTP host (e.g., "smtp.gmail.com").
 * @property {number} smtp_port - The SMTP port (e.g., 587).
 * @property {number} secure_smtp_port - The secure SMTP port (e.g., 465).
 */

/**
 * @class Mailer
 * @classdesc This class provides email sending functionality.
 *
 * @param {Object} options - The options for the email service.
 * @param {HostService} [options.host_service] - The host service configuration.
 * @param {string} options.user - The user's email address.
 * @param {string} options.pass - The user's email password.
 *
 *  Example 1: Using Gmail configuration
 * @example
 * const gmailMailer = new Mailer({
 *   host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
 *   user: "your-email@gmail.com",
 *   pass: "your-password"
 * });
 *
 *  Example 2: Using costume configuration
 * @example
 * const costumeMailer = new Mailer({
 *   host_service: {      
 *    domain: "example.com",
      smtp_host: "smtp.example.com",
      smtp_port: 587,   // - its deprecated to use the smtp unsecure port
      secure_smtp_port: 465
      },
 *   user: "your-email@example.com",
 *   pass: "your-password"
 * });
 */
class Mailer {
  /**
   * - object contains the default setting for the most used smtp servecis like [gmail, outlook] and more.
   */
  static HOSTS_DEFAULT_LIST = {
    GMAIL: {
      domain: "gmail.com",
      smtp_host: "smtp.gmail.com",
      smtp_port: 587,
      secure_smtp_port: 465,
    },
    YAHOO: {
      domain: "yahoo.com",
      smtp_host: "smtp.mail.yahoo.com",
      smtp_port: 587,
      secure_smtp_port: 465,
    },
    OUTLOOK: {
      domain: "outlook.com",
      smtp_host: "smtp.office365.com",
      smtp_port: 587,
      secure_smtp_port: 587,
    },
    HOTMAIL: {
      domain: "hotmail.com",
      smtp_host: "smtp.office365.com",
      smtp_port: 587,
      secure_smtp_port: 587,
    },
    AOL: {
      domain: "aol.com",
      smtp_host: "smtp.aol.com",
      smtp_port: 587,
      secure_smtp_port: 465,
    },
    I_CLOUD: {
      domain: "icloud.com",
      smtp_host: "smtp.mail.me.com",
      smtp_port: 587,
      secure_smtp_port: 587,
    },
    ZOHO: {
      domain: "zoho.com",
      smtp_host: "smtp.zoho.com",
      smtp_port: 587,
      secure_smtp_port: 465,
    },
    MAIL: {
      domain: "mail.com",
      smtp_host: "smtp.mail.com",
      smtp_port: 587,
      secure_smtp_port: 465,
    },
    PROTONMAIL: {
      domain: "protonmail.com",
      smtp_host: "smtp.protonmail.com",
      smtp_port: 587,
      secure_smtp_port: 465,
    },
    GMX: {
      domain: "gmx.com",
      smtp_host: "smtp.gmx.com",
      smtp_port: 587,
      secure_smtp_port: 465,
    },
  };
  #host_service;
  #user;
  #pass;
  #connection;
  #queue = [];
  constructor({
    host_service = {
      domain: "",
      smtp_host: "",
      smtp_port: 0,
      secure_smtp_port: 0,
    },
    user,
    pass,
  }) {
    this.#host_service = host_service;
    this.#user = user;
    this.#pass = pass;
  }
  /**
   * Sends an email this methode support files attachment and html teamplate out of the box .
   * @param {object} options - The email options.
   * @param {string} options.to - The recipient's email address.
   * @param {string} options.subject - The subject of the email.
   * @param {(string|undefined)} options.text - The body text of the email.
   * @param {object} [options.file] - The file to attach to the email.
   * @param {string} options.file.mime_type - The MIME type of the file.
   * @param {string} options.file.name - The name of the file.
   * @param {(Buffer|boolean)} options.file.buffer - The file buffer or false if there is no file.
   * @param {object} [options.html] - The HTML content options.
   * @param {string} options.html.STRING_CODE - The HTML source code.
   * @param {object} options.html.DATA_TO_REPLACE - The keys that need to be replaced dynamically.
   * @param {string} options.html.SOURCE_WORD - The key word that have been used to marke the dynamic data like if it is "data" and the key is "name" the html inplementaion shold be like "data.name" and it is "data" by default.
   */
  async sendEmail({ to, subject, text, file, html, log = false }) {
    this.#queue.push({
      to,
      subject,
      text,
      file,
      html,
      log,
      user: this.#user,
      pass: this.#pass,
    });
    if (this.#queue.length < 1) return;
    for (let i = 0; i < this.#queue.length; i++) {
      await this.#sendEmail(this.#queue[i]);
    }
    this.#queue = [];
  }
  /**
   * Sends an email this methode support files attachment and html teamplate out of the box .
   * @param {object} options - The email options.
   * @param {string} options.to - The recipient's email address.
   * @param {string} options.subject - The subject of the email.
   * @param {(string|undefined)} options.text - The body text of the email.
   * @param {object} [options.file] - The file to attach to the email.
   * @param {string} options.file.mime_type - The MIME type of the file.
   * @param {string} options.file.name - The name of the file.
   * @param {(Buffer|boolean)} options.file.buffer - The file buffer or false if there is no file.
   * @param {string} options.html - The HTML content options.
   * @param {string} options.user - The HTML content options.
   * @param {string} options.pass - The HTML content options.
   * @returns {(string|object|Error)}- return text if you don't attach a html page or a object that has the complied html file and the words thats replaced if you attach a html file or throw error if the proccess was faild.
   */
  async #sendEmail({ to, subject, text, file, html, log, user, pass }) {
    if (!user || !pass)
      throw new Error(
        "you cant use this foncunality without entering your credentials (the only mode avaliabel is the sendFromAccount mode)"
      );
    try {
      const boundary = "data";
      const data = [];
      await this.#connect();
      await this.#sendCommend(`EHLO ${this.#host_service.smtp_host}`, log);
      await this.#sendCommend(`AUTH LOGIN`, log);
      await this.#sendCommend(`${Buffer.from(user).toString("base64")}`, log);
      await this.#sendCommend(
        `${Buffer.from(this.#pass).toString("base64")}`,
        log
      );
      await this.#sendCommend(`MAIL FROM:<${user}>`, log);
      await this.#sendCommend(`RCPT TO:<${to}>`, log);
      await this.#sendCommend(`DATA`, log);
      data.push(
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        `Content-Type: ${!html ? "text/plain" : "text/html"}; charset=utf-8`,
        "",
        !html ? text : html
      );
      if (file?.buffer) {
        data.push(
          `--${boundary}`,
          `Content-Type: ${file.mime_type}; name="${file.name}"`,
          "Content-Transfer-Encoding: base64",
          `Content-Disposition: attachment; filename="${file.name}"`,
          "",
          Buffer.from(file.buffer).toString("base64")
        );
      }
      data.push(`--${boundary}--`, ".", "");
      await this.#sendCommend(data.join("\r\n"), log);
      await this.#sendCommend("QUIT", log);
      this.#connection.end();
      return html || text;
    } catch (err) {
      throw err;
    }
  }
  /**
   *
   * @param {string} commend
   * @param {boolean} log - default `false`
   * @returns
   */
  #sendCommend(commend, log = false) {
    return new Promise((resolve, reject) => {
      this.#connection.write(commend + "\r\n", "utf8", () => {});
      this.#connection.once("data", (data) => {
        this.#connection.removeAllListeners("error");
        this.#connection.removeAllListeners("data");
        resolve(data.toString());
        log && console.log(data.toString());
      });
      this.#connection.once("error", (err) => {
        reject(err);
      });
    });
  }
  async #connect() {
    return await new Promise((resolve, reject) => {
      if (!this.#host_service.secure_smtp_port)
        reject(new Error("you can't use unsecure smtp port "));
      const connection = tls.connect(
        {
          port: this.#host_service.secure_smtp_port,
          host: this.#host_service.smtp_host,
        },
        () => {
          if (connection.authorized) {
            this.#connection = connection;
            resolve();
          } else {
            const error = new Error(
              "TLS authorization error: " + connection.authorizationError
            );
            reject(error);
            console.error(error);
          }
        }
      );
    });
  }

  /**
   * Updates the sender's email credentials for the mailer instance.
   * This method allows you to change the email and password used for sending emails without creating a new object.
   *
   * @param {object} options - The new credentials.
   * @param {string} [options.user] - The new sender's email address. If not provided, the current email will be retained.
   * @param {string} [options.pass] - The new sender's email password. If not provided, the current password will be retained.
   *
   * @returns {this} - Returns the mailer instance to allow method chaining.
   *
   * @example
   * mailer.updateCredentials({ user: 'newuser@example.com', pass: 'newpassword' });
   */

  updateCredentials({ user = this.#user, pass = this.#pass }) {
    this.#user = user;
    this.#pass = pass;
    return this;
  }
  switchHostService({ host_service = this.#host_service }) {
    this.#host_service = host_service;
    return this;
  }
}
export default Mailer;
