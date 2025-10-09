// 移除未使用的 VersionData 接口，因为现在使用 jsdelivr API

// 版本号比较函数
function compareVersions(a: string, b: string): number {
  const aParts = a.split(/[.-]/).map((part) => (isNaN(Number(part)) ? part : Number(part)))
  const bParts = b.split(/[.-]/).map((part) => (isNaN(Number(part)) ? part : Number(part)))

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0
    const bPart = bParts[i] || 0

    if (typeof aPart === 'number' && typeof bPart === 'number') {
      if (aPart !== bPart) {
        return aPart - bPart
      }
    } else if (typeof aPart === 'string' && typeof bPart === 'string') {
      if (aPart !== bPart) {
        return aPart.localeCompare(bPart)
      }
    } else {
      // Numbers come before strings
      return typeof aPart === 'number' ? -1 : 1
    }
  }
  return 0
}

interface GetVersionsOptions {
  versionSegments?: number // 版本号段数，如 2 表示按 major.minor 分组，3 表示按 major.minor.patch 分组
  includePrerelease?: boolean | string[] // 是否包含预发布版本，true=包含所有，false=不包含，数组=包含指定类型
  limit?: number // 限制返回的版本总数量，默认为 20
  keepPerGroup?: number // 每个版本组保留的版本数量，默认为 1（只保留最新版本）
  includeLatest?: boolean // 是否包含 latest tag，默认为 true
}

const versionCache = new Map<string, string[]>()

export async function getVersions(pkg: string, options: GetVersionsOptions = {}): Promise<string[]> {
  const { versionSegments = 0, includePrerelease = false, limit = 20, keepPerGroup = 1, includeLatest = true } = options
  // 生成缓存键，处理 includePrerelease 可能是数组的情况
  const prereleaseKey = Array.isArray(includePrerelease) ? includePrerelease.join(',') : includePrerelease
  const cacheKey = `${pkg}-${versionSegments}-${prereleaseKey}-${limit}-${keepPerGroup}-${includeLatest}`

  if (versionCache.has(cacheKey)) {
    return versionCache.get(cacheKey)!
  }

  try {
    // 使用 jsdelivr 的 API 获取版本信息
    const response = await fetch(`https://data.jsdelivr.com/v1/package/npm/${pkg}`)
    const data = await response.json()

    if (!data.versions || !Array.isArray(data.versions)) {
      throw new Error('Invalid response format')
    }

    let versions = data.versions
      .filter((version: string) => {
        // 过滤预发布版本
        if (typeof includePrerelease === 'boolean') {
          if (!includePrerelease && /[a-zA-Z]/.test(version)) {
            return false
          }
        } else if (Array.isArray(includePrerelease)) {
          // 如果指定了要包含的预发布版本类型
          if (/[a-zA-Z]/.test(version)) {
            // 检查版本是否包含指定的预发布类型
            const hasMatchingType = includePrerelease.some(
              (type) => version.includes(`-${type}.`) || version.includes(`-${type}-`) || version.endsWith(`-${type}`),
            )
            if (!hasMatchingType) {
              return false
            }
          }
        }
        return true
      })
      .sort((a: string, b: string) => {
        // Sort versions in descending order, including alpha/rc versions
        const aParts = a.split(/[.-]/).map((part) => (isNaN(Number(part)) ? part : Number(part)))
        const bParts = b.split(/[.-]/).map((part) => (isNaN(Number(part)) ? part : Number(part)))

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0
          const bPart = bParts[i] || 0

          if (typeof aPart === 'number' && typeof bPart === 'number') {
            if (aPart !== bPart) {
              return bPart - aPart
            }
          } else if (typeof aPart === 'string' && typeof bPart === 'string') {
            if (aPart !== bPart) {
              return bPart.localeCompare(aPart)
            }
          } else {
            // Numbers come before strings
            return typeof bPart === 'number' ? 1 : -1
          }
        }
        return 0
      })

    // 如果指定了版本号段数，则按段数分组并保留指定数量的版本
    if (versionSegments > 0) {
      const versionGroups = new Map<string, string[]>()

      // 按段数分组
      versions.forEach((version: string) => {
        const parts = version.split(/[.-]/)
        const truncatedVersion = parts.slice(0, versionSegments).join('.')

        if (!versionGroups.has(truncatedVersion)) {
          versionGroups.set(truncatedVersion, [])
        }
        versionGroups.get(truncatedVersion)!.push(version)
      })

      // 对每个组内的版本进行排序，并保留指定数量的最新版本
      const result: string[] = []
      for (const [, groupVersions] of versionGroups) {
        // 对组内版本按版本号降序排序
        const sortedGroupVersions = groupVersions.sort((a, b) => compareVersions(b, a))
        // 保留指定数量的最新版本
        const keptVersions = sortedGroupVersions.slice(0, keepPerGroup)
        result.push(...keptVersions)
      }

      // 对最终结果按版本号降序排序
      versions = result.sort((a, b) => compareVersions(b, a))
    }

    // 限制返回的版本数量
    versions = versions.slice(0, limit)

    // Add latest tag if available and includeLatest is true
    if (includeLatest && data.tags?.latest) {
      versions.unshift('latest')
    }

    versionCache.set(cacheKey, versions)
    return versions
  } catch (error) {
    console.error(`Failed to fetch versions for ${pkg}:`, error)
    return ['latest']
  }
}
