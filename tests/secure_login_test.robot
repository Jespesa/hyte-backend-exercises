*** Settings ***
Library     Browser    auto_closing_level=KEEP
Library     OperatingSystem
Library     String

*** Variables ***
${LOGIN_URL}    http://127.0.0.1:5500/frontend/index.html
${ENV_FILE}     .env    # Polku olemassa olevaan .env-tiedostoon

*** Keywords ***
Read Credentials From Env File
    # Lue ympäristömuuttujat .env-tiedostosta
    ${env_content}=    Get File    ${ENV_FILE}
    ${env_content}=    Replace String    ${env_content}    \r    ${EMPTY}
    @{lines}=    Split String    ${env_content}    \n

    ${username}=    Set Variable    ${EMPTY}
    ${password}=    Set Variable    ${EMPTY}

    FOR    ${line}    IN    @{lines}
        ${line}=    Strip String    ${line}
        # Ohita tyhjät rivit ja kommentit
        Continue For Loop If    '${line}' == ''
        Continue For Loop If    "${line}"[0] == "#"

        # Tunnista muuttujat
        IF    '${line}'.startswith('HEALTH_DIARY_USERNAME=')
            ${username}=    Fetch From Right    ${line}    =
            ${username}=    Strip String    ${username}
        END
        IF    '${line}'.startswith('HEALTH_DIARY_PASSWORD=')
            ${password}=    Fetch From Right    ${line}    =
            ${password}=    Strip String    ${password}
        END
    END

    RETURN    ${username}    ${password}

*** Test Cases ***
Secure Login to Health Diary
    # Lue tunnukset .env-tiedostosta
    ${username}    ${password}=    Read Credentials From Env File

    # Avaa selain ja siirry kirjautumissivulle
    New Browser    chromium    headless=No
    New Page    ${LOGIN_URL}

    # Tarkista sivun otsikko
    ${PageTitle}=    Get Title 
    Should Contain    ${PageTitle}    TerveysPlus

    # Odota, että kirjautumislomake näkyy
    Wait For Elements State    id=login-form    visible

    # Syötä käyttäjätunnus ja salasana
    Type Text    id=login-username    ${username}
    Type Secret    id=login-password    ${password}

    # Klikkaa kirjautumispainiketta
    Click    css=#login-form button[type="submit"]

    # Odota kirjautumisen valmistumista
    Sleep    3s

    # Varmista, että dashboard latautuu
    Wait For Elements State    id=user-greeting    visible    timeout=5s

    # Sulje selain
    Close Browser
