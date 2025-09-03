# Git Workflow Guide

This guide explains how to set up your project on another computer, make changes, and keep everything in sync with GitHub.

---

## 1. Cloning the Repository on a New Computer

On a new computer, open a terminal and run:

```bash
git clone https://github.com/lukeblyons/cipher.git
```

This will create a folder called `cipher` with all your files.

Move into the folder:

```bash
cd cipher
```

---

## 2. Making Changes and Pushing Them

Whenever you make edits:

1. Stage your changes:

   ```bash
   git add .
   ```

2. Commit your changes with a message:

   ```bash
   git commit -m "Describe what you changed"
   ```

3. Push your changes to GitHub:
   ```bash
   git push
   ```

---

## 3. Getting Updates from GitHub (Syncing on Another Computer)

If you made changes on another machine and want them here:

1. Make sure you are in your project folder:

   ```bash
   cd cipher
   ```

2. Pull the latest updates:
   ```bash
   git pull
   ```

This will fetch and merge changes from GitHub into your local copy.

---

## 4. Quick Reference

- **Clone repo (first time on a new computer):**

  ```bash
  git clone https://github.com/lukeblyons/cipher.git
  ```

- **Stage, commit, and push changes:**

  ```bash
  git add .
  git commit -m "Your message here"
  git push
  ```

- **Update your local copy with remote changes:**
  ```bash
  git pull
  ```
