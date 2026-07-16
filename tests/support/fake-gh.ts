import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * 测试用中性仓库标识。
 *
 * 避免 fake `gh` 与集成测试默认绑定真实个人/组织仓库。
 */
export const FAKE_DEFAULT_REPOSITORY = "example/ai-article-hub";

/** fake `gh` 的子进程环境和结构化调用记录。 */
export interface FakeGh {
  env: NodeJS.ProcessEnv;
  readCalls(): Promise<string[][]>;
}

/** 创建 fake `gh` 时的可注入行为。 */
export interface CreateFakeGhOptions {
  /** `gh issue view --json` 的返回值。 */
  issueView?: unknown;
  /** REST Issue 资源；key 为 issue/PR number 字符串。 */
  issueResources?: Record<string, unknown>;
  /** 发布评论时返回的 URL（可含换行）。 */
  commentUrl?: string;
  failIssueComment?: boolean;
  failPrComment?: boolean;
  failTargetPreflight?: boolean;
  /** 发布成功时是否省略 URL。 */
  omitCommentUrl?: boolean;
  /** 固定生成的 comment id，默认 9001。 */
  nextCommentId?: number;
  repository?: string;
}

/**
 * 创建支持 Issue 读取、目标预检与评论发布的 fake `gh` 外部边界。
 *
 * @param issueOrOptions 兼容旧签名的 Issue view 对象，或完整 options。
 * @param legacyOptions 旧的 failIssueComment 选项。
 */
export async function createFakeGh(
  issueOrOptions: unknown = {},
  legacyOptions: { failIssueComment?: boolean } = {}
): Promise<FakeGh> {
  const options = normalizeOptions(issueOrOptions, legacyOptions);
  const root = await mkdtemp(path.join(tmpdir(), "article-hub-fake-gh-"));
  const scriptPath = path.join(root, "fake-gh.mjs");
  const configPath = path.join(root, "config.json");
  const logPath = path.join(root, "calls.jsonl");

  await writeFile(configPath, JSON.stringify(options), "utf8");
  await writeFile(
    scriptPath,
    `
import { appendFileSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
appendFileSync(process.env.FAKE_GH_LOG, \`\${JSON.stringify(args)}\\n\`);

const config = JSON.parse(readFileSync(process.env.FAKE_GH_CONFIG, "utf8"));
const repository = config.repository || ${JSON.stringify(FAKE_DEFAULT_REPOSITORY)};

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1 || index === args.length - 1) return undefined;
  return args[index + 1];
}

function fail(message, code = 1) {
  process.stderr.write(message);
  process.exit(code);
}

// Issue view for label reads
if (args[0] === "issue" && args[1] === "view") {
  process.stdout.write(JSON.stringify(config.issueView ?? { number: 51, labels: [] }));
  process.exit(0);
}

// Target preflight via gh api
if (args[0] === "api") {
  const hostnameIndex = args.indexOf("--hostname");
  const hostname = hostnameIndex === -1 ? undefined : args[hostnameIndex + 1];
  const pathArg = args.find(
    (arg, index) => index > 0 && !arg.startsWith("--") && args[index - 1] !== "--hostname"
  );

  if (hostname !== "github.com") {
    fail("fake gh api requires --hostname github.com");
  }

  if (!pathArg) {
    fail("fake gh api missing path");
  }

  const issueMatch = /^repos\\/([^/]+)\\/([^/]+)\\/issues\\/(\\d+)$/.exec(pathArg);
  if (issueMatch) {
    if (config.failTargetPreflight) {
      fail("fake gh target preflight failed");
    }

    const owner = issueMatch[1];
    const name = issueMatch[2];
    const number = issueMatch[3];
    const expected = repository.split("/");

    if (owner !== expected[0] || name !== expected[1]) {
      fail(\`fake gh api repository mismatch: \${owner}/\${name}\`);
    }

    const resource = config.issueResources?.[number];
    if (!resource) {
      fail(\`fake gh issue resource missing: \${number}\`);
    }

    process.stdout.write(typeof resource === "string" ? resource : JSON.stringify(resource));
    process.exit(0);
  }

  fail(\`fake gh unsupported api path: \${pathArg}\`);
}

// PR / Issue comment publish
if ((args[0] === "pr" || args[0] === "issue") && args[1] === "comment") {
  if (args[0] === "issue" && config.failIssueComment) {
    fail("fake gh issue comment failed");
  }
  if (args[0] === "pr" && config.failPrComment) {
    fail("fake gh pr comment failed");
  }

  const number = args[2];
  const bodyFile = readOption("--body-file");
  const repo = readOption("--repo");

  if (!bodyFile) {
    fail("fake gh comment requires --body-file");
  }

  if (args.includes("--body")) {
    fail("fake gh comment must not receive --body");
  }

  if (repo !== \`github.com/\${repository}\`) {
    fail(\`fake gh comment repository mismatch: \${repo}\`);
  }

  try {
    readFileSync(bodyFile, "utf8");
  } catch {
    fail(\`fake gh cannot read body-file: \${bodyFile}\`);
  }

  if (config.omitCommentUrl) {
    process.stdout.write("");
    process.exit(0);
  }

  if (config.commentUrl) {
    process.stdout.write(config.commentUrl);
    process.exit(0);
  }

  const commentId = config.nextCommentId ?? 9001;
  const kindPath = args[0] === "pr" ? "pull" : "issues";
  const commentUrl =
    \`https://github.com/\${repository}/\${kindPath}/\${number}#issuecomment-\${commentId}\`;

  process.stdout.write(commentUrl + "\\n");
  process.exit(0);
}

// 兼容旧测试：issue edit 等无特殊逻辑命令直接成功
process.exit(0);
`,
    "utf8"
  );

  return {
    env: {
      ARTICLE_HUB_GH_COMMAND: JSON.stringify([process.execPath, scriptPath]),
      FAKE_GH_CONFIG: configPath,
      FAKE_GH_LOG: logPath
    },
    async readCalls() {
      const raw = await readFile(logPath, "utf8").catch(() => "");

      return raw
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line) as string[]);
    }
  };
}

