# MediaCore API Documentation (MySQL Edition)

## 📋 Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication & Security](#authentication--security)
4. [Standard Response Format](#standard-response-format)
5. [Auth Endpoints](#auth-endpoints)
6. [Media Endpoints](#media-endpoints)
7. [Artists Endpoints](#artists-endpoints)
8. [Albums Endpoints](#albums-endpoints)
9. [File Management Endpoints](#file-management-endpoints)
10. [User & Subscription Endpoints](#user--subscription-endpoints)
11. [Error Handling](#error-handling)

---

## Overview

MediaCore API is a high-performance RESTful backend service for managing media content (video/audio files), user authentication, and administration.

**Key Technology Stack:**
- **Database:** MySQL (Primary relational data store)
- **Authentication:** JWT (JSON Web Tokens) for Users & Admins
- **Streaming:** HLS (HTTP Live Streaming) with Adaptive Bitrate
- **Storage:** Local filesystem with cPanel compatibility

**Major Changes from Legacy Version:**
- ❌ **Firebase Removed:** All user data and auth are now handled natively via MySQL and JWT.
- ✅ **MySQL Transition:** Full relational schema for Users, Media, Artists, and Albums.
- ✅ **HLS Streaming:** Native support for .m3u8 playlists and .ts segments.

---

## Base URL

| Environment | URL |
|-------------|-----|
| **Production** | `https://mediacoreapi-sql.masakalirestrobar.ca` |
| **Development** | `http://localhost:5001` (default) |

---

## Authentication & Security

The API supports three distinct types of authentication headers.

### 1. User Authentication (JWT)
Used for protected user routes (e.g., accessing profile, subscription content).
- **Header:** `Authorization: Bearer <access_token>`
- **Token Life:** 15 minutes (short-lived)
- **Refresh Flow:** Use `/auth/refresh` with a valid refresh token (7 days).

### 2. Admin Authentication (JWT)
Used for administrative routes (e.g., uploading media, managing artists).
- **Header:** `Authorization: Bearer <access_token>`
- **Requirement:** User must have `role: 'admin'` in the database.

### 3. API Key Authentication (Public Read-Only)
Used by public clients (Web/Mobile) to fetch public data (Feed, Artists, Albums) without a user session.
- **Header:** `x-api-key: <your_api_key>`
- **Purpose:** Rate limiting and basic client verification.

---

## Standard Response Format

All API responses follow a consistent JSON structure.

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... } // Object or Array
}
```

### Error Response
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human readable error description"
}
```

---

## Auth Endpoints

Base Path: `/auth`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/register` | No | Register a new user with email/password |
| `POST` | `/login` | No | Login and receive JWT tokens |
| `POST` | `/google` | No | Login/Register with Google ID Token |
| `POST` | `/refresh` | No | Refresh expired access token |
| `POST` | `/logout` | No | Invalidate refresh token |
| `POST` | `/forgot-password` | No | Request password reset email |
| `POST` | `/reset-password` | No | Reset password using email token |
| `GET` | `/verify-email/:token`| No | Verify user email address |
| `GET` | `/me` | **Yes (User)** | Get current user profile details |
| `POST` | `/set-password` | **Yes (User)** | Set password (for Google-only users) |

### Login Payload
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "uuid-string",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user",
      "photoURL": "..."
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

## Media Endpoints

Base Path: `/api`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/feed` | **API Key** | Get main media feed with filtering |
| `GET` | `/media/:id` | **API Key** | Get details for a specific media item |
| `POST` | `/media` | **Admin** | Create new media entry (metadata only) |
| `PUT` | `/media/:id` | **Admin** | Update media details |
| `DELETE` | `/media/:id` | **Admin** | Delete media and associated files |

### Get Feed Parameters
- `type`: `video` | `audio`
- `language`: ISO code (e.g., `en`, `hi`, `te`)
- `limit`: Number of items (default 50)
- `orderBy`: `createdAt` | `title` | `duration`
- `order`: `asc` | `desc`

### Media Object Structure
```json
{
  "id": "uuid",
  "title": "Song Title",
  "type": "audio",
  "streamUrl": "https://.../hls/playlist.m3u8",
  "thumbnailUrl": "https://.../thumb.jpg",
  "duration": 180,
  "artistName": "Artist Name",
  "isHls": true
}
```

---

## Artists Endpoints

Base Path: `/api`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/artists` | **API Key** | List all artists with album/track counts |
| `GET` | `/artists/:id` | **API Key** | Get artist details |
| `POST` | `/artists` | **Admin** | Create a new artist |
| `PUT` | `/artists/:id` | **Admin** | Update artist details |
| `DELETE` | `/artists/:id` | **Admin** | Delete artist |

---

## Albums Endpoints

Base Path: `/api`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/albums` | **API Key** | List albums (filterable by `artistId`) |
| `GET` | `/albums/:id` | **API Key** | Get album details |
| `GET` | `/albums/:id/media`| **API Key** | Get all tracks/videos in an album |
| `POST` | `/albums` | **Admin** | Create a new album |
| `PUT` | `/albums/:id` | **Admin** | Update album details |
| `DELETE` | `/albums/:id` | **Admin** | Delete album |

---

## File Management Endpoints

Base Path: `/api/files`

**Note:** These endpoints are primarily for the Admin Dashboard to handle large file uploads (HLS, Video, Audio).

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/upload/video` | **Admin** | Upload raw video file |
| `POST` | `/upload/audio` | **Admin** | Upload audio file |
| `POST` | `/upload/hls` | **Admin** | Upload HLS bundle (ZIP format) |
| `POST` | `/upload/thumbnail`| **Admin** | Upload image thumbnail |
| `DELETE` | `/files` | **Admin** | Delete physical file from server |

---

## User & Subscription Endpoints

Base Path: `/api/user`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/subscription` | **User** | Get current subscription status |
| `POST` | `/subscription` | **User** | Update/Create subscription (dev only) |

---

## Error Handling

Common HTTP Status Codes:

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input or validation failed |
| `401` | Unauthorized | Missing or invalid token/API key |
| `403` | Forbidden | Valid token but insufficient permissions (e.g., User trying to access Admin) |
| `404` | Not Found | Resource does not exist |
| `500` | Server Error | Internal server error |
