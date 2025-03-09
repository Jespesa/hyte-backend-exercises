# TerveysPlus API Documentation

This document provides comprehensive documentation for the TerveysPlus API, which powers the health diary application. The API allows for managing user accounts, diary entries, health goals, medications, and exercise activities.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:3000/api
```

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT).

### How to Authenticate

1. First, obtain a token by logging in at `/api/auth/login`
2. Include the token in subsequent requests using the Authorization header:

```
Authorization: Bearer <your_token>
```

## API Endpoints

### Authentication

#### Login

Log in and obtain a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "example_user",
    "password": "your_password"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "login ok",
    "user": {
      "user_id": 1,
      "username": "example_user",
      "email": "user@example.com",
      "created_at": "2025-01-01T00:00:00.000Z",
      "user_level": "regular"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Username is missing
  - `401 Unauthorized`: Bad username/password

#### Get Current User Info

Retrieve information about the current logged-in user.

- **URL**: `/auth/me`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: `200 OK`
  ```json
  {
    "user_id": 1,
    "username": "example_user",
    "email": "user@example.com",
    "created_at": "2025-01-01T00:00:00.000Z",
    "user_level": "regular"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Authentication token is missing
  - `403 Forbidden`: Invalid or expired token

### Users

#### Get All Users

Retrieve a list of all users (requires authentication).

- **URL**: `/users`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: `200 OK`
  ```json
  [
    {
      "user_id": 1,
      "username": "example_user",
      "email": "user@example.com",
      "created_at": "2025-01-01T00:00:00.000Z",
      "user_level": "regular"
    },
    ...
  ]
  ```

#### Get User by ID

Retrieve information about a specific user.

- **URL**: `/users/:id`
- **Method**: `GET`
- **Authentication**: None
- **URL Parameters**: `id` - User ID
- **Response**: `200 OK`
  ```json
  {
    "user_id": 1,
    "username": "example_user",
    "email": "user@example.com",
    "created_at": "2025-01-01T00:00:00.000Z",
    "user_level": "regular"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: User not found

#### Create New User

Register a new user account.

- **URL**: `/users`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "new_user",
    "email": "new@example.com",
    "password": "secure_password"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "User added. id: 5"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation errors or missing required fields

#### Update User

Update user information (can only update own account).

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - User ID
- **Request Body**: (all fields optional)
  ```json
  {
    "username": "updated_name",
    "email": "updated@example.com",
    "password": "new_password"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "User updated successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Can only update own user info
  - `500 Internal Server Error`: Database error

#### Delete User

Delete a user account (can only delete own account).

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - User ID
- **Response**: `200 OK`
  ```json
  {
    "message": "User deleted."
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Can only delete own account
  - `404 Not Found`: User not found

### Diary Entries

#### Get All Entries

Retrieve all diary entries for the current user.

- **URL**: `/entries`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: `200 OK`
  ```json
  [
    {
      "entry_id": 1,
      "user_id": 1,
      "entry_date": "2025-02-15",
      "mood": "Happy",
      "weight": 70.5,
      "sleep_hours": 8,
      "notes": "Had a great day!",
      "created_at": "2025-02-15T18:30:00.000Z"
    },
    ...
  ]
  ```

#### Get Entry by ID

Retrieve a specific diary entry.

- **URL**: `/entries/:id`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - Entry ID
- **Response**: `200 OK`
  ```json
  {
    "entry_id": 1,
    "user_id": 1,
    "entry_date": "2025-02-15",
    "mood": "Happy",
    "weight": 70.5,
    "sleep_hours": 8,
    "notes": "Had a great day!",
    "created_at": "2025-02-15T18:30:00.000Z"
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Entry not found

#### Create New Entry

Add a new diary entry.

- **URL**: `/entries`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "entry_date": "2025-02-15",
    "mood": "Relaxed",
    "weight": 70.2,
    "sleep_hours": 7.5,
    "notes": "Felt good today"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "Entry added.",
    "entry_id": 5
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation errors or missing required fields

#### Update Entry

Update an existing diary entry (can only update own entries).

- **URL**: `/entries/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - Entry ID
- **Request Body**: (all fields optional)
  ```json
  {
    "entry_date": "2025-02-15",
    "mood": "Energetic",
    "weight": 70.1,
    "sleep_hours": 8,
    "notes": "Updated notes"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Entry updated successfully.",
    "updatedEntry": {
      "entry_date": "2025-02-15",
      "mood": "Energetic",
      "weight": 70.1,
      "sleep_hours": 8,
      "notes": "Updated notes"
    }
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of entry)
  - `404 Not Found`: Entry not found

#### Delete Entry

Delete a diary entry (can only delete own entries).

- **URL**: `/entries/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - Entry ID
- **Response**: `200 OK`
  ```json
  {
    "message": "Entry deleted successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of entry)
  - `404 Not Found`: Entry not found

### Goals

#### Get All Goals

Retrieve all goals for the current user.

- **URL**: `/goals`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: `200 OK`
  ```json
  [
    {
      "goal_id": 1,
      "user_id": 1,
      "title": "Lose Weight",
      "type": "weight",
      "description": "Target weight loss for summer",
      "start_date": "2025-01-01",
      "end_date": "2025-04-01",
      "target_value": 65,
      "start_value": 70,
      "target_direction": "decrease",
      "unit": "kg",
      "completed": false,
      "completed_date": null,
      "created_at": "2025-01-01T10:00:00.000Z"
    },
    ...
  ]
  ```

#### Get Goal by ID

Retrieve a specific goal.

- **URL**: `/goals/:id`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - Goal ID
- **Response**: `200 OK`
  ```json
  {
    "goal_id": 1,
    "user_id": 1,
    "title": "Lose Weight",
    "type": "weight",
    "description": "Target weight loss for summer",
    "start_date": "2025-01-01",
    "end_date": "2025-04-01",
    "target_value": 65,
    "start_value": 70,
    "target_direction": "decrease",
    "unit": "kg",
    "completed": false,
    "completed_date": null,
    "created_at": "2025-01-01T10:00:00.000Z"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of goal)
  - `404 Not Found`: Goal not found

#### Create New Goal

Add a new goal.

- **URL**: `/goals`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "Improve Sleep",
    "type": "sleep",
    "description": "Sleep more consistently",
    "start_date": "2025-02-01",
    "end_date": "2025-03-01",
    "target_value": 8,
    "start_value": 6,
    "target_direction": "increase",
    "unit": "hours"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "Goal created successfully",
    "goal_id": 5
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation errors or missing required fields

#### Update Goal

Update an existing goal (can only update own goals).

- **URL**: `/goals/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - Goal ID
- **Request Body**: (all fields optional)
  ```json
  {
    "title": "Updated Goal Title",
    "description": "Updated description",
    "end_date": "2025-05-01",
    "target_value": 67
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Goal updated successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of goal)
  - `404 Not Found`: Goal not found

#### Delete Goal

Delete a goal (can only delete own goals).

- **URL**: `/goals/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - Goal ID
- **Response**: `200 OK`
  ```json
  {
    "message": "Goal deleted successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of goal)
  - `404 Not Found`: Goal not found

#### Complete Goal

Mark a goal as completed.

- **URL**: `/goals/:id/complete`
- **Method**: `POST`
- **Authentication**: Required
- **URL Parameters**: `id` - Goal ID
- **Request Body**: (optional)
  ```json
  {
    "completed_date": "2025-03-15"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Goal marked as completed"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of goal)
  - `404 Not Found`: Goal not found

### Medications

#### Get All Medications

Retrieve all medications for the current user.

- **URL**: `/medications`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: `200 OK`
  ```json
  [
    {
      "medication_id": 1,
      "user_id": 1,
      "name": "Vitamin D",
      "dosage": "1000 IU",
      "frequency": "Daily",
      "start_date": "2025-01-01",
      "end_date": "2025-06-01",
      "notes": "Take with food",
      "created_at": "2025-01-01T08:00:00.000Z",
      "updated_at": null
    },
    ...
  ]
  ```

#### Get Active Medications

Retrieve only active medications (no end date or end date is in the future).

- **URL**: `/medications/active`
- **Method**: `GET`
- **Authentication**: Required
- **Response**: `200 OK`
  ```json
  [
    {
      "medication_id": 1,
      "user_id": 1,
      "name": "Vitamin D",
      "dosage": "1000 IU",
      "frequency": "Daily",
      "start_date": "2025-01-01",
      "end_date": "2025-06-01",
      "notes": "Take with food",
      "created_at": "2025-01-01T08:00:00.000Z",
      "updated_at": null
    },
    ...
  ]
  ```

#### Get Medication by ID

Retrieve a specific medication.

- **URL**: `/medications/:id`
- **Method**: `GET`
- **Authentication**: Required
- **URL Parameters**: `id` - Medication ID
- **Response**: `200 OK`
  ```json
  {
    "medication_id": 1,
    "user_id": 1,
    "name": "Vitamin D",
    "dosage": "1000 IU",
    "frequency": "Daily",
    "start_date": "2025-01-01",
    "end_date": "2025-06-01",
    "notes": "Take with food",
    "created_at": "2025-01-01T08:00:00.000Z",
    "updated_at": null
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of medication)
  - `404 Not Found`: Medication not found

#### Create New Medication

Add a new medication.

- **URL**: `/medications`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "name": "Ibuprofen",
    "dosage": "400 mg",
    "frequency": "As needed",
    "start_date": "2025-02-15",
    "end_date": "2025-02-22",
    "notes": "For headaches"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "message": "Medication created successfully",
    "medication_id": 5
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Validation errors or missing required fields

#### Update Medication

Update an existing medication (can only update own medications).

- **URL**: `/medications/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **URL Parameters**: `id` - Medication ID
- **Request Body**: (all fields optional)
  ```json
  {
    "name": "Updated Medication Name",
    "dosage": "Updated dosage",
    "frequency": "Updated frequency",
    "end_date": "2025-07-01"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Medication updated successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of medication)
  - `404 Not Found`: Medication not found

#### Delete Medication

Delete a medication (can only delete own medications).

- **URL**: `/medications/:id`
- **Method**: `DELETE`
- **Authentication**: Required
- **URL Parameters**: `id` - Medication ID
- **Response**: `200 OK`
  ```json
  {
    "message": "Medication deleted successfully"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: Access denied (not owner of medication)
  - `404 Not Found`: Medication not found

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: The request succeeded
- `201 Created`: A new resource was created successfully
- `400 Bad Request`: The request was malformed or contained invalid parameters
- `401 Unauthorized`: Authentication is required or credentials are invalid
- `403 Forbidden`: The authenticated user does not have permission to access the resource
- `404 Not Found`: The requested resource does not exist
- `500 Internal Server Error`: An unexpected error occurred on the server

Error responses include a JSON object with details about the error:

```json
{
  "message": "Error message",
  "status": 400,
  "errors": [
    {
      "msg": "Field is required",
      "param": "fieldName"
    }
  ]
}
```

## Data Validation

The API uses express-validator for request validation. Common validation rules include:

- Required fields cannot be empty
- Email addresses must be valid
- Usernames must be 3-20 characters and alphanumeric
- Passwords must be 8-64 characters
- Numeric fields must be within acceptable ranges (e.g., sleep hours between 0-24)
- Text fields may have maximum length restrictions

When validation fails, the API returns a 400 Bad Request response with details about the validation errors.