function normalizeOptions(
  issueOrOptions: unknown,
  legacyOptions: { failIssueComment?: boolean }
): CreateFakeGhOptions {
  if (
    issueOrOptions !== null &&
    typeof issueOrOptions === "object" &&
    !Array.isArray(issueOrOptions) &&
    ("issueView" in issueOrOptions ||
      "issueResources" in issueOrOptions ||
      "commentUrl" in issueOrOptions ||
      "failIssueComment" in issueOrOptions ||
      "failPrComment" in issueOrOptions ||
      "failTargetPreflight" in issueOrOptions ||
      "omitCommentUrl" in issueOrOptions ||
      "nextCommentId" in issueOrOptions ||
      "repository" in issueOrOptions)
  ) {
    return {
      repository: FAKE_DEFAULT_REPOSITORY,
      ...(issueOrOptions as CreateFakeGhOptions)
    };
  }

  return {
    issueView: issueOrOptions,
    failIssueComment: legacyOptions.failIssueComment,
    repository: FAKE_DEFAULT_REPOSITORY,
    issueResources: {
      "51": {
        number: 51,
        repository_url: `https://api.github.com/repos/${FAKE_DEFAULT_REPOSITORY}`,
        url: `https://api.github.com/repos/${FAKE_DEFAULT_REPOSITORY}/issues/51`
      }
    }
  };
}

/**
 * 构造 Issue REST 资源 fixture。
 */
export function buildIssueResource(
  number: number,
  options: {
    repository?: string;
    pullRequest?: boolean;
  } = {}
): Record<string, unknown> {
  const repository = options.repository ?? FAKE_DEFAULT_REPOSITORY;
  const resource: Record<string, unknown> = {
    number,
    repository_url: `https://api.github.com/repos/${repository}`,
    url: `https://api.github.com/repos/${repository}/issues/${number}`
  };

  if (options.pullRequest) {
    resource.pull_request = {
      url: `https://api.github.com/repos/${repository}/pulls/${number}`
    };
  }

  return resource;
}
