import type { Config } from "release-it";

const standardConfig = {
  npm: {
    versionArgs: ["--workspaces-update=false"],
  },
  git: {
    commitMessage: "v${version}",
    tagExclude: "[-]*",
  },
  github: {
    release: true,
    autoGenerate: true,
    releaseName: "v${version}",
    comments: {
      submit: true,
    },
  },
} satisfies Config;

const nextConfig = {
  npm: {
    versionArgs: ["--workspaces-update=false"],
  },
  git: {
    commit: false,
    tag: true,
    push: true,
  },
  github: {
    release: false,
    comments: {
      submit: false,
    },
  },
} satisfies Config;

const config = process.env.RELEASE_TYPE === "next" ? nextConfig : standardConfig;

export default config satisfies Config;
