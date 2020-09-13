---
layout: post
title: Migrate to GitHub Actions from Travis CI
image: images/github_actions/travis_to_github_actions.png
image-alt: Faded Travis to bright GitHub Actions
comments: false
---

GitHub Actions should simplify continuous integration (CI) for public repositories hosted on GitHub when compared with external services like Travis CI or CircleCI. To test this, I decided to migrate one of my public repositories from Travis CI to GitHub Actions. This post describes my approach and also lists the resources I found helpful. Overall I am satisfied with the outcome, but found getting there somewhat tricky; documentation on workflow syntax and individual Actions is plentiful, but few examples describe how to combine Actions into jobs that accomplish specific tasks. My hope is that this post can help others construct GitHub Actions workflows that require more than testing source code.

<img src="/images/github_actions/travis_to_github_actions.png" alt="Migrate to GitHub Actions from Travis CI" class="centered_img" width="606" height="303" />

## The test repository
After writing my PhD thesis in LaTeX, I published a thesis template designed to help others save time. In this [Stanford LaTeX Thesis Example repository](https://github.com/dcroote/stanford-thesis-example), I use CI to compile a PDF and upload it as a Release asset so that the PDF available for download from the README always corresponds to the latest Release version.

## Previous implementation
[Previously](https://github.com/dcroote/stanford-thesis-example/blob/aa4d62bb17849f89c460a47ce88b5c5f05586054/.travis.yml), I used Travis CI to pull a Docker image and compile a PDF from LaTeX source files. For tagged commits, a distinct GitHub account with write privileges to the repository (a [Machine user](https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users)) then uploaded the compiled PDF as a Release asset. Using Docker within Travis CI to compile the PDF worked well, but having to create a new GitHub account for the sole purpose of deploying to GitHub Releases, as is [recommended for security purposes](https://docs.travis-ci.com/user/deployment-v2/providers/releases/#authenticating-with-an-oauth-token), was not ideal and further required the [Travis gem to encrypt a personal access token](https://docs.travis-ci.com/user/environment-variables#defining-encrypted-variables-in-travisyml).

## Current implementation (2020/09/06)
You can view the [full workflow on GitHub](https://github.com/dcroote/stanford-thesis-example/blob/2f89058fbc73e9887c659ed1197b73fce7d9333a/.github/workflows/build.yml) (note that this URL points to the current commit as of this writing and not the master branch). Currently, two sequential jobs within a single GitHub Actions workflow mirror the two steps in the previous implementation: compilation and Release asset upload. Using two jobs within one workflow rather than two distinct workflows avoids performing the compilation step twice; however, an `if` conditional within the second job is necessary to limit its execution to only when the workflow is triggered by a tagged commit (rather than, for example, a PR). The two jobs consist of the following steps:

**(1)** Triggered by a push or pull request (PR), the first workflow job compiles the PDF from source and uploads it as a build artifact. The job's four steps are:
1. Checkout source code using the [Checkout](https://github.com/marketplace/actions/checkout) GitHub Action.
2. Compile the LaTeX PDF file using the Marketplace Action: [GitHub Action for LaTeX](https://github.com/marketplace/actions/github-action-for-latex) by `xu-cheng`. 
3. Rename the compiled PDF using a bash shell. Note that this isn't strictly necessary, but retaining the PDF filename allowed me to maintain backwards compatibility.
4. Upload the PDF as an artifact using the [Upload a Build Artifact](https://github.com/marketplace/actions/upload-a-build-artifact) GitHub Action. This Action allows data to persist beyond the lifetime of the job and in my case allows the PDF to be inspected, for example to evaluate changes from a PR.

**(2)** For a PR or an untagged commit, the GitHub Actions workflow ends here with success or failure. If instead the commit is tagged and the tag starts with `v` (i.e. uses semantic versioning of the form `v#.#.#`), then this job downloads the previously uploaded artifact, creates a draft Release, and uploads the PDF as a Release asset. The three steps are:
1. Download the artifact from the previous job using the [Download a Build Artifact](https://github.com/marketplace/actions/download-a-build-artifact) GitHub Action.
2. Create a draft Release using the [Create a Release](https://github.com/marketplace/actions/create-a-release) GitHub Action. The benefit of GitHub Actions over Travis CI is particularly apparent in this step as the Action automatically provides the appropriate GitHub Token for authentication.
3. Upload the PDF as a Release asset. After this succeeds I can add a changelog to the draft Release and publish. The repository's README will then automatically point to this new PDF because the URL uses `latest`: [https://github.com/dcroote/stanford-thesis-example/releases/latest/download/thesis-example.pdf](https://github.com/dcroote/stanford-thesis-example/releases/latest/download/thesis-example.pdf).

If you have suggestions for improving the workflow, let me know!

## Helpful resources:
- GitHub Docs on: [Workflow syntax reference for GitHub Actions](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions), especially the job [if conditional](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idif)
- GitHub Docs on: [Persisting workflow data using artifacts](https://docs.github.com/en/actions/configuring-and-managing-workflows/persisting-workflow-data-using-artifacts)
- GitHub Docs on: [Context and expression syntax for GitHub Actions](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions)
- Stack Overflow: [github actions: how to check if current push has new tag (is new release)?](https://stackoverflow.com/a/58478262) 
