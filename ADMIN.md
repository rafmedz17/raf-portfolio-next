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

## Troubleshooting

- **"Admin is turned off"**: `ADMIN_PASSWORD` isn't set on your host.
- **"Saving isn't set up on this server"**: the site is online but `GITHUB_TOKEN` / `GITHUB_REPO` are missing.
- **"GitHub responded 404"**: check `GITHUB_REPO` and `GITHUB_BRANCH`, and that the token has access to that repo.
- **"GitHub responded 401/403"**: the token is wrong, expired, or lacks *Contents: Read and write*.
- **Preview stuck on "Loading preview…"**: click the reload icon above the preview.
