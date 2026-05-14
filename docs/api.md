# API Reference

All endpoints live under `/api/...`. All requests/responses are JSON unless
explicitly noted. Authentication is via the `SESSION_COOKIE_NAME` cookie set by
`/api/auth/login` and `/api/auth/register`.

> **Convention**: error responses always look like `{ "error": "<code>" }`
> with an appropriate HTTP status. Success responses always include the
> resource as a named key (e.g. `{ user: {...} }`, `{ files: [...] }`).

## Auth

### `POST /api/auth/register`
Create a new account. Sets the session cookie on success — the new user is
immediately signed in. Always creates a `USER`-role account; admin promotion
requires another admin.

**Request**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "hunter22hunter",
  "name": "Alice"
}
```

**Response 200**
```json
{
  "id": "clx0fz4q70000abcdsessionidx",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "USER"
}
```

**Errors**
| Code | When |
|---|---|
| `400 email_and_password_required` | Missing one of the required fields |
| `400 password_too_short` | Password < 8 chars |
| `409 email_already_used` | Address is already registered |

**curl**
```bash
curl -i -c cookies.txt http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"hunter22hunter","name":"Alice"}'
```

---

### `POST /api/auth/login`

**Request**
```json
{ "email": "alice@example.com", "password": "hunter22hunter" }
```

**Response 200**
```json
{ "id": "clx0…", "email": "alice@example.com", "name": "Alice", "role": "USER" }
```

**Errors**
| Code | When |
|---|---|
| `400 email_and_password_required` | Missing fields |
| `401 invalid_credentials` | Wrong email or password, or account disabled |

**fetch**
```ts
await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
  credentials: "include",
});
```

---

### `POST /api/auth/logout`
Clears the session cookie. No body.

**Response 200**
```json
{ "ok": true }
```

---

### `GET /api/auth/me`
Returns the current user, or `{ user: null }` if not signed in. Useful for
client-side hydration.

**Response 200 (signed in)**
```json
{
  "user": {
    "id": "clx0…",
    "email": "alice@example.com",
    "name": "Alice",
    "role": "USER",
    "isActive": true
  }
}
```

**Response 200 (signed out)**
```json
{ "user": null }
```

---

## Files

All file endpoints require authentication (`401 unauthorized` otherwise) and
all reads/writes are scoped to the caller — except for `ADMIN`, who sees every
user's files.

### `GET /api/files`
List files visible to the caller, sorted by `createdAt` desc.

**Query params**
| Param | Effect |
|---|---|
| `folderId=<id>` | Only files in that folder (must be owned, or caller is admin) |
| `folderId=root` | Only files at the root (no folder) |
| _(none)_ | All visible files |

**Response 200**
```json
{
  "files": [
    {
      "id": "clx1…",
      "name": "report.docx",
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "size": 24576,
      "driver": "local",
      "url": "/files/clx0…/9f3e…hash.docx",
      "ownerId": "clx0…",
      "folderId": null,
      "createdAt": "2026-05-14T03:22:11.000Z",
      "owner": { "id": "clx0…", "email": "alice@example.com", "name": "Alice" },
      "folder": null
    }
  ]
}
```

---

### `POST /api/files`
Upload a single file.

**Request**
```http
POST /api/files
Content-Type: multipart/form-data; boundary=...

--boundary
Content-Disposition: form-data; name="file"; filename="report.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
<binary>
--boundary
Content-Disposition: form-data; name="folderId"

clx2foldercuid000
--boundary--
```

Multipart fields:

| Field | Required | Notes |
|---|---|---|
| `file` | yes | The file blob |
| `folderId` | no | Cuid of an owned folder, or `"root"` / omitted for no folder |

**Response 200**
```json
{
  "file": {
    "id": "clx9…",
    "name": "report.docx",
    "size": 24576,
    "driver": "local",
    "url": "/files/clx0…/9f3e…hash.docx",
    "folderId": "clx2foldercuid000",
    "folder": { "id": "clx2…", "name": "Reports" }
  }
}
```

**Errors**
| Code | When |
|---|---|
| `400 file_field_missing` | No `file` field in form data |
| `404 folder_not_found` | `folderId` doesn't exist |
| `403 folder_forbidden` | Folder belongs to another user (and caller isn't admin) |
| `413 file_too_large` | `> STORAGE_MAX_FILE_MB` (default 25 MB) |

**curl**
```bash
curl -b cookies.txt http://localhost:3000/api/files \
  -F file=@./report.docx \
  -F folderId=clx2foldercuid000
