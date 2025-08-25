# esay_mailer Package

This package provides a simple and robust solution for sending emails using various SMTP services. It supports file attachments and HTML templates out of the box.

## Features

- Send emails with text or HTML content with built-in teamplate
- Attach files to emails
- Supports most popular SMTP services like (Gmail, Outlook, Yahoo, etc.) without any extra configurations

## Installation

To install the package, use npm:

```node js
npm install esay_mailer
```

## Usage

```node js
const MailerClass = require("esay_mailer");
const Mailer = new MailerClass(options);
```

### TypeScript Usage

If you're using TypeScript, the package ships a declaration file (`index.d.ts`) so you can import and get proper types. Because this package uses a CommonJS `export =` style, import it like this:

```ts
import Mailer = require('esay_mailer');

const mailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
  user: 'your-email@gmail.com',
  pass: 'your-password',
});

// typed send example
const options: Mailer.SendEmailOptions = {
  to: 'recipient@example.com',
  subject: 'Hello from TypeScript',
  text: 'This is a typed send',
};

await mailer.sendEmail(options);
```

### Creating a Mailer Instance

You can create a Mailer instance using the default settings for popular SMTP services or provide your own custom configuration.

#### Example 1: Using Gmail Configuration

```node js
const Mailer = require("esay_mailer");
const gmailMailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
  user: "your-email@gmail.com",
  pass: "your-password",
});
```

#### Example 2: Using Custom Configuration

```node js
const customMailer = new Mailer({
  host_service: {
    domain: "example.com",
    smtp_host: "smtp.example.com",
    smtp_port: 587,
    secure_smtp_port: 465,
  },
  user: "your-email@example.com",
  pass: "your-password",
});
```

### Sending an Email

> You can send an email with or without attachments and with text or HTML content .

#### Example 1: Sending a Text Email

```node js
const options = {
  to: "recipient@example.com",
  subject: "Test Email",
  text: "Hello, this is a test email!",
};

gmailMailer
  .sendEmail(options)
  .then((response) => {
    console.log("Email sent successfully:", response);
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

> the `response` from the promise in this case will be the text that you sent and if you send a html insted the `response` will be a `object`

#### Example 2: Sending an HTML Email with Attachment

```node js
const options = {
  to: "recipient@example.com",
  subject: "Test Email with Attachment",
  html: {
    STRING_CODE:
      "<p>Hello, this is a test email!</p><p>Replace this: data.name</p>",
    DATA_TO_REPLACE: { name: "John Doe" },
    SOURCE_WORD: "data",
  },
  file: {
    mime_type: "application/pdf",
    name: "test.pdf",
    buffer: yourFileBuffer,
  },
};

gmailMailer
  .sendEmail(options)
  .then((response) => {
    console.log("Email sent successfully with HTML and attachment:", response);
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

> To send using different credentials at runtime, call `updateCredentials({ user, pass })` on the Mailer instance, then call `sendEmail`. `sendEmail` uses the instance's credentials.

#### Example: Sending an email after changing credentials

```node js
const Mailer = require("esay_mailer");
const gmailMailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
  user: "your-email@gmail.com",
  pass: "your-password",
});
const options = {
  to: "recipient@example.com",
  subject: "Test Email with Attachment",
  html: {
    STRING_CODE:
      "<p>Hello, this is a test email!</p><p>Replace this: data.name</p>",
    DATA_TO_REPLACE: { name: "John Doe" },
    SOURCE_WORD: "data",
  },
  file: {
    mime_type: "application/pdf",
    name: "test.pdf",
    buffer: yourFileBuffer,
  },
};

// change the credentials on the instance, then send
gmailMailer
  .updateCredentials({ user: "different-email@gmail.com", pass: "different-password" })
  .sendEmail(options)
  .then(() => {
    // logic after sending
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

#### Example: Create Mailer without default credentials and send after setting credentials

```node js
const Mailer = require("esay_mailer");
const gmailMailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
});
const options = {
  to: "recipient@example.com",
  subject: "Test Email with Attachment",
  html: {
    STRING_CODE:
      "<p>Hello, this is a test email!</p><p>Replace this: data.name</p>",
    DATA_TO_REPLACE: { name: "John Doe" },
    SOURCE_WORD: "data",
  },
  file: {
    mime_type: "application/pdf",
    name: "test.pdf",
    buffer: yourFileBuffer,
  },
};

