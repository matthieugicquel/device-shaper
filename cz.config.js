/** @type {import('cz-git').CommitizenGitOptions} */
module.exports = {
  skipQuestions: ["scope", "breaking", "footer", "footerPrefix", "confirmCommit"],
  types: [
    {
      name: "refactor ♻️  A code change that neither fixes a bug or adds a feature",
      emoji: "♻️",
      value: "refactor",
    },
    {
      name: "feat     ✨ A new feature",
      emoji: "✨",
      value: "feat",
    },
    {
      name: "fix      🐞 A bug fix",
      emoji: "🐞",
      value: "fix",
    },
    {
      name: "chore    🤖 Build process or auxiliary tool changes",
      emoji: "🤖",
      value: "chore",
    },
    {
      name: "dep      📦 Add external library or package",
      emoji: "📦",
      value: "dep",
    },
    {
      name: "test     🧪 Only changes tests",
      emoji: "🧪",
      value: "test",
    },
    {
      name: "perf     ⚡️ A code change that only improves performance",
      emoji: "⚡️",
      value: "perf",
    },
    {
      name: "deadcode 🧟 Remove dead code",
      emoji: "🧟",
      value: "deadcode",
    },
    {
      name: "docs     ✏️  Documentation only changes",
      emoji: "✏️",
      value: "docs",
    },
    {
      name: "style    🎨 Markup, white-space, formatting, missing semi-colons...",
      emoji: "🎨",
      value: "style",
    },
    {
      name: "release  🚚 Create a release commit",
      emoji: "🚚",
      value: "release",
    },
  ],
  useEmoji: true,
  maxHeaderLength: 100,
};
