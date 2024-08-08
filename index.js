const tls = require("tls");
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
 * @example
 * // Example 1: Using Gmail configuration
 * const gmailMailer = new Mailer({
 *   host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
 *   user: "your-email@gmail.com",
 *   pass: "your-password"
 * });
 *
 * @example
 * // Example 2: Using costume configuration
 * const costumeMailer = new Mailer({
 *   host_service: {      
 *    domain: "example.com",
      smtp_host: "smtp.example.com",
      smtp_port: 587,
      secure_smtp_port: 465
      },
 *   user: "your-email@example.com",
 *   pass: "your-password"
 * });
 */
class Mailer {
  /**
   *object contains the default setting for the most used smtp servecis like [gmail, outlook] and more.
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

  constructor({
    host_service = {
      domain: "",
      smtp_host: "",
      smtp_port: "",
      secure_smtp_port: "",
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
   * @returns {(string|object|Error)}- return text if you don't attach a html page or a object that has the complied html file and the words thats replaced if you attach a html file or throw error if the proccess was faild.
   */
  async sendEmail({
    to,
    subject,
    text,
    file = { mime_type: "", name: "", buffer: false },
    html = { STRING_CODE: "", DATA_TO_REPLACE: {}, SOURCE_WORD: "data" },
  }) {
    if (!this.#user || !this.#pass)
      throw new Error(
        "you cant use this foncunality without entering your credentials (the only mode avaliabel is the sendFromAccount mode)"
      );
    try {
      const boundary = "data";
      const data = [];
      await this.#connect();
      await this.#sendCommend(`EHLO ${this.#host_service.smtp_host}`);
      await this.#sendCommend(`AUTH LOGIN`);
      await this.#sendCommend(`${Buffer.from(this.#user).toString("base64")}`);
      await this.#sendCommend(`${Buffer.from(this.#pass).toString("base64")}`);
      await this.#sendCommend(`MAIL FROM:<${this.#user}>`);
      await this.#sendCommend(`RCPT TO:<${to}>`);
      await this.#sendCommend(`DATA`);
      html.Compiled = html.STRING_CODE.length > 0 ? {} : false;
      data.push(
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        `Content-Type: ${
          html.STRING_CODE.length <= 0 ? "text/plain" : "text/html"
        }; charset=utf-8`,
        "",
        html.STRING_CODE.length <= 0
          ? text
          : (() => {
              html.Compiled = this.#HTMLCompile({
                STRING_CODE: html.STRING_CODE,
                DATA_TO_REPLACE: html.DATA_TO_REPLACE,
                SOURCE_WORD: html.SOURCE_WORD,
              });
              return html.Compiled.Compiled_String;
            })()
      );
      if (file.buffer)
        data.push(
          `--${boundary}`,
          `Content-Type: ${file.mime_type}; name="${file.name}"`,
          "Content-Transfer-Encoding: base64",
          `Content-Disposition: attachment; filename="${file.name}"`,
          "",
          Buffer.from(file.buffer).toString("base64")
        );
      data.push(`--${boundary}--`, ".", "");
      await this.#sendCommend(data.join("\r\n"));
      this.#sendCommend("QUIT");
      return html || text;
    } catch (err) {
      throw err;
    }
  }
  /**
   * Sends an email using specified sender credentials, supporting file attachments and HTML templates.
   * This method allows sending an email from a different account without creating a new object.
   *
   * @param {object} options - The email and sender options.
   * @param {string} options.user - The sender's email address.
   * @param {string} options.pass - The sender's email password.
   * @param {string} options.to - The recipient's email address.
   * @param {string} options.subject - The subject of the email.
   * @param {(string|undefined)} options.text - The body text of the email.
   * @param {object} [options.file] - The file to attach to the email.
   * @param {string} options.file.mime_type - The MIME type of the file.
   * @param {string} options.file.name - The name of the file.
   * @param {(Buffer|boolean)} options.file.buffer - The file buffer or `false` if there is no file.
   * @param {object} [options.html] - The HTML content options.
   * @param {string} options.html.STRING_CODE - The HTML source code.
   * @param {object} options.html.DATA_TO_REPLACE - The keys that need to be replaced dynamically.
   * @param {string} options.html.SOURCE_WORD - The keyword used to mark dynamic data (e.g., if "data" is used and the key is "name", the HTML implementation should be like "data.name"). The default is "data".
   *
   * @returns {this} - Returns the mailer instance to allow method chaining if the proccess compleated successfuly or throw error if not.
   *
   * @example
   * await mailer.sendFrom({
   *   user: 'sender@example.com',
   *   pass: 'password',
   *   to: 'recipient@example.com',
   *   subject: 'Hello',
   *   text: 'This is a test email.',
   *   file: { mime_type: 'text/plain', name: 'test.txt', buffer: fileBuffer },
   *   html: { STRING_CODE: htmlString, DATA_TO_REPLACE: { name: 'John' }, SOURCE_WORD: 'data' }
   * });
   */

  async sendFromAccount({
    user,
    pass,
    to,
    subject,
    text,
    file = { mime_type: "", name: "", buffer: false },
    html = { STRING_CODE: "", DATA_TO_REPLACE: {}, SOURCE_WORD: "data" },
  }) {
    let temp = { user: this.#user, pass: this.#pass };
    this.#user = user;
    this.#pass = pass;
    try {
      await this.sendEmail({ to, subject, text, file, html });
      this.#user = temp.user;
      this.#pass = temp.pass;
      temp = null;
      return this;
    } catch (err) {
      this.#user = temp.user;
      this.#pass = temp.pass;
      temp = null;
      throw err;
    }
  }
  #sendCommend(commend) {
    return new Promise((resolve, reject) => {
      this.#connection.write(commend + "\r\n", "utf8", () => {});
      this.#connection.once("data", (data) => {
        resolve(data.toString());
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
  #HTMLCompile({ STRING_CODE, DATA_TO_REPLACE = {}, SOURCE_WORD = "data" }) {
    let page = STRING_CODE.split(/(\s+|\}\{|\}{|}\{|<|>)/) || [];
    let words = [];
    page = page.map((word) => {
      let index = word.indexOf(SOURCE_WORD + ".");
      let word_obj = word.substring(index + SOURCE_WORD.length + 1);
      if (index >= 0 && DATA_TO_REPLACE[word_obj]) {
        words.push(word);
        return DATA_TO_REPLACE[word_obj];
      }
      return word;
    });
    return { Compiled_String: page.join(""), replaced_words: words };
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
module.exports = Mailer;