// set credentials then send
gmailMailer
  .updateCredentials({ user: "different-email@gmail.com", pass: "different-password" })
  .sendEmail(options)
  .then(() => {
    // to some logic after sending the email
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

> it is importent to know that if you try to send Email using `sendEmail` methode in this case it will throw an error because you dont specify the default credentials

> the `sendFromAccount` methode resolve the instance of the class that you are using

### Update Mailer Data

> you can at any time update the `mailer` instance data and it goes like

```node js
mailer.updateCredentials({
  user: "example@hotmail.com",
  pass: "password",
});
mailer.switchHostService({ host_service: Mailer.HOSTS_DEFAULT_LIST.HOTMAIL });
```

> it's helpfull to know that these methodes return the `mailer object` it self or what we name it earlyer the instance of the class that you are using so it means that you can also

```node js
mailer
  .updateCredentials({
    user: "example@hotmail.com",
    pass: "password",
  })
  .switchHostService({ host_service: Mailer.HOSTS_DEFAULT_LIST.HOTMAIL })
  .sendEmail(options);
```

## API

### Class: Mailer

#### `new Mailer(options)`

- **options**: `Object`
  - **host_service**: `HostService` (required) - The host service configuration.
  - **user**: `string` - The user's email address.
  - **pass**: `string` - The user's email password.

### Method: `sendEmail(options)`

- **options**: `Object`

  - **to**: `string` - The recipient's email address.
  - **subject**: `string` - The subject of the email.
  - **text**: `string` (optional) - The body text of the email.
  - **file**: `Object` (optional) - The file to attach to the email.
    - **mime_type**: `string` - The MIME type of the file.
    - **name**: `string` - The name of the file.
    - **buffer**: `Buffer|boolean` - The file buffer or false if there is no file.
  - **html**: `Object` (optional) - The HTML content options.
    - **STRING_CODE**: `string` - The HTML source code.
    - **DATA_TO_REPLACE**: `Object` - The keys that need to be replaced dynamically.
    - **SOURCE_WORD**: `string` (optional) - The keyword used to mark dynamic data (default is "data").

- **Returns**: `Promise<string|object|Error>` - Returns text if you don't attach an HTML page or an object that has the compiled HTML file and the words replaced if you attach an HTML file or throws an error if the process fails.

### Static Property: `HOSTS_DEFAULT_LIST`

An object containing the default settings for the most used SMTP services like Gmail, Outlook, Yahoo, etc.

#### HostService

- **domain**: `string` - The email domain (e.g., "gmail.com").
- **smtp_host**: `string` - The SMTP host (e.g., "smtp.gmail.com").
- **smtp_port**: `number` - The SMTP port (e.g., 587).
- **secure_smtp_port**: `number` - The secure SMTP port (e.g., 465).

#### built-in HTML teampleat

we develop a simple html teampleat to help you change the content dinamicly for the reciver it goes like this

```html
<div>hello data.name your request for data.request is data.requeststatus</div>
```

```node js
const options = {
  to: "recipient@example.com",
  subject: "Test Email with Attachment",
  html: {
    STRING_CODE: fs.readFileSync(path / to / htmlfile, "utf-8"),
    DATA_TO_REPLACE: {
      name: "John Doe",
      request: "by a phone",
      requeststatus: "compleated successfuly",
    },
    SOURCE_WORD: "data",
  },
};
mailer.sendEmail(options);
```

We rely on a word you give us, `SOURCE_WORD`, and the schema to change any data in HTML to the corresponding data from the server or the database. The format is `SOURCE_WORD.key`, where the key is from the **DATA_TO_REPLACE** `object`.

## License

This project is licensed under the MIT License.
