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

// Optional. Leave "" to use the spreadsheet this script is bound to.
var SPREADSHEET_ID = "";

// Public URL of the beginner's guide PDF. Must be reachable with a plain
// GET (no login) — this is what gets fetched and attached to the email.
var GUIDE_PDF_URL = "https://mentalitybjj.github.io/Mentality-Jiu-Jitsu-Your-First-Month.pdf";

var TABS = {
  'trial-booking': {
    name: 'Trial bookings',
    headers: ['Received', 'Program', 'Class', 'Day', 'Time', 'First name',
              'Last name', 'Mobile', 'Email', 'Experience', 'Marketing consent', 'Page']
  },
  'guide-download': {
    name: 'Guide downloads',
    headers: ['Received', 'First name', 'Email', 'Page']
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

    // Honeypot: the form has a hidden "company" field no human ever fills in.
    // Bots fill every field. Accept silently so they do not retry.
    if (data.company) return reply({ ok: true });

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
    } else {
      if (!data.email) return reply({ ok: false, error: 'Missing email' });
      row = [now, data.firstName, data.email, data.page];
    }

    sheet.appendRow(row.map(function (v) { return v === undefined ? '' : v; }));
    notify(data);
    if (data.type === 'guide-download') sendGuide(data);
    return reply({ ok: true });

  } catch (err) {
    // Surface the failure to the site so it shows an error instead of a
    // false "You're booked in".
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

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
