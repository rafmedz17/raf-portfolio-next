# Editing your site (the admin page)

Your portfolio has a hidden editor at **`/admin`**. Nothing links to it, and search engines are told to ignore it.

All the site's text lives in [`src/data/content.json`](src/data/content.json). The admin page edits that file for you, so you never have to touch code to change your content.

---

## 1. Editing on your computer (easiest)

1. Run `npm run dev`.
2. Open <http://localhost:3000/admin>.
3. Pick a section on the left, edit the fields and watch the preview on the right.
4. Click **Save** (or press `Ctrl+S`).

Saving writes straight to `src/data/content.json`, and the site at <http://localhost:3000> updates right away. Commit and push that file the way you normally would.

> On your computer you don't need a password. The editor says "No password set" to remind you to add one before going online.

### Handy features

| Feature | Where |
| --- | --- |
| Add a screenshot to a project | **Projects** → open a project → copy a screenshot and press `Ctrl+V` (or drag/upload a file) |
| Undo / redo | Arrows in the top bar |
| Preview on phone or tablet size | Icons above the preview |
| Preview light / dark mode | Moon/sun icon above the preview |
| Download a backup of all content | **⋯ → Download backup** |
| Restore a backup | **⋯ → Restore from backup…** |
| Throw away unsaved edits | **⋯ → Discard unsaved changes** |

If you close the tab without saving, your edits are kept in the browser, and the editor offers to restore them next time.

---

## 2. Editing on your live site (optional)

Live hosts like Vercel can't change files on their servers, so online edits are saved as a **commit to your GitHub repo**. Your host then rebuilds the site automatically, usually in 1–2 minutes.

Add these **environment variables** on your host (on Vercel: *Project → Settings → Environment Variables*):

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | A long password you'll use to log in. **Required**: without it the admin page is switched off online. |
| `GITHUB_TOKEN` | A GitHub token that can write to this repo (see below). |
| `GITHUB_REPO` | `your-username/your-repo`, e.g. `rafmedz17/raf-portfolio-next` |
| `GITHUB_BRANCH` | The branch your site deploys from, e.g. `master` or `main`. Defaults to `master`. |

**Creating the GitHub token**

1. GitHub → *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*.
2. Under **Repository access**, choose *Only select repositories* and pick this repo.
3. Under **Permissions → Repository permissions**, set **Contents** to *Read and write*.
4. Generate it, copy it, and paste it into `GITHUB_TOKEN` on your host.

Redeploy once so the new variables are picked up. Then visit `https://your-site.com/admin`, log in, and edit away.

> Keep these values secret. Never commit them to the repo. `.env*` files are already git-ignored.

### Testing the online setup locally (optional)

Create a file named `.env.local` in the project folder:

```
ADMIN_PASSWORD=pick-a-password
GITHUB_TOKEN=github_pat_...
GITHUB_REPO=your-username/your-repo
GITHUB_BRANCH=master
```

Restart `npm run dev`. The editor will now ask for the password and save to GitHub instead of the local file.

---

## 3. Inbox (messages from your contact form)

When visitors fill in the `git commit` form on your site, their message lands in **`/admin/inbox`**. Switch between **Content** and **Inbox** with the tabs at the top of the admin. A green badge shows how many messages are unread.

In the inbox you can:

- search messages and filter to unread ones
- open a message (it's marked as read automatically)
- **Reply by email**: opens your mail app with their message quoted
- mark a message unread again, or delete it

New messages show up on their own (the inbox checks every 30 seconds), or click **Refresh**.

**Spam protection:** a hidden field that only bots fill in, plus a limit of 5 messages per hour per visitor. Visitor IP addresses are hashed, never stored.

### On your computer

Nothing to set up. Messages are saved to `.data/inbox.json`, which is git-ignored, so they never end up in your repo.

### On your live site

The live site needs a small database to store messages. Upstash Redis has a free tier that's plenty for a portfolio.

**On Vercel (easiest):**

1. Open your project → **Storage** → **Create Database** → choose **Upstash** (Redis / KV).
2. Pick the free plan and **connect it to this project**.
3. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` for you. Redeploy, and you're done.

**Anywhere else:** create a free database at [upstash.com](https://upstash.com), open its **REST API** section, and add these two environment variables on your host:

| Name | Value |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | The REST URL, e.g. `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | The REST token |

Until this is set up online, the contact form tells visitors to email you directly instead.

> Tip: add these variables to `.env.local` too if you want your computer to use the same inbox as the live site.

---

## Troubleshooting

- **"Admin is turned off"**: `ADMIN_PASSWORD` isn't set on your host.
- **"Saving isn't set up on this server"**: the site is online but `GITHUB_TOKEN` / `GITHUB_REPO` are missing.
- **"GitHub responded 404"**: check `GITHUB_REPO` and `GITHUB_BRANCH`, and that the token has access to that repo.
- **"GitHub responded 401/403"**: the token is wrong, expired, or lacks *Contents: Read and write*.
- **Preview stuck on "Loading preview…"**: click the reload icon above the preview.
- **"The inbox isn't set up on this server"**: add the Upstash variables from section 3, then redeploy.
- **Messages sent from the admin preview**: the preview runs your real site, so testing the contact form there sends a real message to your inbox. Just delete it.
