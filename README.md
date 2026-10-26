# MRANTI PDD Interactive Progress Portal

## 🚀 GitHub Pages Deployment Instructions
1. Upload all files into your repository's root folder (`main` branch or `/docs`).
2. Ensure the directory structure is preserved:
   ```
   ├── index.html
   ├── css/
   │   └── style.css
   ├── js/
   │   ├── config.js
   │   ├── data.js
   │   ├── helpers.js
   │   ├── charts.js
   │   ├── management.js
   │   ├── scorecard.js
   │   ├── consultant.js
   │   ├── authority.js
   │   ├── contractor.js
   │   └── auth.js
   └── README.md
   ```
3. In your GitHub Repository:
   - Navigate to **Settings > Pages**.
   - Under **Build and deployment > Source**, select `Deploy from a branch`.
   - Select Branch: `main` and Folder: `/ (root)`.
   - Click **Save**.
4. GitHub Pages will serve `index.html` at `https://<your-username>.github.io/<repo-name>/`.
