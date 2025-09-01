# esay_mailer Package

This package provides a simple and robust solution for sending emails using various SMTP services. It supports file attachments, HTML templates, and JSX template compilation out of the box.

## Features

- Send emails with text or HTML content
- Attach files to emails
- Supports most popular SMTP services like (Gmail, Outlook, Yahoo, etc.) without any extra configurations
- **JSX Template Support** - Write email templates using JSX syntax with Preact
- **Template Compilation** - Compile JSX templates to optimized JavaScript for production
- **CLI Tools** - Command-line interface for template precompilation and optimization
- **Email Queue System** - Built-in queuing for batch email sending
- **TypeScript Support** - Full TypeScript definitions included

## Installation

To install the package, use npm:

```bash
npm install esay_mailer
```

The package includes a CLI tool that will be available as `esay_mailer` after installation.

## Usage

```javascript
const Mailer = require("esay_mailer");
const mailer = new Mailer(options);
```

### TypeScript Usage

If you're using TypeScript, the package ships a declaration file (`index.d.ts`) so you can import and get proper types. Because this package uses a CommonJS `export =` style, import it like this:

```ts
import Mailer from "esay_mailer";

const mailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
  user: "your-email@gmail.com",
  pass: "your-password",
});

// typed send example
const options: Mailer.SendEmailOptions = {
  to: "recipient@example.com",
  subject: "Hello from TypeScript",
  text: "This is a typed send",
};

await mailer.sendEmail(options);
```

### Creating a Mailer Instance

You can create a Mailer instance using the default settings for popular SMTP services or provide your own custom configuration.

#### Example 1: Using Gmail Configuration

```javascript
const Mailer = require("esay_mailer");
const gmailMailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
  user: "your-email@gmail.com",
  pass: "your-password",
});
```

#### Example 2: Using Custom Configuration

```javascript
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

> You can send an email with or without attachments and with text or HTML content.

#### Example 1: Sending a Text Email

```javascript
const options = {
  to: "recipient@example.com",
  subject: "Test Email",
  text: "Hello, this is a test email!",
};

gmailMailer
  .sendEmail(options)
  .then(() => {
    console.log("Email sent successfully!");
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

> The `sendEmail` method returns a Promise that resolves when the email is successfully sent. The method uses a queue system for better reliability.

#### Example 2: Sending an HTML Email with Attachment

```javascript
const options = {
  to: "recipient@example.com",
  subject: "Test Email with Attachment",
  html: "<p>Hello, this is a test email!</p><p>Replace this: data.name</p>",
  file: {
    mime_type: "application/pdf",
    name: "test.pdf",
    buffer: yourFileBuffer,
  },
};

gmailMailer
  .sendEmail(options)
  .then(() => {
    console.log("Email sent successfully with HTML and attachment");
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

#### Example 3: Sending HTML Email with Template Data Replacement

```javascript
const options = {
  to: "recipient@example.com",
  subject: "Welcome Email",
  html: {
    STRING_CODE: "<p>Hello data.name, welcome to data.company!</p>",
    DATA_TO_REPLACE: { name: "John Doe", company: "Acme Corp" },
    SOURCE_WORD: "data", // optional, defaults to "data"
  },
};

await gmailMailer.sendEmail(options);
```

> To send using different credentials at runtime, call `updateCredentials({ user, pass })` on the Mailer instance, then call `sendEmail`. `sendEmail` uses the instance's credentials.

#### Example: Sending an email after changing credentials

```javascript
const Mailer = require("esay_mailer");
const gmailMailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
  user: "your-email@gmail.com",
  pass: "your-password",
});
const options = {
  to: "recipient@example.com",
  subject: "Test Email with Attachment",
  html: "<p>Hello, this is a test email!</p><p>Replace this: data.name</p>",
  file: {
    mime_type: "application/pdf",
    name: "test.pdf",
    buffer: yourFileBuffer,
  },
};

