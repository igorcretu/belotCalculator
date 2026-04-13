# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Deploying To Netlify

This app is configured for Netlify with [netlify.toml](netlify.toml):

- Build command: `npm run build`
- Publish directory: `build`
- SPA redirect rule to `index.html`

### Quick setup

1. Push this repository to GitHub.
2. In Netlify, select **Add new site** -> **Import an existing project**.
3. Connect this repository.
4. Netlify will detect settings from `netlify.toml`.
5. Deploy the site.

### Custom domain (`belot.crig.dev`)

1. In Netlify: **Site configuration** -> **Domain management** -> **Add domain**.
2. Add `belot.crig.dev`.
3. At your DNS provider for `crig.dev`, add:
	- Type: `CNAME`
	- Name/Host: `belot`
	- Target/Value: your Netlify target shown in Domain management (usually something like `your-site-name.netlify.app`)
4. Wait for DNS propagation, then enable HTTPS in Netlify if not already enabled.

### Automatic deploys from GitHub Actions

This repository includes a workflow at [.github/workflows/netlify-deploy.yml](.github/workflows/netlify-deploy.yml).
It deploys to Netlify on pushes to the `main` branch and can also be run manually.

Add these repository secrets in GitHub: **Settings** -> **Secrets and variables** -> **Actions**:

- `NETLIFY_AUTH_TOKEN`: Personal access token from Netlify (User settings -> Applications -> Personal access tokens).
- `NETLIFY_SITE_ID`: Your Netlify site ID (Site configuration -> General -> Site details).

After adding secrets, push to `main` to trigger a production deployment.
