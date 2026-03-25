import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const isGhPages = process.env.GITHUB_PAGES === 'true'
  // When running in GitHub Pages CI, infer the correct base
  // path from the repository name so assets resolve properly.
  const repoName = process.env.GITHUB_REPOSITORY
    ? process.env.GITHUB_REPOSITORY.split('/')[1]
    : ''
  const ghBase = repoName ? `/${repoName}/` : '/'

  return {
    // GitHub Pages serves project sites under /<repo>/
    base: isGhPages ? ghBase : '/',
    plugins: [react()],
  }
})