// change the credentials on the instance, then send
gmailMailer
  .updateCredentials({
    user: "different-email@gmail.com",
    pass: "different-password",
  })
  .sendEmail(options)
  .then(() => {
    console.log("Email sent successfully with new credentials!");
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

#### Example: Create Mailer without default credentials and send after setting credentials

```javascript
const Mailer = require("esay_mailer");
const gmailMailer = new Mailer({
  host_service: Mailer.HOSTS_DEFAULT_LIST.GMAIL,
});
const options = {
  to: "recipient@example.com",
  subject: "Test Email with Attachment",
  html: "<p>Hello, this is a test email!</p><p>Replace this: data.name</p>",
  file: {
    mime_type: "application/pdf",
    name: "test.pdf",
    buffer: yourFileBuffer,
  },
};

// set credentials then send
gmailMailer
  .updateCredentials({
    user: "different-email@gmail.com",
    pass: "different-password",
  })
  .sendEmail(options)
  .then(() => {
    console.log("Email sent successfully!");
  })
  .catch((error) => {
    console.error("Error sending email:", error);
  });
```

> It is important to know that if you try to send Email using `sendEmail` method in this case it will throw an error because you don't specify the default credentials.

> The `updateCredentials` method returns the instance of the class that you are using.

### Update Mailer Data

> You can at any time update the `mailer` instance data and it goes like this:

```javascript
mailer.updateCredentials({
  user: "example@hotmail.com",
  pass: "password",
});
mailer.switchHostService({ host_service: Mailer.HOSTS_DEFAULT_LIST.HOTMAIL });
```

> It's helpful to know that these methods return the `mailer object` itself or what we named earlier the instance of the class that you are using so it means that you can also chain them:

```javascript
mailer
  .updateCredentials({
    user: "example@hotmail.com",
    pass: "password",
  })
  .switchHostService({ host_service: Mailer.HOSTS_DEFAULT_LIST.HOTMAIL })
  .sendEmail(options);
```

## JSX Templates

> The package now supports JSX templates using Preact for creating dynamic HTML emails with a React-like syntax.

### Creating JSX Templates

Create a JSX file for your email template:

```jsx
// templates/Welcome.jsx
export default function Welcome({ name, company }) {
  return (
    <html>
      <body>
        <h1>Welcome to {company}!</h1>
        <p>Hello {name}, thank you for joining us.</p>
        <div style={{ backgroundColor: "#f0f0f0", padding: "20px" }}>
          <p>This email was generated using JSX templates.</p>
        </div>
      </body>
    </html>
  );
}
```

### Using JSX Templates in Emails

```javascript
import { renderTemplate } from "esay_mailer/template.mjs";

// Render the template with props
const htmlContent = await renderTemplate("./templates/Welcome.jsx", {
  name: "John Doe",
  company: "Acme Corp",
});

// Send email with rendered template
const options = {
  to: "recipient@example.com",
  subject: "Welcome to our platform!",
  html: htmlContent,
};

await gmailMailer.sendEmail(options);
```

### TypeScript Support for Templates

```ts
import { renderTemplate } from "esay_mailer/template.mjs";

const html = await renderTemplate("./templates/Welcome.jsx", {
  name: "itachi880",
  company: "Tech Corp",
});
```

## CLI Tools

> The package includes a command-line interface for optimizing JSX templates in production environments.

### Available Commands

```bash
# Precompile all JSX templates for better performance
npx esay_mailer precompile <templates-directory>

# Remove Babel dependencies and shrink package size (production optimization)
npx esay_mailer optimize

# Fix issues by forcing package reinstallation
npx esay_mailer restore

# Precompile and optimize in one step
npx esay_mailer build <templates-directory>
```

### Production Optimization Workflow

```bash
# 1. Precompile your templates
npx esay_mailer precompile ./email-templates

# 2. Optimize package size by removing development dependencies
npx esay_mailer optimize

# Or do both in one step
npx esay_mailer build ./email-templates
```

> After optimization, the package size is significantly reduced as Babel dependencies are removed, and templates are pre-compiled for faster rendering.

## Email Queue System

> The package includes a built-in email queue system that automatically handles batch email sending and provides better reliability.

### How the Queue Works

When you call `sendEmail()`, emails are automatically added to an internal queue and processed sequentially:

```javascript
// These emails will be queued and sent one after another
await gmailMailer.sendEmail({
  to: "user1@example.com",
  subject: "Email 1",
  text: "Hello 1",
});
await gmailMailer.sendEmail({
  to: "user2@example.com",
  subject: "Email 2",
  text: "Hello 2",
});
await gmailMailer.sendEmail({
  to: "user3@example.com",
  subject: "Email 3",
  text: "Hello 3",
});
```

### Queue Benefits

- **Sequential Processing**: Emails are sent one at a time to avoid overwhelming SMTP servers
- **Error Isolation**: If one email fails, others in the queue continue processing
- **Memory Management**: The queue is automatically cleared after processing
- **Rate Limiting**: Built-in protection against sending emails too quickly

### Debugging with Logging

Enable logging to monitor queue processing:

```javascript
const options = {
  to: "recipient@example.com",
  subject: "Test Email",
  text: "Hello, this is a test email!",
  log: true, // Enable logging
};

await gmailMailer.sendEmail(options);
```

## API

### Class: Mailer

#### `new Mailer(options)`

- **options**: `Object`
  - **host_service**: `HostService` (optional) - The host service configuration.
  - **user**: `string` (optional) - The user's email address.
  - **pass**: `string` (optional) - The user's email password.

### Method: `sendEmail(options)`

- **options**: `Object`

  - **to**: `string` - The recipient's email address.
  - **subject**: `string` - The subject of the email.
  - **text**: `string` (optional) - The body text of the email.
  - **file**: `Object` (optional) - The file to attach to the email.
    - **mime_type**: `string` - The MIME type of the file.
    - **name**: `string` - The name of the file.
    - **buffer**: `Buffer|boolean` - The file buffer or false if there is no file.
  - **html**: `string|Object` (optional) - The HTML content. Can be a plain HTML string or an object with template options.
    - **STRING_CODE**: `string` - The HTML source code.
    - **DATA_TO_REPLACE**: `Object` - The keys that need to be replaced dynamically.
    - **SOURCE_WORD**: `string` (optional) - The keyword used to mark dynamic data (default is "data").
  - **log**: `boolean` (optional) - Enable logging for debugging (default: false).

- **Returns**: `Promise<void>` - Resolves when the email is successfully sent or rejects with an error.

### Method: `updateCredentials(options)`

- **options**: `Object`

  - **user**: `string` (optional) - The new user email address.
  - **pass**: `string` (optional) - The new password.

- **Returns**: `Mailer` - Returns the same Mailer instance for method chaining.

### Method: `switchHostService(options)`

- **options**: `Object`

  - **host_service**: `HostService` (optional) - The new host service configuration.

- **Returns**: `Mailer` - Returns the same Mailer instance for method chaining.

### Static Property: `HOSTS_DEFAULT_LIST`

An object containing the default settings for the most used SMTP services like Gmail, Outlook, Yahoo, etc.

Available services:

- `Mailer.HOSTS_DEFAULT_LIST.GMAIL`
- `Mailer.HOSTS_DEFAULT_LIST.YAHOO`
- `Mailer.HOSTS_DEFAULT_LIST.OUTLOOK`
- `Mailer.HOSTS_DEFAULT_LIST.HOTMAIL`
- `Mailer.HOSTS_DEFAULT_LIST.AOL`
- `Mailer.HOSTS_DEFAULT_LIST.I_CLOUD`
- `Mailer.HOSTS_DEFAULT_LIST.ZOHO`
- `Mailer.HOSTS_DEFAULT_LIST.MAIL`
- `Mailer.HOSTS_DEFAULT_LIST.PROTONMAIL`
- `Mailer.HOSTS_DEFAULT_LIST.GMX`

#### HostService

- **domain**: `string` - The email domain (e.g., "gmail.com").
- **smtp_host**: `string` - The SMTP host (e.g., "smtp.gmail.com").
- **smtp_port**: `number` - The SMTP port (e.g., 587).
- **secure_smtp_port**: `number` - The secure SMTP port (e.g., 465).

## Template Functions

### Function: `renderTemplate(filePath, props)`

Renders a JSX template file to an HTML string.

- **filePath**: `string` - The path to the JSX template file.
- **props**: `Object` (optional) - Props to pass into the JSX component.

- **Returns**: `Promise<string>` - The rendered HTML string.

```javascript
import { renderTemplate } from "esay_mailer/template.mjs";

const html = await renderTemplate("./templates/Welcome.jsx", {
  name: "John Doe",
  company: "Acme Corp",
});
```

### Template Caching and Performance

The template system includes intelligent caching:

- **Development Mode**: Templates are recompiled when source files change
- **Production Mode**: Templates can be precompiled for optimal performance
- **Memory Caching**: Compiled templates are cached in memory to avoid redundant compilation

## Error Handling

The package includes comprehensive error handling:

- **Connection Errors**: Automatic retry logic for temporary connection issues
- **Authentication Errors**: Clear error messages for credential problems
- **Template Compilation Errors**: Detailed error reporting for JSX syntax issues
- **Queue Management**: Failed emails are logged and can be retried

## License

This project is licensed under the ISC License.
