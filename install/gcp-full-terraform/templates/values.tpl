#
# Auth Provider
#

authProviders:
  - id: "Public-GitHub"
    host: "github.com"
    type: "GitHub"
    oauth:
      clientId: "CLIENT_ID"
      clientSecret: "CLIENT_SECRET"
      callBackUrl: "https://your-domain.com/auth/github/callback"
      settingsUrl: "https://github.com/settings/connections/applications/CLIENT_ID"
    description: ""
    icon: ""
  - id: "Public-GitLab"
    host: "gitlab.com"
    type: "GitLab"
    oauth:
      clientId: "CLIENT_ID"
      clientSecret: "CLIENT_SECRET"
      callBackUrl: "https://nxpod.khulnasoft.com/auth/gitlab/callback"
      settingsUrl: "https://gitlab.com/profile/applications"
    description: ""
    icon: ""

#
# Branding
#

branding:
  logo: /images/nxpod-ddd.svg
  homepage: https://www.nxpod.khulnasoft.com/
  links:
    header:
      - name: Workspaces
        url: /workspaces/
      - name: Docs
        url: https://www.nxpod.khulnasoft.com/docs/
      - name: Blog
        url: https://www.nxpod.khulnasoft.com/blog/
      - name: Community
        url: https://community.nxpod.khulnasoft.com/
    footer:
      - name: Docs
        url: https://www.nxpod.khulnasoft.com/docs/
      - name: Blog
        url: https://www.nxpod.khulnasoft.com/blog/
      - name: Status
        url: https://status.nxpod.khulnasoft.com/
    social:
      - type: GitHub
        url: https://github.com/khulnasoft/nxpod
      - type: Discourse
        url: https://community.nxpod.khulnasoft.com/
      - type: Twitter
        url: https://twitter.com/nxpod
    legal:
      - name: Imprint
        url: https://www.nxpod.khulnasoft.com/imprint/
      - name: Privacy Policy
        url: https://www.nxpod.khulnasoft.com/privacy/
      - name: Terms of Service
        url: https://www.nxpod.khulnasoft.com/terms/
