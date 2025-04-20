*** Settings ***
Library           RequestsLibrary
Library           Collections
Library           DateTime
Library           String
Suite Setup       Create Session    healthdiary    http://localhost:3000    disable_warnings=True

*** Variables ***
${USERNAME}       Jesperx1
${PASSWORD}       Jesperx1
${API_URL}        http://localhost:3000/api
${TOKEN}          ${EMPTY}

*** Keywords ***
Login And Get Token
    [Documentation]    Login to the system and get JWT token
    ${body}=    Create Dictionary    username=${USERNAME}    password=${PASSWORD}
    ${response}=    POST    url=${API_URL}/auth/login    json=${body}    expected_status=anything
    
    # Print response for debugging
    Log    ${response.status_code}
    Log    ${response.text}
    
    # Handle both successful and failed login
    Run Keyword If    ${response.status_code} == 200    Set Token From Response    ${response}
    ...    ELSE    Log    Login failed: ${response.text}
    
    # Return success or failure
    [Return]    ${response.status_code}

Set Token From Response
    [Arguments]    ${response}
    ${token}=    Set Variable    ${response.json()}[token]
    Log    Token: ${token}
    Set Suite Variable    ${TOKEN}    ${token}

Get Auth Header
    [Documentation]    Create authentication header with token
    ${headers}=    Create Dictionary    Authorization=Bearer ${TOKEN}
    [Return]    ${headers}

*** Test Cases ***
Login To Health Diary
    [Documentation]    Test user authentication
    ${status_code}=    Login And Get Token
    Should Be Equal As Strings    ${status_code}    200    Login should succeed
    Should Not Be Empty    ${TOKEN}    Token should not be empty

Get Current User Info
    [Documentation]    Get info about current logged in user
    [Tags]    auth    user
    
    ${headers}=    Get Auth Header
    ${response}=    GET    url=${API_URL}/auth/me    headers=${headers}    expected_status=anything
    
    Log    ${response.text}
    Status Should Be    200    ${response}
    Dictionary Should Contain Key    ${response.json()}    username
    Dictionary Should Contain Key    ${response.json()}    user_id
    Should Be Equal As Strings    ${response.json()}[username]    ${USERNAME}

Get All Diary Entries
    [Documentation]    Get all diary entries for current user
    [Tags]    entries
    
    ${headers}=    Get Auth Header
    ${response}=    GET    url=${API_URL}/entries    headers=${headers}    expected_status=anything
    
    Log    ${response.text}
    Status Should Be    200    ${response}

Create New Diary Entry
    [Documentation]    Add a new diary entry
    [Tags]    entries    create
    
    # Generate current date
    ${today}=    Get Current Date    result_format=%Y-%m-%d
    
    # Create entry data
    ${entry_data}=    Create Dictionary    
    ...    entry_date=${today}    
    ...    mood=8    
    ...    weight=75.5    
    ...    sleep_hours=7.5    
    ...    notes=Entry created by API test automation
    
    # Send request to create entry
    ${headers}=    Get Auth Header
    ${response}=    POST    url=${API_URL}/entries    headers=${headers}    json=${entry_data}    expected_status=anything
    
    Log    ${response.text}
    Status Should Be    201    ${response}
    Dictionary Should Contain Key    ${response.json()}    entry_id
    
    # Save entry ID for later tests
    ${entry_id}=    Set Variable    ${response.json()}[entry_id]
    Set Suite Variable    ${entry_id}
    
    # Verify entry was created
    ${response}=    GET    url=${API_URL}/entries/${entry_id}    headers=${headers}    expected_status=anything
    Status Should Be    200    ${response}
    Should Be Equal As Strings    ${response.json()}[notes]    Entry created by API test automation

Update Diary Entry
    [Documentation]    Update an existing diary entry
    [Tags]    entries    update
    
    # Create updated data
    ${updated_data}=    Create Dictionary    
    ...    mood=9    
    ...    notes=Entry updated by API test automation
    
    # Send request to update entry
    ${headers}=    Get Auth Header
    ${response}=    PUT    url=${API_URL}/entries/${entry_id}    headers=${headers}    json=${updated_data}    expected_status=anything
    
    Log    ${response.text}
    Status Should Be    200    ${response}
    
    # Verify entry was updated
    ${response}=    GET    url=${API_URL}/entries/${entry_id}    headers=${headers}    expected_status=anything
    Status Should Be    200    ${response}
    Should Be Equal As Strings    ${response.json()}[notes]    Entry updated by API test automation
    Should Be Equal As Strings    ${response.json()}[mood]    9

Delete Diary Entry
    [Documentation]    Delete a diary entry
    [Tags]    entries    delete
    
    ${headers}=    Get Auth Header
    ${response}=    DELETE    url=${API_URL}/entries/${entry_id}    headers=${headers}    expected_status=anything
    
    Log    ${response.text}
    Status Should Be    200    ${response}
    
    # Verify entry was deleted
    ${response}=    GET    url=${API_URL}/entries/${entry_id}    headers=${headers}    expected_status=anything
    Status Should Be    404    ${response}

Get Active Medications
    [Documentation]    Get active medications
    [Tags]    medications
    
    ${headers}=    Get Auth Header
    ${response}=    GET    url=${API_URL}/medications/active    headers=${headers}    expected_status=anything
    
    Log    ${response.text}
    Status Should Be    200    ${response}

Create And Delete Medication
    [Documentation]    Create a new medication and then delete it
    [Tags]    medications
    
    # Create medication data
    ${today}=    Get Current Date    result_format=%Y-%m-%d
    ${end_date}=    Get Current Date    increment=30 days    result_format=%Y-%m-%d
    
    ${medication_data}=    Create Dictionary
    ...    name=Test Medication
    ...    dosage=100mg
    ...    frequency=Once daily
    ...    start_date=${today}
    ...    end_date=${end_date}
    ...    notes=Created by API test
    
    # Create medication
    ${headers}=    Get Auth Header
    ${response}=    POST    url=${API_URL}/medications    headers=${headers}    json=${medication_data}    expected_status=anything
    
    Log    ${response.text}
    Status Should Be    201    ${response}
    Dictionary Should Contain Key    ${response.json()}    medication_id
    
    # Save medication ID
    ${medication_id}=    Set Variable    ${response.json()}[medication_id]
    
    # Verify medication exists
    ${response}=    GET    url=${API_URL}/medications/${medication_id}    headers=${headers}    expected_status=anything
    Status Should Be    200    ${response}
    Should Be Equal As Strings    ${response.json()}[name]    Test Medication
    
    # Delete medication
    ${response}=    DELETE    url=${API_URL}/medications/${medication_id}    headers=${headers}    expected_status=anything
    Status Should Be    200    ${response}
    
    # Verify deletion
    ${response}=    GET    url=${API_URL}/medications/${medication_id}    headers=${headers}    expected_status=anything
    Status Should Be    404    ${response}