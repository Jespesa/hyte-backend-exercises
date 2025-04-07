# Robot Framework Testiraportit

Tällä sivulla on nähtävissä TerveysPlus-sovelluksen automaatiotestien tulokset.

## Saatavilla olevat testiraportit

- [Kirjautumistesti - Raportti](health_diary_login-report.html)
- [Kirjautumistesti - Loki](health_diary_login-log.html)
- [Web Form -testi - Raportti](web_form_test-report.html)
- [Web Form -testi - Loki](web_form_test-log.html)
- [Päiväkirjamerkintätesti - Raportti](diary_entry-report.html)
- [Päiväkirjamerkintätesti - Loki](diary_entry-log.html)
- [Turvallinen kirjautumistesti - Raportti](secure_login_test-report.html)
- [Turvallinen kirjautumistesti - Loki](secure_login_test-log.html)
- [Salattu kirjautumistesti - Raportti](encrypted_login_test-report.html)
- [Salattu kirjautumistesti - Loki](encrypted_login_test-log.html)

## Testien ajaminen

Testit voidaan ajaa seuraavilla komennoilla, jolloin raportit generoituvat tähän kansioon:

```bash
robot --outputdir outputs tests/health_diary_login.robot
robot --outputdir outputs tests/web_form_test.robot
robot --outputdir outputs tests/diary_entry.robot
robot --outputdir outputs tests/secure_login_test.robot
robot --outputdir outputs tests/encrypted_login_test.robot