*** Settings ***
Documentation     Testi Selenium Web form -esimerkkisivun lomakekenttien toiminnan testaamiseen
Library           SeleniumLibrary
Library           OperatingSystem
Library           Collections
Test Setup        Open Browser And Navigate
Test Teardown     Close All Browsers

*** Variables ***
${URL}            https://selenium.dev/selenium/web/web-form.html
${BROWSER}        chrome
${TEST_FILE_PATH}    ${CURDIR}${/}test_file.txt

*** Test Cases ***
Test Page Structure And Elements
    # Tarkistetaan kaikki sivun keskeiset elementit
    Page Should Contain    Web form
    
    # Listataan kaikki HTML-lomake-elementit ja tallennetaan tietoja lokiin
    ${all_inputs}=    Get WebElements    css=input
    ${all_selects}=   Get WebElements    css=select
    ${all_textareas}=    Get WebElements    css=textarea
    
    # Tulostetaan lomake-elementtien tiedot
    Log    Found ${all_inputs.__len__()} input elements
    Log    Found ${all_selects.__len__()} select elements
    Log    Found ${all_textareas.__len__()} textarea elements
    
    # Käydään läpi checkboxit (tärkeä tarkistus myöhempiä testejä varten)
    ${checkboxes}=    Get WebElements    css=input[type='checkbox']
    FOR    ${checkbox}    IN    @{checkboxes}
        ${id}=    Get Element Attribute    ${checkbox}    id
        ${name}=    Get Element Attribute    ${checkbox}    name
        ${checked}=    Get Element Attribute    ${checkbox}    checked
        Log    Checkbox ID: ${id}, Name: ${name}, Checked: ${checked}
    END
    
    # Käydään läpi radio napit
    ${radios}=    Get WebElements    css=input[type='radio']
    FOR    ${radio}    IN    @{radios}
        ${id}=    Get Element Attribute    ${radio}    id
        ${name}=    Get Element Attribute    ${radio}    name
        ${checked}=    Get Element Attribute    ${radio}    checked
        Log    Radio ID: ${id}, Name: ${name}, Checked: ${checked}
    END
    
    # Käydään läpi dropdown valinnat
    ${selects}=    Get WebElements    css=select
    FOR    ${select}    IN    @{selects}
        ${id}=    Get Element Attribute    ${select}    id
        ${name}=    Get Element Attribute    ${select}    name
        ${options}=    Get List Items    ${select}
        Log    Select ID: ${id}, Name: ${name}, Options: ${options}
    END

Test Text Input Field
    Input Text    css=input[name='my-text']    Testitekstiä
    ${value}=    Get Element Attribute    css=input[name='my-text']    value
    Should Be Equal    ${value}    Testitekstiä

Test Password Field
    Input Password    css=input[name='my-password']    salasana123
    ${value}=    Get Element Attribute    css=input[name='my-password']    value
    Should Be Equal    ${value}    salasana123

Test Textarea Field
    Input Text    css=textarea[name='my-textarea']    Pidempi tekstialue testausta varten
    ${value}=    Get Element Attribute    css=textarea[name='my-textarea']    value
    Should Be Equal    ${value}    Pidempi tekstialue testausta varten

Test Dropdown Select Field
    # Haetaan select-elementin valinnat ja tulostetaan ne debug-tarkoituksessa
    ${options}=    Get List Items    css=select[name='my-select']
    Log    Available options: ${options}
    
    # Tarkistetaan oletusvalinta
    ${default_selected}=    Get Selected List Label    css=select[name='my-select']
    Log    Default selected option: ${default_selected}
    
    # Valitaan toinen vaihtoehto (index 1)
    Select From List By Index    css=select[name='my-select']    1
    ${selected}=    Get Selected List Label    css=select[name='my-select']
    Log    Selected option after choosing index 1: ${selected}
    Should Be Equal    ${selected}    One
    
    # Kokeillaan valita myös tekstin perusteella
    Select From List By Label    css=select[name='my-select']    Two
    ${selected}=    Get Selected List Label    css=select[name='my-select']
    Should Be Equal    ${selected}    Two

Test Dropdown Datalist Field
    # Syötetään suoraan tekstikentän arvoksi yksi vaihtoehto
    Input Text    css=input[list='my-options']    San Francisco
    ${value}=    Get Element Attribute    css=input[list='my-options']    value
    Should Be Equal    ${value}    San Francisco

Test File Input Field
    # Luodaan testitiedosto
    Create File    ${TEST_FILE_PATH}    This is a test file content
    
    # Valitaan tiedosto
    Choose File    css=input[type='file']    ${TEST_FILE_PATH}
    
    # Tarkistetaan että tiedoston valinta onnistui (elementti on olemassa)
    Element Should Be Visible    css=input[type='file']
    
    # Siivotaan testitiedosto pois
    Remove File    ${TEST_FILE_PATH}

Test Checkbox Handling
    # Tarkistetaan että oletuksena "Default checkbox" on valittu
    Checkbox Should Be Selected    css=input[id='my-check-1']
    
    # Tarkistetaan että "Another checkbox" ei ole valittu
    Checkbox Should Not Be Selected    css=input[id='my-check-2']
    
    # Valitaan toinen checkbox
    Select Checkbox    css=input[id='my-check-2']
    Checkbox Should Be Selected    css=input[id='my-check-2']
    
    # Poistetaan ensimmäisen valinta
    Unselect Checkbox    css=input[id='my-check-1']
    Checkbox Should Not Be Selected    css=input[id='my-check-1']

