*** Settings ***
Library     Browser
Library     DateTime
Library     String

*** Variables ***
${USERNAME}     Jesperx1
${PASSWORD}     Jesperx1
${LOGIN_URL}    http://127.0.0.1:5500/frontend/index.html
${DASHBOARD_URL}  http://127.0.0.1:5500/frontend/src/pages/dashboard.html
${WEIGHT}       75.5
${SLEEP_HOURS}  7.5
${MOOD_VALUE}   8
${NOTES}        Automated test entry: Had a great day with plenty of exercise and healthy food.

*** Test Cases ***
Add New Health Diary Entry
    # Open browser and go to login page
    New Browser    chromium    headless=No
    New Page       ${LOGIN_URL}
    
    # Verify we're on the login page
    Wait For Elements State    id=login-form    visible
    
    # Login with credentials
    Fill Text     id=login-username    ${USERNAME}
    Fill Secret   id=login-password    $PASSWORD
    Click         css=#login-form button[type="submit"]
    
    # Wait a moment for login processing
    Sleep         3s
    
    # Navigate directly to dashboard
    Go To    ${DASHBOARD_URL}
    
    # Wait for dashboard to load
    Wait For Elements State    css=main.container    visible    timeout=10s
    
    # Verify that our target form exists and is visible
    Wait For Elements State    id=quick-entry-form    visible    timeout=5s
    
    # Set the date - use the exact ID
    ${today}=    Get Current Date    result_format=%Y-%m-%d
    Fill Text    id=entry-date    ${today}
    
    # Get the slider element first, then use JavaScript on it
    ${slider}=    Get Element    id=entry-mood-slider
    Evaluate JavaScript    ${slider}    (element) => { element.value = ${MOOD_VALUE}; element.dispatchEvent(new Event('input', {bubbles: true})); }
    
    # Verify the mood value is updated in UI
    ${mood_value_text}=    Get Text    id=mood-value
    Should Be Equal As Strings    ${mood_value_text}    ${MOOD_VALUE}
    
    # Fill weight field
    Fill Text    id=entry-weight    ${WEIGHT}
    
    # Fill sleep hours
    Fill Text    id=entry-sleep    ${SLEEP_HOURS}
    
    # Fill notes textarea
    Fill Text    id=entry-notes    ${NOTES}
    
    # Find and click the submit button
    Click    css=#quick-entry-form button[type="submit"]
    
    # Wait for success toast
    Wait For Elements State    css=.toast.show    visible    timeout=5s
    
    # Close browser
    Close Browser