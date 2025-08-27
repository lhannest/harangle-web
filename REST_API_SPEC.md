# Harangle REST API Specification

This document describes the REST API that the Harangle front end expects from its back-end service. All responses use JSON and all requests must include the header `Content-Type: application/json` when a body is present.

## General Conventions

- Base URL: `/api`
- Authentication: Bearer token obtained from Google sign-in.
- Dates: `YYYY-MM-DD`
- Times: ISO-8601 strings
- All GET endpoints support `ETag` headers for caching. Clients should send `If-None-Match`; the server may respond with `304 Not Modified` when appropriate.

---

## Authentication

### POST `/auth/google`
Exchange a Google ID token for an application token.

Request body:
```json
{
  "idToken": "string" // Google OAuth ID token
}
```

Response `200 OK`:
```json
{
  "token": "string",  // JWT used for future requests
  "user": {
    "id": "string",
    "name": "string",
    "username": "string"
  }
}
```

### POST `/auth/logout`
Invalidate the current token.

Headers: `Authorization: Bearer <token>`

Response: `204 No Content`

---

## Users & Settings

### GET `/users/me`
Return the profile of the authenticated user including settings.

Response `200 OK`:
```json
{
  "id": "string",
  "name": "string",
  "username": "string",
  "calendars": [
    {"id": "string", "name": "string", "selected": true}
  ]
}
```

### PUT `/users/me`
Update the user's username and calendar selections.

Request body:
```json
{
  "username": "string",
  "calendars": ["calendarId1", "calendarId2"]
}
```

Response `200 OK` with the updated `user` object.

---

## Calendars

### GET `/calendars`
List calendars accessible to the user.

Response `200 OK`:
```json
{
  "calendars": [
    {"id": "string", "name": "string"}
  ]
}
```

### GET `/calendars/{calendarId}/events`
Return events for a calendar between two dates.

Query parameters:
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`

Response `200 OK`:
```json
{
  "events": [
    {
      "id": "string",
      "name": "string",
      "start": "2024-06-01T10:00:00Z",
      "end": "2024-06-01T11:00:00Z"
    }
  ]
}
```

---

## Groups

### GET `/groups`
Return all groups that the user belongs to.

Response `200 OK`:
```json
{
  "groups": [
    {"id": "string", "name": "string"}
  ]
}
```

### POST `/groups`
Create a new group.

Request body:
```json
{
  "name": "string"
}
```

Response `201 Created`:
```json
{
  "id": "string",
  "name": "string"
}
```

### GET `/groups/{groupId}`
Fetch details of a specific group.

Response `200 OK`:
```json
{
  "id": "string",
  "name": "string",
  "members": [
    {"id": "string", "name": "string"}
  ]
}
```

### POST `/groups/{groupId}/members`
Add users to a group.

Request body:
```json
{
  "userIds": ["userId1", "userId2"]
}
```

Response: `204 No Content`

---

## Group Availability & Calendar View

### GET `/groups/{groupId}/availability`
Return availability for all group members over a date range.

Query parameters:
- `from`: `YYYY-MM-DD`
- `to`: `YYYY-MM-DD`

Response `200 OK`:
```json
{
  "days": [
    {
      "date": "2024-06-01",
      "color": "bright_green",
      "users": [
        {"id": "userId1", "name": "Alice", "busy_hours": 3}
      ]
    }
  ]
}
```

Color legend:
- `bright_green`: 0-2 total busy hours
- `medium_green`: >2 and ≤4 total busy hours
- `dull_green`: >4 and ≤8 total busy hours
- `tan`: >8 total busy hours

### GET `/groups/{groupId}/availability/{date}`
Retrieve busy-hour breakdown for a single day.

Response `200 OK`:
```json
{
  "date": "2024-06-01",
  "users": [
    {"id": "userId1", "name": "Alice", "busy_hours": 3}
  ]
}
```

---

## Error Handling

Errors use standard HTTP status codes with a JSON body:
```json
{
  "error": "short_code",
  "message": "Human readable description"
}
```

Example codes:
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

---

## Caching Strategy

Front-end clients should cache responses locally. When a page loads, it first renders cached data. Then it makes network requests, sending `If-None-Match` with the stored `ETag` values. When the server returns `304 Not Modified`, the client keeps its cache. Each resource also includes an `updated_at` timestamp to assist with client-side invalidation.

