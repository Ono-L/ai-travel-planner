FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends curl git ca-certificates gnupg jq sqlite3 \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get -y install --no-install-recommends gh \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate \
    && npm install -g turbo@^2.0.0 wrangler@^3.80.0

USER node
WORKDIR /workspace