```

**fetch**
```ts
const fd = new FormData();
fd.append("file", blob, "report.docx");
fd.append("folderId", folderId);
await fetch("/api/files", { method: "POST", body: fd, credentials: "include" });
```

---

### `GET /api/files/:id`
Stream the file back. Returns the raw bytes with:

```
Content-Type: <stored mimeType>
Content-Length: <size>
Content-Disposition: inline; filename="<original name url-encoded>"
```

**Errors**
| Code | When |
|---|---|
| `404 not_found` | Wrong id, or you don't own it (admins see everything) |

---

### `DELETE /api/files/:id`
Removes both the storage blob and the DB row.

**Response 200**
```json
{ "ok": true }
```

---

## Folders

### `GET /api/folders`
List folders visible to the caller.

**Response 200**
```json
{
  "folders": [
    {
      "id": "clx2…",
      "name": "Reports",
      "ownerId": "clx0…",
      "createdAt": "2026-05-14T01:10:00.000Z",
      "owner": { "id": "clx0…", "email": "alice@example.com" },
      "_count": { "files": 3 }
    }
  ]
}
```

---

### `POST /api/folders`

**Request**
```json
{ "name": "Reports" }
```

**Response 200**
```json
{ "folder": { "id": "clx2…", "name": "Reports", "_count": { "files": 0 } } }
```

**Errors**
| Code | When |
|---|---|
| `400 name_required` | Empty / whitespace-only name |
| `400 name_too_long` | > 80 chars |
| `400 invalid_name` | Starts with `.` or contains `/` or `\` |
| `409 folder_already_exists` | Same owner already has a folder with that name |

---

### `PATCH /api/folders/:id`
Rename the folder.

**Request**
```json
{ "name": "Quarterly Reports" }
```

**Response 200**
```json
{ "folder": { "id": "clx2…", "name": "Quarterly Reports", "_count": { "files": 3 } } }
```

**Errors**: `400 name_required`, `403 forbidden`, `404 not_found`, `409 folder_already_exists`

---

### `DELETE /api/folders/:id`
Delete the folder.

**Query params**
| Param | Effect |
|---|---|
| `cascade=1` _(default)_ | Also delete every file inside, both DB rows and storage blobs |
| `cascade=0` | Refuse to delete if the folder isn't empty |

**Response 200**
```json
{ "ok": true, "removedFiles": 3 }
```

**Errors**: `403 forbidden`, `404 not_found`, `409 folder_not_empty` (with `cascade=0`)

---

## Admin

All endpoints below require `role === "ADMIN"`; otherwise `403 forbidden`.

### `GET /api/admin/users`

**Response 200**
```json
{
  "users": [
    {
      "id": "clx0…",
      "email": "alice@example.com",
      "name": "Alice",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-05-01T00:00:00.000Z",
      "_count": { "files": 12 }
    }
  ]
}
```

---

### `POST /api/admin/users`
Pre-create a user with a role.

**Request**
```json
{
  "email": "bob@example.com",
  "password": "TempPass!1",
  "name": "Bob",
  "role": "USER"
}
```

**Response 200**
```json
{
  "user": {
    "id": "clx9…",
    "email": "bob@example.com",
    "name": "Bob",
    "role": "USER",
    "isActive": true
  }
}
```

**Errors**: `400 email_and_password_required`, `400 password_too_short`, `400 invalid_role`, `409 email_already_used`

---

### `PATCH /api/admin/users/:id`
Change `role`, `isActive`, `name`, or `password`. Any subset of these fields
may be sent.

**Request**
```json
{
  "role": "ADMIN",
  "isActive": true,
  "name": "Robert",
  "password": "newpassword1234"
}
```

**Response 200**
```json
{
  "user": {
    "id": "clx9…",
    "email": "bob@example.com",
    "name": "Robert",
    "role": "ADMIN",
    "isActive": true
  }
}
```

**Errors**: `400 invalid_role`, `400 password_too_short`, `400 cannot_modify_self` (when trying to demote / disable yourself)

---

### `DELETE /api/admin/users/:id`
Hard-delete a user and cascade their folders + files (per the schema).

**Response 200**
```json
{ "ok": true }
```

**Errors**: `400 cannot_delete_self`

---

## Status codes summary

| HTTP | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request payload (validation error in `error` field) |
| 401 | No session / invalid credentials |
| 403 | Authenticated, but lacks permission |
| 404 | Resource not found, or owned by someone else and caller isn't admin |
| 409 | Conflict (duplicate email / folder name) |
| 413 | Upload exceeds `STORAGE_MAX_FILE_MB` |
| 500 | Server error — check server logs |

## Full client example

A signed-in user creating a folder, uploading a file into it, listing, and
cleaning up:

```ts
const headers = { "Content-Type": "application/json" };

// 1. Login
await fetch("/api/auth/login", {
  method: "POST", headers, credentials: "include",
  body: JSON.stringify({ email: "alice@example.com", password: "hunter22hunter" }),
});

// 2. Create folder
const { folder } = await fetch("/api/folders", {
  method: "POST", headers, credentials: "include",
  body: JSON.stringify({ name: "Reports" }),
}).then(r => r.json());

// 3. Upload into it
const fd = new FormData();
fd.append("file", file);            // file = File object from <input type=file>
fd.append("folderId", folder.id);
const { file: saved } = await fetch("/api/files", {
  method: "POST", credentials: "include", body: fd,
}).then(r => r.json());

// 4. List files in the folder
const { files } = await fetch(`/api/files?folderId=${folder.id}`, {
  credentials: "include",
}).then(r => r.json());

// 5. Delete the folder + everything inside
await fetch(`/api/folders/${folder.id}?cascade=1`, {
  method: "DELETE", credentials: "include",
});
```
