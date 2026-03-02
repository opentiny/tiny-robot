# Contributing

We are glad that you are willing to contribute to the Tiny Robot open source project. There are many forms of contribution, and you can choose one or more of them according to your strengths and interests:

- Report [new defect](https://github.com/opentiny/tiny-robot/issues/new?template=bug_report.yml)
- Provide more detailed information for [existing defects](https://github.com/opentiny/tiny-robot/labels/bug), such as supplementary screenshots, more detailed reproduction steps, minimum reproducible demo links, etc.
- Submit Pull Requests to fix typos in the document or make the document clearer and better

When you become familiar with Tiny Robot, you can try to do something more challenging, such as:

- Fix defects
- Implement new features
- Improve unit testing
- Translate the document
- Participate in code review

## Bug Reports

If you encounter problems while using Tiny Robot components, you are welcome to submit an Issue. Before submitting, please read the relevant documentation carefully to confirm whether this is a defect or an unimplemented feature.

If it is a defect, select the [Bug report](https://github.com/opentiny/tiny-robot/issues/new?template=bug_report.yml) template when creating a new Issue. The title should follow the format `[componentName] defect description`. For example: `[bubble] message content is not updated when data changes`.

Issue that reports defects should mainly include:

- Version numbers of `@opentiny/tiny-robot` and `vue`.
- The performance of the defect can be illustrated by screenshot; if there is an error, the error message can be posted.
- Defect reproduction steps, preferably with a minimum reproducible demo link.

If it is a new feature, select the [Feature request](https://github.com/opentiny/tiny-robot/issues/new?template=feature_request.yml) template. The title should follow the format `[componentName] new feature description`. For example: `[sender] hope to support custom placeholder`.

The following information is required for a new feature Issue:

- What problems does this feature mainly solve for users?
- What is the API of this feature?

## Pull Requests

Before submitting a pull request, please make sure that your submission is in line with the overall plan of Tiny Robot. Generally, issues marked as [bug](https://github.com/opentiny/tiny-robot/labels/bug) are encouraged for pull requests. If you are not sure, you can create a [Discussion](https://github.com/opentiny/tiny-robot/discussions) for discussion.

### Pull Request Specification

#### Commit Message

The commit message should be in the form of `type(scope): description`, e.g. `fix(components): [bubble] fix xxx bug`.

1. **type**: must be one of build, chore, ci, docs, feat, fix, perf, refactor, revert, release, style, test, improvement.

2. **scope** (optional): package or component name, e.g. `components`, `kit`, `bubble`, `sender`, `docs`, etc.

#### Pull Request Title

The title should follow the same convention as the commit message, in the form of `type(scope): description`.

#### Pull Request Description

Please fill in the relevant information of the PR, including:

- PR checklist: whether the commit message follows the specifications, whether E2E/test cases are supplemented if needed, and whether documentation is updated if needed
- PR type: Bugfix / Feature / Code style update / Refactoring / Docs / etc.
- Related Issue number (if any)
- Does this PR introduce a breaking change?

### Local Startup Steps

- Fork the [Tiny Robot](https://github.com/opentiny/tiny-robot) repository to your personal account.
- Clone your fork to local.
- Add the upstream remote to sync with the latest code from the upstream repository.
- Run `pnpm i` in the Tiny Robot root directory to install dependencies.
- Run `pnpm dev` to start the docs and playground.
- Open the browser to access the docs and playground.

```shell
# Replace username with your own GitHub username
git clone git@github.com:username/tiny-robot.git
cd tiny-robot

# Add upstream remote
git remote add upstream git@github.com:opentiny/tiny-robot.git

# Install dependencies
pnpm i

# Start docs and playground
pnpm dev
```

### Submit a PR

- Make sure you have completed the local startup steps and can run the project normally.
- Sync the latest code from the upstream `develop` branch: `git pull upstream develop`.
- Create a new branch from the upstream `develop` branch: `git checkout -b username/feat-xxx upstream/develop` (or `username/fix-xxx` for bugfix). Branch name should be `username/feat-xxx` or `username/fix-xxx`.
- Make your changes locally.
- Commit following the [Conventional Commits](https://www.conventionalcommits.org/) specification. PRs that do not follow the specification may not be merged.
- Push to your fork: `git push origin branchName`.
- Open the [Pull requests](https://github.com/opentiny/tiny-robot/pulls) page of the Tiny Robot repository and click **New pull request** to submit the PR.
- Fill in the PR description (checklist, type, related Issue, breaking change).
- After the maintainers review and comment, update the code as needed. New commits on the branch will automatically appear in the same PR.
- After approval, a maintainer will merge the PR.

Thank you for your contribution!
