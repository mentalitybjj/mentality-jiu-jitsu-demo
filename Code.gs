/**
 * MENTALITY JIU JITSU — form receiver
 * Receives submissions from the website, appends them to this spreadsheet,
 * and emails the beginner's guide PDF to anyone who requests it. The site
 * itself never hands out the PDF directly — the whole point of the form is
 * that the guide only ever arrives by email.
 *
 * SETUP
 *  1. Create a Google Sheet. Extensions -> Apps Script. Paste this file in,
 *     replacing anything already there. Save.
 *  2. Deploy -> New deployment -> type "Web app".
 *       Execute as:      Me
 *       Who has access:  Anyone        <-- must be "Anyone", NOT
 *                                          "Anyone with a Google account".
 *                                          Site visitors are not signed in.
 *  3. Authorise when prompted. Google will warn the app is unverified —
 *     that is expected for your own script. Advanced -> Go to (project).
 *  4. Copy the Web app URL (ends in /exec) and paste it into ENDPOINT
 *     near the bottom of index.html.
 *  5. Check GUIDE_PDF_URL below points at wherever the PDF is actually
 *     hosted (it defaults to the GitHub Pages URL). It has to be a public,
 *     directly-fetchable link — not a Google Drive "share" link.
 *
 * IMPORTANT: after any edit here, run Deploy -> Manage deployments ->
 * pencil icon -> Version: New version -> Deploy. Saving alone does not
 * update the live URL.
 */

// Optional. Leave "" to email nothing. Multiple addresses: "a@x.com,b@y.com"
var NOTIFY_EMAIL = "";

// Where "Send us a message" enquiries from the Visit page are emailed. This
// one always fires for contact-form submissions (it's the whole point of
// that form) — separate from the optional NOTIFY_EMAIL above.
var CONTACT_EMAIL = "mentalityjiujitsu@outlook.com";

// Optional. Leave "" to use the spreadsheet this script is bound to.
var SPREADSHEET_ID = "";

// Public URL of the beginner's guide PDF. Must be reachable with a plain
// GET (no login) — this is what gets fetched and attached to the email.
var GUIDE_PDF_URL = "https://mentalityjiujitsu.com/assets/docs/Mentality-Jiu-Jitsu-Your-First-Month.pdf";

// Used only to sign the footer of the branded contact-form email below.
// Keep these in sync with common.py on the site side if they ever change.
var PHONE_HUMAN = "+61 452 518 690";
var PHONE_TEL = "+61452518690";
var ADDRESS_LINE = "7/23 Corporation Cct, Tweed Heads South NSW 2486";

