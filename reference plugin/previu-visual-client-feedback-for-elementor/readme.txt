=== Previu – Visual Client Feedback for Elementor ===
Contributors: arhamashfaq
Tags: elementor, client feedback, annotations, visual feedback, review tool
Requires at least: 5.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 2.2.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Generate shareable review links for clients to annotate your Elementor site with pins, arrows and comments. No client account required.

== Description ==

Previu lets you share a review link with your client. They click it, type their name, and start leaving visual feedback directly on your Elementor site — no account required.

No more confusing emails, messy screenshots, or lost comments. Clients pin feedback on the exact element they are referring to — desktop, tablet, or mobile.

**Features:**

* Pin comments on any element with exact positioning
* Draw rectangles, arrows, and freehand annotations
* Switch between desktop, tablet, and mobile viewports
* View and resolve all feedback inside the Elementor editor panel
* Manage annotations from the WordPress admin dashboard
* Email notifications when clients leave new feedback
* Voice notes and file attachments (Pro)
* Slack integration (Pro)
* White-label and custom branding (Pro)

== Installation ==

1. Upload the `previu-visual-client-feedback-for-elementor` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to the **Previu** menu in your admin sidebar
4. Click **New Session** to create your first review link
5. Share the link with your client — they start leaving feedback instantly

== Frequently Asked Questions ==

= Do clients need an account to leave feedback? =

No. They just click the link you send, type their name, and start annotating. No sign-up, no password.

= Does it work with any WordPress theme? =

Yes. Previu works on any WordPress site. The Elementor editor panel integration requires Elementor.

= Is there a limit on annotations or projects? =

The free version includes unlimited annotations across unlimited projects.

= Can clients leave feedback on mobile? =

Yes. Clients can switch between desktop, tablet, and mobile viewports to leave responsive-specific feedback.

= What happens to my data if I uninstall? =

All annotation data and projects are stored in your WordPress database. When you uninstall, the plugin provides an option to clean up all data.

== Screenshots ==

1. Client annotation toolbar on a live page
2. Elementor editor panel showing client feedback
3. Admin dashboard project overview
4. Creating a new review session
5. Annotation with comment and media attachments

== Changelog ==

= 2.1.9 =
* Production hardening and code quality improvements
* Fixed version mismatch between header and readme
* Removed debug logging from production code
* Added validation for required fields on project and annotation creation
* Improved notification email with translatable strings
* Fixed capability checks and error handling throughout
* Optimized rate limiting with COUNT query instead of loading all records

= 2.1.8 =
* Complete rebrand to Previu
* Redesigned admin dashboard with premium UI
* Client file uploads moved to dedicated settings section
* Removed unused media gallery filter from client sidebar
* Fixed launcher widget integration
* Fixed client role permission check
* Removed redundant database upgrade check
* Cleaned up dead code

= 2.0.9 =
* Improved dev-side Elementor panel UI
* Device filter tabs in both client and dev panels
* Element tag chips showing H2, BUTTON etc.
* Reveal element button for pin annotations
* Fixed toolbar icon rendering issues

= 1.0.0 =
* Initial release

== Upgrade Notice ==

= 2.1.9 =
Maintenance release with production hardening, validation, and translation improvements. Recommended update for all users.
