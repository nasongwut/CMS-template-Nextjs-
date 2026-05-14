import Endpoint from "../_components/endpoint";
import CodeBlock from "../_components/code-block";

export default function ApiDocsPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Reference
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mt-1">API endpoints</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-3xl">
          Every endpoint accepts and returns JSON unless noted. Authentication
          is via the <code className="font-mono">SESSION_COOKIE_NAME</code> cookie
          set by <code className="font-mono">/api/auth/login</code> and{" "}
          <code className="font-mono">/api/auth/register</code>. Error responses
          always look like <code className="font-mono">{"{ error: \"<code>\" }"}</code>{" "}
          with an appropriate HTTP status.
        </p>
      </header>

      {/* Status codes summary */}
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white/70 dark:bg-zinc-900/40">
        <h2 className="font-medium">Status codes</h2>
        <div className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm font-mono">
          <Row k="200" v="Success" />
          <Row k="400" v="Bad request payload" />
          <Row k="401" v="No session / invalid credentials" />
          <Row k="403" v="Authenticated but lacks permission" />
          <Row k="404" v="Not found or owned by another user" />
          <Row k="409" v="Conflict (duplicate)" />
          <Row k="413" v="Upload too large (STORAGE_MAX_FILE_MB)" />
          <Row k="500" v="Server error" />
        </div>
      </section>

      {/* AUTH */}
      <h2 id="auth" className="text-2xl font-semibold tracking-tight pt-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        Auth
      </h2>

      <Endpoint
        method="POST"
        path="/api/auth/register"
        title="Create a new account"
        description="Sets the session cookie on success — the user is immediately signed in. Always creates a USER-role account; admin promotion requires another admin."
        body={{
          example: `{
  "email": "alice@example.com",
  "password": "hunter22hunter",
  "name": "Alice"
}`,
        }}
        response={{
          example: `{
  "id": "clx0fz4q70000abcdsessionidx",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "USER"
}`,
        }}
        errors={[
          { status: 400, code: "email_and_password_required", when: "Missing one of the required fields" },
          { status: 400, code: "password_too_short", when: "Password is less than 8 characters" },
          { status: 409, code: "email_already_used", when: "Address is already registered" },
        ]}
        examples={[
          {
            title: "curl",
            lang: "bash",
            code: `curl -i -c cookies.txt http://localhost:3000/api/auth/register \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"alice@example.com","password":"hunter22hunter","name":"Alice"}'`,
          },
          {
            title: "fetch (browser)",
            lang: "ts",
            code: `await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    email: "alice@example.com",
    password: "hunter22hunter",
    name: "Alice",
  }),
});`,
          },
        ]}
      />

      <Endpoint
        method="POST"
        path="/api/auth/login"
        title="Sign in"
        body={{
          example: `{
  "email": "alice@example.com",
  "password": "hunter22hunter"
}`,
        }}
        response={{
          example: `{
  "id": "clx0…",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "USER"
}`,
        }}
        errors={[
          { status: 400, code: "email_and_password_required", when: "Missing fields" },
          { status: 401, code: "invalid_credentials", when: "Wrong email/password or account disabled" },
        ]}
        examples={[
          {
            title: "fetch",
            lang: "ts",
            code: `const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});
if (!res.ok) { /* show err */ }`,
          },
        ]}
      />

      <Endpoint
        method="POST"
        path="/api/auth/logout"
        title="Clear the session cookie"
        auth="user"
        response={{ example: `{ "ok": true }` }}
      />

      <Endpoint
        method="GET"
        path="/api/auth/me"
        title="Get the current user"
        description="Useful for client-side hydration. Returns { user: null } when not signed in."
        response={{
          example: `{
  "user": {
    "id": "clx0…",
    "email": "alice@example.com",
    "name": "Alice",
    "role": "USER",
    "isActive": true
  }
}`,
        }}
      />

      {/* FILES */}
      <h2 id="files" className="text-2xl font-semibold tracking-tight pt-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        Files
      </h2>

      <Endpoint
        method="GET"
        path="/api/files"
        title="List files"
        description="Returns files visible to the caller, sorted by createdAt desc. Admins see every user's files."
        auth="user"
        query={[
          { name: "folderId", required: false, desc: "Cuid of an owned folder — only files in that folder" },
          { name: "folderId=root", required: false, desc: "Special value — only files with no folder" },
        ]}
        response={{
          example: `{
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
}`,
        }}
      />

      <Endpoint
        method="POST"
        path="/api/files"
        title="Upload a single file"
        description="multipart/form-data. The blob is namespaced by owner id in the storage backend."
        auth="user"
        multipart={[
          { name: "file", type: "File", required: true, desc: "The binary blob to upload" },
          {
            name: "folderId",
            type: "string",
            required: false,
            desc: 'Cuid of an owned folder, or "root" / omitted for no folder',
          },
        ]}
        response={{
          example: `{
  "file": {
    "id": "clx9…",
    "name": "report.docx",
    "mimeType": "application/vnd...",
    "size": 24576,
    "driver": "local",
    "url": "/files/clx0…/9f3e…hash.docx",
    "ownerId": "clx0…",
    "folderId": "clx2foldercuid000",
    "folder": { "id": "clx2…", "name": "Reports" }
  }
}`,
        }}
        errors={[
          { status: 400, code: "file_field_missing", when: 'No "file" field in form data' },
          { status: 404, code: "folder_not_found", when: "folderId doesn't exist" },
          { status: 403, code: "folder_forbidden", when: "Folder belongs to another user (and caller isn't admin)" },
          { status: 413, code: "file_too_large", when: "> STORAGE_MAX_FILE_MB" },
        ]}
        examples={[
          {
            title: "curl",
            lang: "bash",
            code: `curl -b cookies.txt http://localhost:3000/api/files \\
  -F file=@./report.docx \\
  -F folderId=clx2foldercuid000`,
          },
          {
            title: "fetch (from <input type=\"file\">)",
            lang: "ts",
            code: `const fd = new FormData();
fd.append("file", input.files![0]);
fd.append("folderId", folderId);
const res = await fetch("/api/files", {
  method: "POST",
  credentials: "include",
  body: fd,
});`,
          },
        ]}
      />

      <Endpoint
        method="GET"
        path="/api/files/:id"
        title="Stream the file back"
        description="Returns the raw bytes — used by the UI's preview/download links. Includes proper Content-Type and Content-Disposition headers."
        auth="user"
        response={{
          status: 200,
          lang: "http",
          example: `HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Length: 24576
Content-Disposition: inline; filename="report.docx"

<binary>`,
        }}
        errors={[
          { status: 404, code: "not_found", when: "Wrong id, or owned by someone else and caller isn't admin" },
        ]}
      />

      <Endpoint
        method="DELETE"
        path="/api/files/:id"
        title="Delete file"
        description="Removes both the storage blob and the DB row."
        auth="user"
        response={{ example: `{ "ok": true }` }}
        errors={[{ status: 404, code: "not_found", when: "Wrong id or not owned" }]}
      />

      {/* FOLDERS */}
      <h2 id="folders" className="text-2xl font-semibold tracking-tight pt-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        Folders
      </h2>

      <Endpoint
        method="GET"
        path="/api/folders"
        title="List folders"
        description="Returns folders visible to the caller, sorted alphabetically."
        auth="user"
        response={{
          example: `{
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
}`,
        }}
      />

      <Endpoint
        method="POST"
        path="/api/folders"
        title="Create a folder"
        auth="user"
        body={{ example: `{ "name": "Reports" }` }}
        response={{
          example: `{
  "folder": {
    "id": "clx2…",
    "name": "Reports",
    "ownerId": "clx0…",
    "createdAt": "2026-05-14T01:10:00.000Z",
    "_count": { "files": 0 }
  }
}`,
        }}
        errors={[
          { status: 400, code: "name_required", when: "Empty / whitespace-only name" },
          { status: 400, code: "name_too_long", when: "More than 80 characters" },
          { status: 400, code: "invalid_name", when: "Starts with '.' or contains '/' or '\\\\'" },
          { status: 409, code: "folder_already_exists", when: "Same owner already has a folder with that name" },
        ]}
      />

      <Endpoint
        method="PATCH"
        path="/api/folders/:id"
        title="Rename a folder"
        auth="user"
        body={{ example: `{ "name": "Quarterly Reports" }` }}
        response={{
          example: `{
  "folder": {
    "id": "clx2…",
    "name": "Quarterly Reports",
    "_count": { "files": 3 }
  }
}`,
        }}
        errors={[
          { status: 400, code: "name_required", when: "Empty name" },
          { status: 403, code: "forbidden", when: "Not the owner (and not admin)" },
          { status: 404, code: "not_found", when: "Unknown folder id" },
          { status: 409, code: "folder_already_exists", when: "Name already taken by the owner" },
        ]}
      />

      <Endpoint
        method="DELETE"
        path="/api/folders/:id"
        title="Delete a folder"
        description="Removes the folder. By default also cascades through the files inside (both DB rows and storage blobs)."
        auth="user"
        query={[
          { name: "cascade", type: "0 | 1", required: false, desc: "Default 1 — also delete every file inside. Pass 0 to require an empty folder." },
        ]}
        response={{ example: `{ "ok": true, "removedFiles": 3 }` }}
        errors={[
          { status: 403, code: "forbidden", when: "Not the owner (and not admin)" },
          { status: 404, code: "not_found", when: "Unknown folder id" },
          { status: 409, code: "folder_not_empty", when: "cascade=0 but the folder has files" },
        ]}
      />

      {/* ADMIN */}
      <h2 id="admin" className="text-2xl font-semibold tracking-tight pt-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        Admin
      </h2>

      <Endpoint
        method="GET"
        path="/api/admin/users"
        title="List every user"
        auth="admin"
        response={{
          example: `{
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
}`,
        }}
      />

      <Endpoint
        method="POST"
        path="/api/admin/users"
        title="Pre-create a user with a role"
        auth="admin"
        body={{
          example: `{
  "email": "bob@example.com",
  "password": "TempPass!1",
  "name": "Bob",
  "role": "USER"
}`,
        }}
        response={{
          example: `{
  "user": {
    "id": "clx9…",
    "email": "bob@example.com",
    "name": "Bob",
    "role": "USER",
    "isActive": true
  }
}`,
        }}
        errors={[
          { status: 400, code: "email_and_password_required", when: "Missing fields" },
          { status: 400, code: "password_too_short", when: "< 8 chars" },
          { status: 400, code: "invalid_role", when: 'role not in "ADMIN" | "USER" | "GUEST"' },
          { status: 409, code: "email_already_used", when: "Email already exists" },
        ]}
      />

      <Endpoint
        method="PATCH"
        path="/api/admin/users/:id"
        title="Update role / name / active / password"
        description="Any subset of the fields may be sent. Admins cannot demote or disable themselves."
        auth="admin"
        body={{
          description:
            "All fields are optional, but at least one of name/role/isActive/password should be present.",
          example: `{
  "role": "ADMIN",
  "isActive": true,
  "name": "Robert",
  "password": "newpassword1234"
}`,
        }}
        response={{
          example: `{
  "user": {
    "id": "clx9…",
    "email": "bob@example.com",
    "name": "Robert",
    "role": "ADMIN",
    "isActive": true
  }
}`,
        }}
        errors={[
          { status: 400, code: "invalid_role", when: 'role not in "ADMIN" | "USER" | "GUEST"' },
          { status: 400, code: "password_too_short", when: "< 8 chars" },
          { status: 400, code: "cannot_modify_self", when: "Tried to demote / disable yourself" },
        ]}
      />

      <Endpoint
        method="DELETE"
        path="/api/admin/users/:id"
        title="Delete a user"
        description="Hard-deletes the user. Cascades through their folders and files via Prisma's onDelete: Cascade."
        auth="admin"
        response={{ example: `{ "ok": true }` }}
        errors={[
          { status: 400, code: "cannot_delete_self", when: "Tried to delete yourself" },
        ]}
      />

      <Endpoint
        method="GET"
        path="/api/admin/settings"
        title="Read site settings"
        description="Returns the singleton SiteSettings row used for site-wide branding and SEO metadata."
        auth="admin"
        response={{
          example: `{
  "settings": {
    "id": "singleton",
    "siteName": "Acme Studio",
    "description": "Internal file vault for the design team.",
    "keywords": "files, vault, design, internal",
    "author": "Acme Studio",
    "updatedAt": "2026-05-14T03:22:11.000Z"
  }
}`,
        }}
      />

      <Endpoint
        method="POST"
        path="/api/track/pageview"
        title="Record a page view"
        description="Called automatically by the PageTracker client component on every route change. Public — anonymous visitors are tracked too; the session (if any) is attached as userId."
        body={{
          example: `{
  "path": "/files",
  "referrer": "https://google.com/",
  "utmSource": "newsletter",
  "utmMedium": "email",
  "utmCampaign": "may"
}`,
        }}
        response={{ example: `{ "ok": true }` }}
      />

      <Endpoint
        method="GET"
        path="/api/admin/theme"
        title="Read theme palette"
        description="Returns the singleton ThemeSettings row plus the factory defaults."
        auth="admin"
        response={{
          example: `{
  "theme": {
    "id": "singleton",
    "lightPrimary": "#7c3aed",
    "lightAccent": "#ec4899",
    "lightBackground": "#fafafa",
    "lightForeground": "#18181b",
    "darkPrimary": "#a78bfa",
    "darkAccent": "#f472b6",
    "darkBackground": "#09090b",
    "darkForeground": "#fafafa",
    "updatedAt": "2026-05-14T03:22:11.000Z"
  },
  "defaults": { /* same shape */ }
}`,
        }}
      />

      <Endpoint
        method="PATCH"
        path="/api/admin/theme"
        title="Update theme palette"
        description="Update one or more hex colours. Any subset of the 8 fields may be sent."
        auth="admin"
        body={{
          example: `{
  "lightPrimary": "#0ea5e9",
  "lightAccent":  "#14b8a6",
  "darkPrimary":  "#38bdf8",
  "darkAccent":   "#2dd4bf"
}`,
        }}
        response={{
          example: `{ "theme": { /* updated row */ } }`,
        }}
        errors={[
          { status: 400, code: "invalid_color:<field>", when: "A field value isn't a valid hex" },
          { status: 400, code: "no_fields_provided", when: "Body has no recognised fields" },
        ]}
      />

      <Endpoint
        method="POST"
        path="/api/admin/theme"
        title="Restore default palette"
        description="Resets every colour to the factory default."
        auth="admin"
        response={{ example: `{ "theme": { /* defaults */ } }` }}
      />

      <Endpoint
        method="GET"
        path="/api/admin/about"
        title="Read the about-page singleton"
        auth="admin"
        response={{
          example: `{
  "page": {
    "id": "singleton",
    "heading": "About us",
    "subheading": "Built by makers, for makers.",
    "body": "We started in 2024…",
    "updatedAt": "2026-05-14T03:22:11.000Z"
  }
}`,
        }}
      />

      <Endpoint
        method="PATCH"
        path="/api/admin/about"
        title="Update about-page heading / subheading / body"
        auth="admin"
        body={{
          example: `{
  "heading": "About us",
  "subheading": "A team of builders.",
  "body": "We started in 2024…\\n\\nWe believe…"
}`,
        }}
        response={{ example: `{ "page": { /* updated row */ } }` }}
        errors={[
          { status: 400, code: "heading_required", when: "Heading is empty" },
          { status: 400, code: "heading_too_long", when: "> 200 chars" },
          { status: 400, code: "subheading_too_long", when: "> 400 chars" },
          { status: 400, code: "body_too_long", when: "> 20,000 chars" },
        ]}
      />

      <Endpoint
        method="GET"
        path="/api/admin/articles"
        title="List articles (including drafts)"
        auth="admin"
        response={{
          example: `{
  "articles": [
    {
      "id": "clx…",
      "title": "Launch week",
      "excerpt": "We're live.",
      "body": "Long-form…",
      "imageUrl": "https://…/cover.jpg",
      "isPublished": true,
      "order": 0,
      "createdAt": "…", "updatedAt": "…"
    }
  ]
}`,
        }}
      />

      <Endpoint
        method="POST"
        path="/api/admin/articles"
        title="Create an article"
        auth="admin"
        body={{
          example: `{
  "title": "Launch week",
  "excerpt": "We're live.",
  "body": "Long-form…",
  "imageUrl": "https://…/cover.jpg",
  "isPublished": true,
  "order": 0
}`,
        }}
        response={{ example: `{ "article": { /* created row */ } }` }}
        errors={[
          { status: 400, code: "title_required", when: "Empty title" },
          { status: 400, code: "title_too_long", when: "> 200 chars" },
        ]}
      />

      <Endpoint
        method="PATCH"
        path="/api/admin/articles/:id"
        title="Update an article"
        auth="admin"
        body={{
          description: "Any subset of fields. Use { order: <n> } to reorder.",
          example: `{ "isPublished": false }`,
        }}
        response={{ example: `{ "article": { /* updated row */ } }` }}
      />

      <Endpoint
        method="DELETE"
        path="/api/admin/articles/:id"
        title="Delete an article"
        auth="admin"
        response={{ example: `{ "ok": true }` }}
      />

      <Endpoint
        method="GET"
        path="/api/admin/timeline"
        title="List timeline events"
        auth="admin"
        response={{
          example: `{
  "events": [
    {
      "id": "clx…",
      "date": "2024",
      "title": "We started",
      "description": "Built the first prototype.",
      "isPublished": true,
      "order": 0,
      "createdAt": "…", "updatedAt": "…"
    }
  ]
}`,
        }}
      />

      <Endpoint
        method="POST"
        path="/api/admin/timeline"
        title="Create a timeline event"
        auth="admin"
        body={{
          example: `{
  "date": "Q3 2025",
  "title": "Launched v1",
  "description": "Beta with 50 testers.",
  "isPublished": true,
  "order": 1
}`,
        }}
        response={{ example: `{ "event": { /* created row */ } }` }}
        errors={[
          { status: 400, code: "date_required", when: "Empty date" },
          { status: 400, code: "title_required", when: "Empty title" },
          { status: 400, code: "date_too_long", when: "> 40 chars" },
          { status: 400, code: "title_too_long", when: "> 200 chars" },
        ]}
      />

      <Endpoint
        method="PATCH"
        path="/api/admin/timeline/:id"
        title="Update a timeline event"
        auth="admin"
        body={{
          description: "Any subset of fields. Use { order: <n> } to reorder.",
          example: `{ "title": "Launched v1.1", "isPublished": true }`,
        }}
        response={{ example: `{ "event": { /* updated row */ } }` }}
      />

      <Endpoint
        method="DELETE"
        path="/api/admin/timeline/:id"
        title="Delete a timeline event"
        auth="admin"
        response={{ example: `{ "ok": true }` }}
      />

      <Endpoint
        method="PATCH"
        path="/api/admin/settings"
        title="Update site settings"
        description="Update one or more fields. Any subset of siteName / description / keywords / author may be sent."
        auth="admin"
        body={{
          example: `{
  "siteName": "Acme Studio",
  "description": "Internal file vault for the design team.",
  "keywords": "files, vault, design, internal",
  "author": "Acme Studio"
}`,
        }}
        response={{
          example: `{
  "settings": {
    "id": "singleton",
    "siteName": "Acme Studio",
    "description": "Internal file vault for the design team.",
    "keywords": "files, vault, design, internal",
    "author": "Acme Studio",
    "updatedAt": "2026-05-14T03:25:00.000Z"
  }
}`,
        }}
        errors={[
          { status: 400, code: "siteName_required", when: "Empty siteName provided" },
          { status: 400, code: "siteName_too_long", when: "> 120 chars" },
          { status: 400, code: "description_too_long", when: "> 500 chars" },
          { status: 400, code: "keywords_too_long", when: "> 500 chars" },
          { status: 400, code: "author_too_long", when: "> 120 chars" },
          { status: 400, code: "no_fields_provided", when: "Body has no recognised fields" },
        ]}
      />

      {/* Full client example */}
      <section className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold tracking-tight">Full client example</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          A signed-in user creating a folder, uploading a file into it, listing,
          and cleaning up:
        </p>
        <CodeBlock
          lang="ts"
          code={`const headers = { "Content-Type": "application/json" };

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
fd.append("file", file);                       // File from <input type=file>
fd.append("folderId", folder.id);
const { file: saved } = await fetch("/api/files", {
  method: "POST", credentials: "include", body: fd,
}).then(r => r.json());

// 4. List files inside the folder
const { files } = await fetch(\`/api/files?folderId=\${folder.id}\`, {
  credentials: "include",
}).then(r => r.json());

// 5. Delete the folder + everything inside
await fetch(\`/api/folders/\${folder.id}?cascade=1\`, {
  method: "DELETE", credentials: "include",
});`}
        />
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{k}</span>
      <span className="text-zinc-900 dark:text-zinc-100 text-right">{v}</span>
    </div>
  );
}
