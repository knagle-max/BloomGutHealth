# Active account deletion review

Synthetic account only. Baseline `75a598b`; current implementation is the commit containing these files. Both captures use Chromium, 375×1000, light theme and identical intercepted Profile/preferences fixtures. Actual database behavior is covered separately by foreign-key/transaction tests and isolated-Neon CI; browser interception is not persistence evidence.

- [Before](before-mobile.png): existing Profile data area and export.
- [After](after-mobile.png): active-account deletion disclosure added beside export.
- [Annotated after](after-mobile-annotated.png): three numbered callouts summarize password verification, explicit confirmation, and the active-data/backup/provider distinction. Unmarked original retained.
- [Opened workflow](workflow-mobile.png): password, typed phrase, acknowledgement and disabled destructive button; accurate limitations remain in view.

Tests exercise wrong password (no deletion, password draft cleared), retry, keyboard completion, scoped post-deletion message and 320–1440px reflow. No real account, credentials or health data are used. Independent screen-reader, physical-device, security/privacy/legal review and backup/vendor lifecycle acceptance remain open. This review does not approve public launch.