Test Radio Button Handling
    # Haetaan kaikki radio-napit ja tulostetaan niiden ominaisuudet
    ${radios}=    Get WebElements    css=input[type='radio']
    FOR    ${radio}    IN    @{radios}
        ${id}=    Get Element Attribute    ${radio}    id
        ${name}=    Get Element Attribute    ${radio}    name
        ${value}=    Get Element Attribute    ${radio}    value
        ${checked}=    Get Element Attribute    ${radio}    checked
        Log    Radio ID: ${id}, Name: ${name}, Value: ${value}, Checked: ${checked}
    END
    
    # Tarkistetaan että ensimmäinen on aluksi valittuna
    ${checked1}=    Get Element Attribute    css=input[id='my-radio-1']    checked
    Log    Radio 1 checked attribute: ${checked1}
    Should Not Be Empty    ${checked1}
    
    # Valitaan toinen radio-nappi
    Click Element    css=input[id='my-radio-2']
    
    # Tarkistetaan että toinen on nyt valittuna
    ${checked2}=    Get Element Attribute    css=input[id='my-radio-2']    checked
    Log    Radio 2 checked attribute: ${checked2}
    Should Not Be Empty    ${checked2}
    
    # Varmistetaan että ensimmäinen ei ole enää valittuna
    ${checked1_after}=    Get Element Attribute    css=input[id='my-radio-1']    checked
    Run Keyword If    "${checked1_after}" == "${None}"    Log    Radio 1 is now unchecked (attribute is None)
    Run Keyword If    "${checked1_after}" == ""    Log    Radio 1 is now unchecked (attribute is empty string)
    Run Keyword If    "${checked1_after}" != "${None}" and "${checked1_after}" != ""    Fail    Radio 1 is still checked

Test Color Picker
    # Haetaan värinvalitsija
    ${color_picker}=    Get WebElement    css=input[type='color']
    
    # Varmistetaan, että värinvalitsin on olemassa
    Element Should Be Visible    ${color_picker}
    
    # Tarkistetaan oletusväri 
    ${default_color}=    Get Element Attribute    ${color_picker}    value
    Log    Default color value: ${default_color}
    
    # Asetetaan uusi väri JavaScriptillä
    Execute JavaScript    arguments[0].value = '#ff0000'; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));    ARGUMENTS    ${color_picker}
    
    # Tarkistetaan että väri vaihtui
    ${new_color}=    Get Element Attribute    ${color_picker}    value
    Log    New color value: ${new_color}
    Should Be Equal As Strings    ${new_color}    \#ff0000

Test Range Slider
    # Haetaan range slider
    ${range_slider}=    Get WebElement    css=input[type='range']
    
    # Varmistetaan, että range slider on näkyvissä
    Element Should Be Visible    ${range_slider}
    
    # Tarkistetaan oletusarvo (tulostamme sen lokiin)
    ${default_range}=    Get Element Attribute    ${range_slider}    value
    Log    Default range value: ${default_range}
    
    # Tarkistamme myös min, max ja step arvot
    ${min_value}=    Get Element Attribute    ${range_slider}    min
    ${max_value}=    Get Element Attribute    ${range_slider}    max
    ${step_value}=    Get Element Attribute    ${range_slider}    step
    Log    Range min: ${min_value}, max: ${max_value}, step: ${step_value}
    
    # Asetetaan uusi arvo JavaScriptillä oletusarvon perusteella
    ${new_value}=    Evaluate    int(${default_range}) + 2
    Execute JavaScript    arguments[0].value = '${new_value}'; arguments[0].dispatchEvent(new Event('input', { bubbles: true })); arguments[0].dispatchEvent(new Event('change', { bubbles: true }));    ARGUMENTS    ${range_slider}
    
    # Tulostetaan asetettu arvo ja tarkistetaan että se on muuttunut oletusarvosta
    ${new_range}=    Get Element Attribute    ${range_slider}    value
    Log    New range value: ${new_range}
    Should Not Be Equal    ${new_range}    ${default_range}

Test Disabled And Readonly Fields
    # Tarkistetaan että disabled-kenttä on disabloitu
    Element Should Be Disabled    css=input[name='my-disabled']
    
    # Tarkistetaan että readonly-kenttä on readonly
    ${readonly}=    Get Element Attribute    css=input[name='my-readonly']    readonly
    Should Be Equal As Strings    ${readonly}    true
    
    # Tarkistetaan readonly-kentän arvo
    ${readonly_value}=    Get Element Attribute    css=input[name='my-readonly']    value
    Should Be Equal    ${readonly_value}    Readonly input

Test Form Submission
    # Täytetään lomakkeen kentät
    Input Text    css=input[name='my-text']    Testitekstiä
    Input Password    css=input[name='my-password']    salasana123
    Input Text    css=textarea[name='my-textarea']    Pidempi tekstialue testausta varten
    
    # Valitaan toinen vaihtoehto dropdown-valikosta
    Select From List By Index    css=select[name='my-select']    1
    
    # Datalist kenttä
    Input Text    css=input[list='my-options']    Chicago
    
    # Käsitellään checkboxit
    Unselect Checkbox    css=input[id='my-check-1']
    Select Checkbox    css=input[id='my-check-2']
    
    # Valitaan radio button käyttäen ID:tä
    Click Element    css=input[id='my-radio-2']
    
    # Lähetetään lomake
    Click Button    css=button[type='submit']
    
    # Tarkistetaan että sivu latautui uudelleen tai tuli vastaussivu
    Wait Until Page Contains    Received    timeout=5s
    # Tarkistetaan että vastaussivulla näkyy "Received!" teksti
    Page Should Contain    Received!

*** Keywords ***
Open Browser And Navigate
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window
    Wait Until Element Is Visible    css=h1
    Page Should Contain    Web form