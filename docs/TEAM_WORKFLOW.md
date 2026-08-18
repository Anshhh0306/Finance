# Team Collaboration & Git Workflow Guide

Welcome to the Finance project! This guide explains how our team collaborates smoothly using GitHub, branches, and code reviews.

---

## 1. Branching Strategy

To avoid merge conflicts and keep our `main` branch stable, **no one commits directly to `main`**. Everyone works on their own feature branch.

### Branch Naming Conventions:
* `feature/<feature-name>` (e.g., `feature/ai-chat-ui`, `feature/gold-simulator`)
* `fix/<bug-name>` (e.g., `fix/statement-parser`)
* `dev/<team-member-name>` (e.g., `dev/roshni`, `dev/ansh`)

---

## 2. Step-by-Step Daily Workflow

### Step 1: Sync Your Main Branch
Before starting new work, ensure you have the latest updates:
```bash
git checkout main
git pull origin main
```

### Step 2: Create a New Branch for Your Task
```bash
git checkout -b feature/<your-task-name>
```

### Step 3: Work & Commit Changes Locally
Make your changes, stage them, and write clear commit messages:
```bash
git add .
git commit -m "Add scenario simulation chart for gold and stocks"
```

### Step 4: Push Branch to GitHub
```bash
git push -u origin feature/<your-task-name>
```

### Step 5: Open a Pull Request (PR)
1. Go to the repository on [GitHub](https://github.com/Anshhh0306/Finance).
2. Click **"Compare & pull request"**.
3. Describe what you built or changed.
4. Have at least one friend review and approve the PR before merging into `main`.

---

## 3. Recommended Task Distribution

| Team Member Role | Focus Areas | Suggested First Sprint Tasks |
| :--- | :--- | :--- |
| **Frontend & UI/UX** | Visual interfaces, user experience, responsive design | Build the Chat UI, Dashboard, and Interactive Simulation Charts |
| **AI & Financial Engine** | Prompt orchestration, financial algorithms, backtesting logic | Build the Scenario Simulator (Gold vs. Stock CAGR formulas) and Financial Persona system |
| **Data & Privacy Vault** | Statement ingestion, local encryption, data sanitization | Build the CSV/PDF statement parser and client-side encryption layer |
