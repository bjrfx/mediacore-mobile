# MediaCore Mobile Privacy Policy

## Overview
- MediaCore Mobile is a media streaming app for audio and video content. The app uses a secure backend (JWT-based) and requests an API key to fetch public catalog data. The app is designed to collect only what is necessary to authenticate users and deliver content.
- Tokens are stored securely on-device and the app does not include third-party analytics or advertising SDKs.

## Information We Collect
- Account Information: When you register or log in (including via Google), the backend returns a user object that may include uid, email, displayName, optional photoURL, role, and flags like emailVerified. This data is used to identify your account within the service.
- Authentication Tokens: Access tokens (short-lived ~15 minutes) and refresh tokens (~7 days) are issued by the backend. The mobile app stores these tokens on-device to maintain your session.
- Usage Preferences (On-Device Only): The app stores non-sensitive preferences locally (e.g., liked songs, playback history, queue, playback rate, repeat/shuffle state). These are saved using AsyncStorage and are not sent to the backend.
- Device and Network Data: Standard server logs (e.g., IP address, request headers, basic device/network information inferred from requests) may be recorded by the backend for security and operational purposes. The mobile app does not actively collect device identifiers beyond what is needed for network requests.
- Google Sign-In Data: If you use Google login, the app obtains a Google ID token and sends it to the backend for verification. The backend may create or update your account based on Google profile details.

## How We Use Information
- Authenticate and Authorize: Establish and maintain your session to grant access to protected features and content.
- Provide and Improve the Service: Fetch the media feed, artists, albums, and individual media items; maintain playback preferences and queues to improve your experience.
- Security: Detect and prevent fraud or misuse, including token refresh, revocation, and controlled access to admin-only endpoints.
- Communications: Support account-related notifications or customer support responses, if applicable. The app does not use targeted advertising.

## Legal Bases (EEA/UK Users)
- Contract: Processing necessary to provide the service you request (e.g., account creation, login, content access).
- Consent: When you choose Google Sign-In or opt into specific features that require your agreement.
- Legitimate Interests: Security, service reliability, operational analytics at the server-level (e.g., logs), and improving user experience.
- Legal Obligations: Compliance with applicable laws and lawful requests from authorities.

## Data Sharing & Disclosure
- Service Providers: The backend, databases, and media hosting infrastructure process your data to deliver the service. This may include providers located outside your country (e.g., Canada based on hosting domain).
- Google (Authentication Only): If you choose Google Sign-In, Google acts as an identity provider. We verify the ID token server-side to create or log in your account.
- No Sale of Personal Data: We do not sell your personal data.
- Legal Compliance: We may disclose information to comply with laws, regulations, legal processes, or governmental requests.

## Data Retention
- Access Tokens: Short-lived (~15 minutes) to reduce risk. Automatically refreshed when needed.
- Refresh Tokens: Typically valid for ~7 days; may be invalidated on logout or security events.
- On-Device Preferences: Stored until you clear app data, uninstall the app, or use in-app controls to reset preferences.
- Account Records: Maintained by the backend for as long as your account is active and for a reasonable time after account deletion to comply with legal obligations and resolve disputes.

## Your Rights
- Access and Portability: Request a copy of your personal data we maintain (primarily via backend).
- Rectification: Request corrections to inaccurate or incomplete data (e.g., profile details).
- Deletion: Request deletion of your account and related data, subject to legal and operational constraints.
- Objection and Restriction: Object to or request restriction of certain processing where applicable.
- Withdraw Consent: Where processing relies on consent (e.g., Google Sign-In), you may withdraw it at any time.
- Complaints: You can lodge a complaint with your local data protection authority if you believe your rights have been infringed.

## Security
- Secure Storage: The app uses Expo SecureStore to store sensitive tokens on-device.
- Transport Security: The app communicates with the backend over HTTPS.
- Short-Lived Tokens: Access tokens are short-lived, and refresh tokens rotate upon refresh to reduce risk.
- Least Privilege: Admin-only endpoints are protected by role checks on the backend.

## Permissions
- Audio Playback: The app requests background audio capability to allow uninterrupted playback.
- No Location/Camera/Contacts: The app does not request access to location, camera, contacts, or similar sensitive device permissions.
- Notifications: The app does not implement push notifications in the current build.

## International Transfers
- Your data may be processed or stored in countries outside of your residence. Hosting domains indicate possible processing in Canada and potentially other regions depending on infrastructure providers.

## Children’s Privacy
- The service is not directed to children under the age required by local law (e.g., 13 or 16). If you believe a child has provided personal data, contact us to request deletion.

## Changes to This Policy
- We may update this Privacy Policy from time to time. Material changes will be communicated through the app or our website. Continued use of the service after changes indicates acceptance.

## Contact
- For privacy requests or questions, contact: privacy@mediacore.in (update this address to your official support email).

