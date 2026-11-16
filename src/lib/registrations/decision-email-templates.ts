/**
 * The decision emails exactly as drafted by Internal Relations (pixel "APP_CENTER" windows), with
 * the applicant's name and the Discord invitation filled in. Edit the HTML here to change them.
 */
import { escapeHtml } from "@/lib/email"

/** The members' server, for accepted applicants only: never share it elsewhere. */
const MEMBERS_DISCORD_INVITE = "https://discord.gg/6AqQRQgeg"
/** The public community server, open to everyone, in the refusal email. */
const COMMUNITY_DISCORD_INVITE = "https://discord.com/invite/cRKWK5bX2y"

/** "LASTNAME FIRSTNAME", as the greeting expects, escaped for HTML. */
function greetingName(firstName: string, lastName: string) {
  return escapeHtml(`${lastName} ${firstName}`.trim())
}

export function acceptanceHtml(firstName: string, lastName: string) {
  const name = greetingName(firstName, lastName)
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>MICRO CLUB // APP_CENTER</title>
<!-- Pixel fonts only load in Apple Mail & a few clients; everyone else gets Courier New (still retro) -->
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background:#0e21b1; }
  table { border-collapse:collapse; }
  img { border:0; display:block; }
  a { color:#14149e; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad  { padding:16px 14px !important; }
    .brand { font-size:18px !important; }
    .hello { font-size:24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#0e21b1;">

<!-- Outer blue background -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0e21b1" style="background:#0e21b1;">
<tr><td align="center" style="padding:28px 12px 48px;">

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- LOGO: replace src with the public URL where you host micro-club-logo.png -->
    <tr><td align="center" style="padding:0 0 18px;">
      <img src="https://3c5439981f.imgdist.com/pub/bfra/mqammozr/tr5/saw/9u7/mc-logo_1.png" alt="Micro Club" width="115" style="display:block;margin:0 auto;width:115px;height:auto;color:#ffffff;font-family:'Courier New',monospace;font-size:20px;font-weight:bold;">
    </td></tr>

    <!-- ===================== WINDOW 1 ===================== -->
    <tr><td style="padding:0 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#cfcfcf" style="background:#cfcfcf;border:2px solid #1a1a1a;">
        <tr><td style="padding:8px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #7a7a7a;border-bottom:2px solid #7a7a7a;">

          <!-- titlebar -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#1c1cc0" style="background:#1c1cc0;background-image:linear-gradient(90deg,#14149e,#2a2ad8);border:1px solid #0a0a5c;padding:13px 16px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:14px;line-height:20px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-transform:uppercase;">
              Micro Club // APP_CENTER
            </td></tr>
          </table>

          <!-- viewport -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
            <tr><td class="pad" bgcolor="#ececec" style="background:#ececec;padding:22px 24px;border-top:2px solid #7a7a7a;border-left:2px solid #7a7a7a;border-right:2px solid #ffffff;border-bottom:2px solid #ffffff;font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:24px;color:#111111;">

              <!-- banner -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
                <tr><td bgcolor="#14149e" style="background:#14149e;padding:16px 18px 14px;border-top:2px solid #4a4ad8;border-left:2px solid #4a4ad8;border-right:2px solid #07073a;border-bottom:2px solid #07073a;">
                  <div class="brand" style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:22px;line-height:28px;font-weight:bold;letter-spacing:2px;color:#ffffff;">MICRO CLUB</div>
                  <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:10px;line-height:16px;font-weight:bold;letter-spacing:1px;color:#c4c8ff;padding-top:10px;">WELCOME TO THE NEXT LEVEL</div>
                  <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:20px;line-height:26px;font-weight:bold;letter-spacing:1px;color:#ffffff;padding-top:14px;">[ INCOMING TRANSMISSION ]</div>
                </td></tr>
              </table>

              <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:22px;color:#111111;">APPLICATION UPDATE</div>
              <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:22px;color:#14149e;padding-bottom:14px;">SYSTEM STATUS: PROCESSING COMPLETE</div>

              <!-- file chip -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
                <tr><td bgcolor="#cfcfcf" style="background:#cfcfcf;padding:4px 12px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #4a4a4a;border-bottom:2px solid #4a4a4a;font-family:'VT323','Courier New',Courier,monospace;font-size:17px;line-height:22px;color:#111111;">
                  &#9635; MESSAGE_FROM_MICROCLUB.exe
                </td></tr>
              </table>

              <!-- greeting: the applicant's last and first name -->
              <div class="hello" style="font-family:'VT323','Courier New',Courier,monospace;font-size:28px;line-height:32px;font-weight:bold;color:#111111;padding-bottom:14px;">DEAR, ${name}!</div>

              <p style="margin:0 0 16px;">Your signal reached us!</p>

              <p style="margin:0 0 16px;">First, thank you for your time, enthusiasm, and interest in becoming part of Micro Club for the 2026/2027 academic year.</p>

              <p style="margin:0 0 14px;color:#14149e;">&gt;&gt; INITIATING RESULT DISPLAY...</p>

              <!-- readout box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
                <tr><td bgcolor="#f7f7ff" style="background:#f7f7ff;padding:12px 16px 14px;border:2px dashed #14149e;">
                  <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:10px;line-height:14px;font-weight:bold;color:#14149e;padding-bottom:10px;">SYSTEM STATUS</div>
                  <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:28px;line-height:32px;font-weight:bold;color:#111111;">ACCESS GRANTED!</div>
                  <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:22px;line-height:28px;font-weight:bold;color:#111111;">YOU'VE BEEN ACCEPTED!</div>
                  <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:16px;line-height:22px;color:#14149e;padding-top:8px;">USER STATUS: NEW MICRO CLUB MEMBER</div>
                </td></tr>
              </table>

              <p style="margin:0 0 16px;">We are delighted to welcome you to our community and look forward to having you as part of the club.</p>

              <p style="margin:0 0 16px;">You've officially unlocked your place in a community where ideas become projects, curiosity becomes knowledge, and people come together to create, learn, and build.</p>

              <p style="margin:0 0 16px;">Your next adventure starts here. Get ready to explore new possibilities, meet amazing people, and take on challenges with us!</p>

              <p style="margin:0;">Before you log in, take a moment to read this <a href="https://docs.google.com/document/d/1GlJGSv3PtZPeNiXc1k2ehkqaxDxCYAgBLLd4FSCCLMY/edit?tab=t.0" target="_blank" style="color:#14149e;text-decoration:underline;"><strong style="font-weight:bold;">Discord Guide</strong></a> &mdash; it will help you navigate our server without losing your way!</p>

            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>

    <!-- ===================== WINDOW 2: EVENTS ===================== -->
    <tr><td style="padding:0 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#cfcfcf" style="background:#cfcfcf;border:2px solid #1a1a1a;">
        <tr><td style="padding:8px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #7a7a7a;border-bottom:2px solid #7a7a7a;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#1c1cc0" style="background:#1c1cc0;background-image:linear-gradient(90deg,#14149e,#2a2ad8);border:1px solid #0a0a5c;padding:10px 14px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-transform:uppercase;">
              Micro Club // EVENTS
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
            <tr><td class="pad" bgcolor="#ececec" style="background:#ececec;padding:20px 22px;border-top:2px solid #7a7a7a;border-left:2px solid #7a7a7a;border-right:2px solid #ffffff;border-bottom:2px solid #ffffff;font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:24px;color:#111111;">
              <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:12px;line-height:22px;font-weight:bold;color:#14149e;padding-bottom:16px;">ICE-BREAK EVENT &ndash; NOVEMBER 23TH</div>
              <p style="margin:0 0 16px;">We will be holding our Ice-Break event on 23/11/2026. This event is specifically organized for our newly recruited members, giving you the opportunity to discover Micro Club in greater detail, learn about its departments, activities, and projects, and get to know the people you'll be working alongside.</p>
              <p style="margin:0;">(More details will be shared on the discord server)</p>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>

    <!-- ===================== WINDOW 3: JOIN SERVER ===================== -->
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#cfcfcf" style="background:#cfcfcf;border:2px solid #1a1a1a;">
        <tr><td style="padding:8px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #7a7a7a;border-bottom:2px solid #7a7a7a;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#1c1cc0" style="background:#1c1cc0;background-image:linear-gradient(90deg,#14149e,#2a2ad8);border:1px solid #0a0a5c;padding:10px 14px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-transform:uppercase;">
              Join Our Server
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
            <tr><td class="pad" bgcolor="#ececec" style="background:#ececec;padding:20px 22px;border-top:2px solid #7a7a7a;border-left:2px solid #7a7a7a;border-right:2px solid #ffffff;border-bottom:2px solid #ffffff;font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:24px;color:#111111;">
              <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:12px;line-height:22px;font-weight:bold;color:#14149e;padding-bottom:16px;">IMPORTANT NOTICE</div>
              <p style="margin:0 0 16px;">By not joining the members' server, you will not be considered an official member of Micro Club.</p>
              <p style="margin:0 0 16px;">This Server is reserved exclusively for accepted members, sharing this link with anyone is strictly prohibited.</p>
              <p style="margin:0 0 18px;">Thank you for helping us keep our community safe and organized.</p>

              <!-- bulletproof button -->
              <table role="presentation" align="right" cellpadding="0" cellspacing="0" border="0">
                <tr><td bgcolor="#2a2ad8" style="background:#2a2ad8;border-top:2px solid #7c7cff;border-left:2px solid #7c7cff;border-right:2px solid #07073a;border-bottom:2px solid #07073a;">
                  <a href="${MEMBERS_DISCORD_INVITE}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:12px;line-height:16px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-decoration:none;">JOIN SERVER</a>
                </td></tr>
              </table>
              <div style="clear:both;font-size:0;line-height:0;">&nbsp;</div>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>

    <!-- SLOGAN -->
    <tr><td align="center" style="padding:28px 0 0;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:14px;line-height:22px;font-weight:bold;letter-spacing:1px;color:#ffffff;">
      LET'S EXPERIENCE IT!
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>
`
}

export function rejectionHtml(firstName: string, lastName: string) {
  const name = greetingName(firstName, lastName)
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Micro Club - Application Update</title>
<!-- Pixel fonts only load in Apple Mail & a few clients; everyone else gets Courier New (still retro) -->
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background:#0e21b1; }
  table { border-collapse:collapse; }
  img { border:0; display:block; }
  a { color:#14149e; }
  @media only screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .pad  { padding:16px 14px !important; }
    .brand { font-size:18px !important; }
    .hello { font-size:24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#0e21b1;">

<!-- Outer blue background -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0e21b1" style="background:#0e21b1;">
<tr><td align="center" style="padding:28px 12px 48px;">

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- LOGO: replace src with the public URL where you host micro-club-logo.png -->
    <tr><td align="center" style="padding:0 0 18px;">
      <img src="https://3c5439981f.imgdist.com/pub/bfra/mqammozr/tr5/saw/9u7/mc-logo_1.png" alt="Micro Club" width="115" style="display:block;margin:0 auto;width:115px;height:auto;color:#ffffff;font-family:'Courier New',monospace;font-size:20px;font-weight:bold;">
    </td></tr>

    <!-- ===================== WINDOW 1 ===================== -->
    <tr><td style="padding:0 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#cfcfcf" style="background:#cfcfcf;border:2px solid #1a1a1a;">
        <tr><td style="padding:8px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #7a7a7a;border-bottom:2px solid #7a7a7a;">

          <!-- titlebar -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#1c1cc0" style="background:#1c1cc0;background-image:linear-gradient(90deg,#14149e,#2a2ad8);border:1px solid #0a0a5c;padding:13px 16px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:14px;line-height:20px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-transform:uppercase;">
              Micro Club // APP_CENTER
            </td></tr>
          </table>

          <!-- viewport -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
            <tr><td class="pad" bgcolor="#ececec" style="background:#ececec;padding:22px 24px;border-top:2px solid #7a7a7a;border-left:2px solid #7a7a7a;border-right:2px solid #ffffff;border-bottom:2px solid #ffffff;font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:24px;color:#111111;">

              <!-- banner -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
                <tr><td bgcolor="#14149e" style="background:#14149e;padding:16px 18px 14px;border-top:2px solid #4a4ad8;border-left:2px solid #4a4ad8;border-right:2px solid #07073a;border-bottom:2px solid #07073a;">
                  <div class="brand" style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:22px;line-height:28px;font-weight:bold;letter-spacing:2px;color:#ffffff;">MICRO CLUB</div>
                  <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:10px;line-height:16px;font-weight:bold;letter-spacing:1px;color:#c4c8ff;padding-top:10px;">WELCOME TO THE NEXT LEVEL</div>
                  <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:20px;line-height:26px;font-weight:bold;letter-spacing:1px;color:#ffffff;padding-top:14px;">[ INCOMING TRANSMISSION ]</div>
                </td></tr>
              </table>

              <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:22px;color:#111111;">APPLICATION UPDATE</div>
              <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:22px;color:#14149e;padding-bottom:14px;">SYSTEM STATUS: PROCESSING COMPLETE</div>

              <!-- file chip -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
                <tr><td bgcolor="#cfcfcf" style="background:#cfcfcf;padding:4px 12px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #4a4a4a;border-bottom:2px solid #4a4a4a;font-family:'VT323','Courier New',Courier,monospace;font-size:17px;line-height:22px;color:#111111;">
                  &#9635; MESSAGE_FROM_MICROCLUB.exe
                </td></tr>
              </table>

              <!-- greeting: the applicant's last and first name -->
              <div class="hello" style="font-family:'VT323','Courier New',Courier,monospace;font-size:28px;line-height:32px;font-weight:bold;color:#111111;padding-bottom:14px;">DEAR, ${name}!</div>

              <p style="margin:0 0 16px;">Your signal reached us!</p>

              <p style="margin:0 0 16px;">First, thank you for your time, enthusiasm, and interest in becoming part of Micro Club for the 2026/2027 academic year.</p>

              <p style="margin:0 0 14px;color:#14149e;">&gt;&gt; INITIATING RESULT DISPLAY...</p>

              <!-- readout box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
                <tr><td bgcolor="#f7f7ff" style="background:#f7f7ff;padding:12px 16px 14px;border:2px dashed #14149e;">
                  <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:10px;line-height:14px;font-weight:bold;color:#14149e;padding-bottom:10px;">SYSTEM STATUS</div>
                  <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:28px;line-height:32px;font-weight:bold;color:#111111;">NOT SELECTED THIS TIME</div>
                  <div style="font-family:'VT323','Courier New',Courier,monospace;font-size:16px;line-height:22px;color:#14149e;padding-top:8px;">CONNECTION STATUS: STILL POSSIBLE</div>
                </td></tr>
              </table>

              <p style="margin:0;">After carefully reviewing all applications, we regret to inform you that your application has not been selected this time.</p>

            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>

    <!-- ===================== WINDOW 2: EVENTS ===================== -->
    <tr><td style="padding:0 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#cfcfcf" style="background:#cfcfcf;border:2px solid #1a1a1a;">
        <tr><td style="padding:8px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #7a7a7a;border-bottom:2px solid #7a7a7a;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#1c1cc0" style="background:#1c1cc0;background-image:linear-gradient(90deg,#14149e,#2a2ad8);border:1px solid #0a0a5c;padding:10px 14px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-transform:uppercase;">
              Micro Club // OPEN EVENTS
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
            <tr><td class="pad" bgcolor="#ececec" style="background:#ececec;padding:20px 22px;border-top:2px solid #7a7a7a;border-left:2px solid #7a7a7a;border-right:2px solid #ffffff;border-bottom:2px solid #ffffff;font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:24px;color:#111111;">
              <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:12px;line-height:22px;font-weight:bold;color:#14149e;padding-bottom:16px;">STAY IN THE LOOP</div>
              <p style="margin:0;">Even if you weren't selected for internal membership this round, you are always welcome to attend our public workshops, hackathons, and Open Days!</p>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>

    <!-- ===================== WINDOW 3: JOIN SERVER ===================== -->
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#cfcfcf" style="background:#cfcfcf;border:2px solid #1a1a1a;">
        <tr><td style="padding:8px;border-top:2px solid #ffffff;border-left:2px solid #ffffff;border-right:2px solid #7a7a7a;border-bottom:2px solid #7a7a7a;">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td bgcolor="#1c1cc0" style="background:#1c1cc0;background-image:linear-gradient(90deg,#14149e,#2a2ad8);border:1px solid #0a0a5c;padding:10px 14px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-transform:uppercase;">
              Join Our Community
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
            <tr><td class="pad" bgcolor="#ececec" style="background:#ececec;padding:20px 22px;border-top:2px solid #7a7a7a;border-left:2px solid #7a7a7a;border-right:2px solid #ffffff;border-bottom:2px solid #ffffff;font-family:'VT323','Courier New',Courier,monospace;font-size:18px;line-height:24px;color:#111111;">
              <div style="font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:12px;line-height:22px;font-weight:bold;color:#14149e;padding-bottom:16px;">SIGNAL NOT LOST.</div>
              <p style="margin:0 0 18px;">You can join our community Discord server through the following link:</p>

              <!-- bulletproof button -->
              <table role="presentation" align="left" cellpadding="0" cellspacing="0" border="0">
                <tr><td bgcolor="#2a2ad8" style="background:#2a2ad8;border-top:2px solid #7c7cff;border-left:2px solid #7c7cff;border-right:2px solid #07073a;border-bottom:2px solid #07073a;">
                  <a href="${COMMUNITY_DISCORD_INVITE}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:12px;line-height:16px;font-weight:bold;letter-spacing:.5px;color:#ffffff;text-decoration:none;">JOIN SERVER</a>
                </td></tr>
              </table>
              <div style="clear:both;font-size:0;line-height:0;">&nbsp;</div>

              <p style="margin:18px 0 16px;">Thank you once again for your interest in Micro Club, and we wish you the very best in your future endeavors!</p>
              <p style="margin:0;">Best regards,<br><br>Micro Club Internal Relations Management Department<br>USTHB &ndash; Algiers</p>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>

    <!-- SLOGAN -->
    <tr><td align="center" style="padding:28px 0 0;font-family:'Press Start 2P','Courier New',Courier,monospace;font-size:14px;line-height:22px;font-weight:bold;letter-spacing:1px;color:#ffffff;">
      LET'S EXPERIENCE IT!
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>
`
}

export { COMMUNITY_DISCORD_INVITE, MEMBERS_DISCORD_INVITE }
