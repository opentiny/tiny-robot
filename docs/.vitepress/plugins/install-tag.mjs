import { assertPublishVersion } from '../../../scripts/publish-version-utils.js'

const TINY_ROBOT_PACKAGE_PATTERN = /@opentiny\/tiny-robot(?:-(?:chat|cli|kit|svgs))?(?![\w./-])(?:@[^\s"'`]+)?/g
const INSTALL_COMMAND_PATTERN = /^\s*(?:(?:pnpm|yarn)\s+add|npm\s+(?:install|i)|npx)\s+.*$/gm
const SHELL_LANGUAGES = new Set(['bash', 'sh', 'shell', 'zsh'])

export function resolveDocsDistTag(packageVersion) {
  return assertPublishVersion(packageVersion).distTag
}

export function tagTinyRobotPackages(source, distTag) {
  if (!distTag || distTag === 'latest') return source

  return source.replace(INSTALL_COMMAND_PATTERN, (command) =>
    command.replace(TINY_ROBOT_PACKAGE_PATTERN, (packageSpec) => {
      const versionSeparator = packageSpec.indexOf('@', 1)
      const packageName = versionSeparator === -1 ? packageSpec : packageSpec.slice(0, versionSeparator)
      return `${packageName}@${distTag}`
    }),
  )
}

export function installPackageTagPlugin(md, { distTag } = {}) {
  md.core.ruler.after('block', 'tiny-robot-install-tag', (state) => {
    for (const token of state.tokens) {
      if (token.type !== 'fence') continue

      const language = token.info.trim().split(/\s+/, 1)[0]
      if (!SHELL_LANGUAGES.has(language)) continue

      token.content = tagTinyRobotPackages(token.content, distTag)
    }
  })
}