var TABS = {
  'trial-booking': {
    name: 'Trial bookings',
    headers: ['Received', 'Program', 'Class', 'Day', 'Time', 'First name',
              'Last name', 'Mobile', 'Email', 'Experience', 'Marketing consent', 'Page']
  },
  'guide-download': {
    name: 'Guide downloads',
    headers: ['Received', 'First name', 'Email', 'Page']
  },
  'contact': {
    name: 'Contact messages',
    headers: ['Received', 'Name', 'Email', 'Message', 'Page']
  }
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Serialise appends so two people submitting at once cannot collide.
    lock.waitLock(20000);

    if (!e || !e.postData || !e.postData.contents) {
      return reply({ ok: false, error: 'Empty request' });
    }

    var data = JSON.parse(e.postData.contents);
    console.log('doPost received type=%s honeypot=%s', data.type, JSON.stringify(data.company));

    // Honeypot: the form has a hidden field no human ever fills in (bots
    // fill every field). Accept silently so they do not retry. NOTE: this
    // used to be named "company", which browser autofill (saved business/
    // address profiles) would sometimes fill in on real visitors, silently
    // discarding their genuine submissions. It has been renamed to
    // something autofill heuristics won't recognise.
    if (data.company) {
      console.log('honeypot tripped, discarding silently');
      return reply({ ok: true });
    }

    var spec = TABS[data.type];
    if (!spec) return reply({ ok: false, error: 'Unknown submission type' });

    var sheet = getSheet(spec);
    var now = new Date();
    var row;

    if (data.type === 'trial-booking') {
      if (!data.firstName || !data.email) {
        return reply({ ok: false, error: 'Missing required fields' });
      }
      row = [now, data.program, data.className, data.classDay, data.classTime,
             data.firstName, data.lastName, asText(data.mobile), data.email,
             data.experience, data.marketingConsent, data.page];
    } else if (data.type === 'contact') {
      if (!data.name || !data.email || !data.message) {
        return reply({ ok: false, error: 'Missing required fields' });
      }
      row = [now, data.name, data.email, data.message, data.page];
    } else {
      if (!data.email) return reply({ ok: false, error: 'Missing email' });
      row = [now, data.firstName, data.email, data.page];
    }

    sheet.appendRow(row.map(function (v) { return v === undefined ? '' : v; }));
    console.log('row appended to sheet "%s"', spec.name);
    notify(data);
    if (data.type === 'guide-download') sendGuide(data);
    if (data.type === 'contact') sendContactEmail(data);
    console.log('doPost finished ok for type=%s', data.type);
    return reply({ ok: true });

  } catch (err) {
    // Surface the failure to the site so it shows an error instead of a
    // false "You're booked in". Logged too, since the client currently
    // can't read this response body (see site.js / ENDPOINT comment).
    console.error('doPost error: %s', err && err.stack ? err.stack : String(err));
    return reply({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

/** Lets you confirm the deployment is live by opening the /exec URL. */
function doGet() {
  return reply({ ok: true, status: 'Mentality form receiver is running' });
}

function getSheet(spec) {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(spec.name);
  if (!sheet) {
    sheet = ss.insertSheet(spec.name);
    sheet.appendRow(spec.headers);
    sheet.getRange(1, 1, 1, spec.headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1)
         .setNumberFormat('yyyy-mm-dd hh:mm');
  }
  return sheet;
}

/** Keeps 04xx numbers from being mangled into 4xx by Sheets. */
function asText(v) {
  return v ? "'" + String(v).trim() : '';
}

function notify(data) {
  if (!NOTIFY_EMAIL) return;
  try {
    var subject, body;
    if (data.type === 'trial-booking') {
      subject = 'New trial booking — ' + data.firstName + ' ' + (data.lastName || '');
      body = [
        'Program:    ' + data.program,
        'Class:      ' + data.className,
        'When:       ' + data.classDay + ', ' + data.classTime,
        '',
        'Name:       ' + data.firstName + ' ' + (data.lastName || ''),
        'Mobile:     ' + data.mobile,
        'Email:      ' + data.email,
        'Experience: ' + data.experience,
        'Marketing:  ' + data.marketingConsent
      ].join('\n');
    } else if (data.type === 'contact') {
      subject = 'Website enquiry — ' + data.name;
      body = 'Name:    ' + data.name + '\nEmail:   ' + data.email + '\n\n' + data.message;
    } else {
      subject = 'Guide download — ' + data.firstName;
      body = 'Name:  ' + data.firstName + '\nEmail: ' + data.email;
    }
    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (ignored) {
    // Never let a mail failure lose the row that was already written.
  }
}

/**
 * Fetches the guide PDF and emails it to the person who requested it. This
 * is the actual delivery mechanism — the site's "Send me the guide" button
 * does not link to the PDF anywhere; it only ever arrives this way.
 */
function sendGuide(data) {
  if (!GUIDE_PDF_URL) return; // nothing to attach — misconfigured, skip quietly
  try {
    var resp = UrlFetchApp.fetch(GUIDE_PDF_URL, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return; // don't email a broken/missing PDF

    var pdf = resp.getBlob().setName('Mentality Jiu Jitsu - Your First Month.pdf');
    var first = (data.firstName || '').toString().trim();

    var body = [
      'Hey ' + (first || 'there') + ',',
      '',
      "Here's the guide — seven pages on what actually happens in your first month: what to bring, week by week, and the etiquette nobody explains up front. It's attached as a PDF.",
      '',
      "Haven't booked your three free classes yet? Just reply to this email or head back to the site.",
      '',
      'Mentality Jiu Jitsu',
      'Tweed Heads South'
    ].join('\n');

    MailApp.sendEmail({
      to: data.email,
      subject: "Your Mentality Jiu Jitsu beginner's guide",
      body: body,
      attachments: [pdf],
      name: 'Mentality Jiu Jitsu'
    });
  } catch (ignored) {
    // Never let a mail failure lose the row that was already written — the
    // sheet still has their email, so it can be sent manually if this fails.
  }
}

/**
 * Emails a "Send us a message" enquiry from the Visit page straight to
 * CONTACT_EMAIL. Unlike notify() above, this always runs for contact
 * submissions — the whole point of that form is that the message actually
 * reaches the inbox, not just the spreadsheet.
 */
function sendContactEmail(data) {
  if (!CONTACT_EMAIL) return; // misconfigured — the row is still in the sheet
  try {
    var name = (data.name || '').toString().trim();
    var body = [
      'New message from the website contact form:',
      '',
      'Name:  ' + name,
      'Email: ' + data.email,
      '',
      data.message,
      '',
      '—',
      'Page: ' + (data.page || '')
    ].join('\n');

    MailApp.sendEmail({
      to: CONTACT_EMAIL,
      replyTo: data.email,
      subject: 'Website enquiry from ' + (name || data.email),
      body: body,                              // plain-text fallback
      htmlBody: buildContactEmailHtml_(data),   // branded version most clients show
      name: 'Mentality Jiu Jitsu website'
    });
  } catch (ignored) {
    // Never let a mail failure lose the row that was already written — the
    // sheet still has the message, so it can be read there if this fails.
  }
}

/** Minimal HTML-escaping for anything pulled from a form submission before
 *  it goes into an email body. */
function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Builds the branded HTML version of the contact-form email, styled to
 * match the website (dark header band, cream card, the same monochrome
 * look as the site's own "band" sections). Table layout with every style
 * written inline — Outlook's desktop renderer (Word's HTML engine) ignores
 * <style> blocks and most modern CSS, so anything that has to look right
 * there has to be a table with inline attributes, not flexbox/grid.
 */
function buildContactEmailHtml_(data) {
  var name = escapeHtml_((data.name || '').toString().trim() || 'there');
  var email = escapeHtml_(data.email || '');
  var messageHtml = escapeHtml_(data.message || '').replace(/\n/g, '<br>');
  var page = escapeHtml_(data.page || '');
  var replyHref = 'mailto:' + encodeURIComponent(data.email || '');

  return ''
+'<!doctype html><html><head><meta charset="utf-8">'
+'<meta name="viewport" content="width=device-width,initial-scale=1"></head>'
+'<body style="margin:0;padding:0;background:#EFEBE1;">'
+'<div style="display:none;max-height:0;overflow:hidden;opacity:0;">New enquiry from '+name+' via the Mentality Jiu Jitsu website.</div>'
+'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEBE1;padding:32px 16px;">'
+'<tr><td align="center">'
+'<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid #DCD7C8;">'

  // header band
+'<tr><td align="center" style="background:#171717;padding:34px 24px;">'
+'<div style="font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:bold;letter-spacing:3px;color:#E9E5D9;">MENTALITY</div>'
+'<div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2px;color:#A8A392;margin-top:6px;text-transform:uppercase;">Jiu Jitsu &middot; Tweed Heads South</div>'
+'</td></tr>'

  // body
+'<tr><td style="padding:36px 36px 8px 36px;font-family:Helvetica,Arial,sans-serif;">'
+'<div style="font-size:11px;letter-spacing:2px;color:#8A8676;text-transform:uppercase;margin-bottom:10px;">New website enquiry</div>'
+'<div style="font-size:21px;font-weight:bold;color:#171717;margin-bottom:22px;">You&rsquo;ve got a message</div>'
+'</td></tr>'

+'<tr><td style="padding:0 36px;font-family:Helvetica,Arial,sans-serif;">'
+'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
+'<tr><td style="padding-bottom:16px;">'
+'<div style="font-size:10.5px;letter-spacing:1.5px;color:#8A8676;text-transform:uppercase;">Name</div>'
+'<div style="font-size:16px;color:#171717;font-weight:bold;margin-top:3px;">'+name+'</div>'
+'</td></tr>'
+'<tr><td style="padding-bottom:20px;">'
+'<div style="font-size:10.5px;letter-spacing:1.5px;color:#8A8676;text-transform:uppercase;">Email</div>'
+'<div style="font-size:16px;margin-top:3px;"><a href="'+replyHref+'" style="color:#171717;text-decoration:underline;">'+email+'</a></div>'
+'</td></tr>'
+'</table>'
+'</td></tr>'

+'<tr><td style="padding:0 36px 28px 36px;font-family:Helvetica,Arial,sans-serif;">'
+'<div style="font-size:10.5px;letter-spacing:1.5px;color:#8A8676;text-transform:uppercase;margin-bottom:8px;">Message</div>'
+'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5EF;border-left:3px solid #171717;">'
+'<tr><td style="padding:16px 18px;font-size:15px;line-height:1.6;color:#171717;">'+messageHtml+'</td></tr>'
+'</table>'
+'</td></tr>'

+'<tr><td align="center" style="padding:0 36px 36px 36px;">'
+'<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#171717;">'
+'<a href="'+replyHref+'" style="display:inline-block;padding:14px 30px;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#E9E5D9;text-decoration:none;">Reply to '+name+'</a>'
+'</td></tr></table>'
+'</td></tr>'

  // footer
+'<tr><td style="padding:22px 36px;background:#EFEBE1;border-top:1px solid #DCD7C8;font-family:Helvetica,Arial,sans-serif;">'
+'<div style="font-size:12px;color:#75726B;line-height:1.7;">'
+'Sent automatically from the &ldquo;Send us a message&rdquo; form on the Visit page'+(page ? ' &mdash; <a href="'+page+'" style="color:#75726B;">'+page+'</a>' : '')+'.<br>'
+ADDRESS_LINE+' &middot; <a href="tel:'+PHONE_TEL+'" style="color:#75726B;">'+PHONE_HUMAN+'</a>'
+'</div>'
+'</td></tr>'

+'</table>'
+'</td></tr>'
+'</table>'
+'</body></html>';
}

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
