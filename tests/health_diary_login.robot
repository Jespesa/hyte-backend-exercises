*** Settings ***
Library     Browser    auto_closing_level=KEEP
Resource    Keywords.robot

*** Test Cases ***
Login to Health Diary Application
    New Browser    chromium    headless=No
    # Assuming you're using VSCode's Live Server which typically runs on port 5500
    New Page    http://127.0.0.1:5500/frontend/index.html

    # Verify the page title
    ${PageTitle}=  Get Title 
    Should Contain    ${PageTitle}    TerveysPlus

    # Check if we're on the login page by verifying some elements
    Wait For Elements State    id=login-form    visible
    
    # Login tab should already be active by default, but let's verify
    ${loginTab}=    Get Element    id=login-tab
    ${loginTabClass}=    Get Property    ${loginTab}    className
    Should Contain    ${loginTabClass}    active

    # Enter username and password
    Type Text    id=login-username    ${Username}
    Type Secret  id=login-password    $Password
    
    # Before submitting, check that the username and password fields have values
    ${username_value}=    Get Property    id=login-username    value
    Log    Username field value: ${username_value}
    
    # Submit the login form - be more specific to target only the login form's submit button
    Click    css=#login-form button[type="submit"]
    
    # Wait longer for login process and potential redirects
    Sleep    3s
    
    # Get the current URL and page content for debugging
    ${currentUrl}=    Get Url
    Log    Current URL after login: ${currentUrl}
    
    # Check for login error messages
    ${pageSource}=    Get Page Source
    ${hasLoginError}=    Run Keyword And Return Status    
    ...    Should Not Contain    ${pageSource}    Bad username/password
    
    # If we find an error message, log it and fail the test
    Run Keyword If    not ${hasLoginError}    Fail    Login failed: Bad username/password
    
    # Instead of checking the exact URL, let's check if we can find dashboard elements
    # This is more robust as the URL pattern might be different in your app
    ${isDashboardVisible}=    Run Keyword And Return Status    
    ...    Wait For Elements State    id=user-greeting    visible    timeout=5s

    
    # Log the dashboard visibility status for debugging
    Log    Dashboard elements visible: ${isDashboardVisible}
    
    # If dashboard is visible, consider it a success
    Run Keyword If    ${isDashboardVisible}    Log    Successfully redirected to dashboard
    
    # If we're not on the dashboard yet, check if we need to click another element
    # This is a common pattern in SPAs where redirection happens client-side
    ${hasRedirectButton}=    Run Keyword And Return Status    
    ...    Get Element    text="Go to Dashboard" >> visible=true
    
    Run Keyword If    ${hasRedirectButton}    Click    text="Go to Dashboard"
    
    # As a final check, try to find any typical dashboard elements
    # Adjust these selectors based on your actual dashboard layout
    Wait For Elements State    id=user-greeting    visible    timeout=5s

    # Close browser
    Close Browser