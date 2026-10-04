[CmdletBinding()]
param(
    [ValidateSet("generic", "web", "node", "python", "android")]
    [string]$Type = "generic",

    [string]$Name = "",

    [switch]$GitHub,
    [switch]$Private,
    [switch]$NoCommit
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Okay([string]$Message) {
    Write-Host "    $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "    $Message" -ForegroundColor Yellow
}

function Write-IfMissing {
    param(
        [Parameter(Mandatory=$true)][string]$Path,
        [Parameter(Mandatory=$true)][string]$Content
    )

    if (Test-Path -LiteralPath $Path) {
        Write-Warn "Kept existing $Path"
        return
    }

    Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
    Write-Okay "Created $Path"
}

function Command-Exists([string]$Command) {
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

$ProjectRoot = (Get-Location).Path
$FolderName = Split-Path -Leaf $ProjectRoot

if ([string]::IsNullOrWhiteSpace($Name)) {
    $DisplayName = $FolderName
} else {
    $DisplayName = $Name.Trim()
}

$RepoName = ($DisplayName -replace '\s+', '-').ToLowerInvariant()
$RepoName = $RepoName -replace '[^a-z0-9._-]', ''
$RepoName = $RepoName.Trim('-', '.')

if ([string]::IsNullOrWhiteSpace($RepoName)) {
    throw "Could not derive a valid repository name from '$DisplayName'."
}

Write-Host ""
Write-Host "PROJECT KICKSTART" -ForegroundColor Magenta
Write-Host "Folder : $ProjectRoot"
Write-Host "Project: $DisplayName"
Write-Host "Type   : $Type"
Write-Host "Repo   : $RepoName"

# -----------------------------
# Markdown project scaffolding
# -----------------------------

$readme = @"
# $DisplayName

Short description of what this project is and why it exists.

## Current status

Early development.

## Getting started

Add setup and run instructions here once the stack is established.

## Project notes

- Active milestone: see ``PROJECT.md``
- Agent working rules: see ``AGENTS.md``
- Short task queue: see ``TODO.md``
"@

$projectMd = @"
# Project Brief — $DisplayName

## Goal

Describe the end result in one or two sentences.

## Current milestone

Define the **one thing** being built or fixed right now.

## Why this milestone matters

Explain what becomes possible once it works.

## Constraints

- Keep the current milestone narrow.
- Preserve working behaviour unless the milestone explicitly changes it.
- Prefer small, reversible changes.
- Experiments should stay isolated from the working build.

## Acceptance criteria

- [ ] Core behaviour works.
- [ ] Relevant tests/checks pass.
- [ ] No unrelated behaviour changed.
- [ ] Result is manually verified where practical.

## Decisions

Record decisions that should survive across Codex sessions.

## Notes / discoveries

Capture useful findings that are **not** part of the current milestone so they do not derail it.
"@

$agentsMd = @"
# AGENTS.md

## Start here

1. Read ``PROJECT.md`` before making changes.
2. Identify the active milestone and its acceptance criteria.
3. Inspect the existing implementation before proposing a replacement.

## Working rules

- Make the smallest coherent change that satisfies the active milestone.
- Do not redesign or restructure unrelated areas.
- Do not delete or rename files unless the task requires it; explain why first when the change is consequential.
- Preserve working behaviour unless the requested milestone explicitly changes it.
- Compare a proposed approach with the current approach using practical evidence where possible.
- Sandboxed experiments are welcome; keep them isolated from the live build until they prove useful.
- If two approaches converge on the same result, say so rather than inventing a difference.
- Run relevant tests, builds, linters, or checks after changes.
- Do not silently fix unrelated problems. Record them under discoveries for the next milestone.

## End-of-task report

Keep the summary concise:

- **Milestone:** what was completed.
- **Proof:** tests/checks/manual verification performed.
- **Changed:** important files or behaviour changed.
- **Found:** unrelated issues or opportunities worth revisiting.
- **Next:** one sensible next step and why.
"@

$todoMd = @"
# TODO

## Now

- [ ] Define the first milestone in ``PROJECT.md``.

## Next

- [ ] Add the first implementation task.

## Later

- [ ] Add ideas here without interrupting the current milestone.
"@

$editorConfig = @"
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_style = space
indent_size = 2
"@

$genericIgnore = @"
# OS / editor
.DS_Store
Thumbs.db
.idea/
.vscode/

# Secrets / local config
.env
.env.*
!.env.example

# Logs / temp
*.log
tmp/
temp/
.cache/

# Project Kickstart bootstrap files
ProjectKickstart.ps1
start-project.cmd
"@

$typeIgnore = switch ($Type) {
    "web" {
@"

# Web / Node
node_modules/
dist/
build/
coverage/
.vite/
.next/
out/
"@
    }
    "node" {
@"

# Node
node_modules/
dist/
build/
coverage/
.nyc_output/
"@
    }
    "python" {
@"

# Python
__pycache__/
*.py[cod]
.venv/
venv/
.pytest_cache/
.mypy_cache/
.ruff_cache/
.coverage
htmlcov/
dist/
build/
*.egg-info/
"@
    }
    "android" {
@"

# Android / Gradle
.gradle/
build/
**/build/
local.properties
*.iml
.externalNativeBuild/
.cxx/
captures/
"@
    }
    default { "" }
}

Write-Step "Creating project files"
Write-IfMissing "README.md" $readme
Write-IfMissing "PROJECT.md" $projectMd
Write-IfMissing "AGENTS.md" $agentsMd
Write-IfMissing "TODO.md" $todoMd
Write-IfMissing ".editorconfig" $editorConfig
Write-IfMissing ".gitignore" ($genericIgnore + $typeIgnore)

# -----------------------------
# Git repository
# -----------------------------

if (-not (Command-Exists "git")) {
    Write-Warn "Git is not installed or not on PATH. Files were created, but Git setup was skipped."
    exit 0
}

Write-Step "Preparing Git repository"

if (-not (Test-Path ".git")) {
    git init | Out-Null
    Write-Okay "Initialized Git"
} else {
    Write-Warn "Existing Git repository detected"
}

# Keep bootstrap files local even if .gitignore was already present.
$infoDir = Join-Path ".git" "info"
$excludePath = Join-Path $infoDir "exclude"
if (-not (Test-Path $infoDir)) {
    New-Item -ItemType Directory -Path $infoDir -Force | Out-Null
}
if (-not (Test-Path $excludePath)) {
    New-Item -ItemType File -Path $excludePath -Force | Out-Null
}

$excludeContent = Get-Content $excludePath -ErrorAction SilentlyContinue
foreach ($bootstrapFile in @("ProjectKickstart.ps1", "start-project.cmd")) {
    if ($excludeContent -notcontains $bootstrapFile) {
        Add-Content -Path $excludePath -Value $bootstrapFile
    }
}

try {
    git branch -M main 2>$null
} catch {
    # A brand-new repo may not have a branch ref yet; commit below will still use main
}

# Make sure initial branch is main even before the first commit where supported.
try {
    git symbolic-ref HEAD refs/heads/main 2>$null
} catch {
    # Safe to continue.
}

if (-not $NoCommit) {
    git add .

    $staged = git diff --cached --name-only
    if ($staged) {
        try {
            git commit -m "chore: initialise project" | Out-Null
            Write-Okay "Created initial commit"
        } catch {
            Write-Warn "Could not create the initial commit."
            Write-Warn "Git may need your name/email configured. Your files are still staged."
        }
    } else {
        Write-Warn "Nothing new to commit"
    }
} else {
    Write-Warn "Skipped initial commit (-NoCommit)"
}

# -----------------------------
# Optional GitHub repository
# -----------------------------

if ($GitHub) {
    Write-Step "Creating GitHub repository"

    if (-not (Command-Exists "gh")) {
        Write-Warn "GitHub CLI (gh) was not found."
        Write-Warn "Install it later with: winget install --id GitHub.cli"
    } else {
        $authOkay = $true
        try {
            gh auth status 1>$null 2>$null
            if ($LASTEXITCODE -ne 0) { $authOkay = $false }
        } catch {
            $authOkay = $false
        }

        if (-not $authOkay) {
            Write-Warn "GitHub CLI is installed but not authenticated. Run: gh auth login"
        } else {
            $existingOrigin = ""
            try {
                $existingOrigin = git remote get-url origin 2>$null
            } catch {}

            if ($existingOrigin) {
                Write-Warn "Remote 'origin' already exists: $existingOrigin"
            } else {
                $visibility = if ($Private) { "--private" } else { "--public" }

                $args = @(
                    "repo", "create", $RepoName,
                    "--source", ".",
                    "--remote", "origin",
                    $visibility
                )

                if (-not $NoCommit) {
                    $headExists = $false
                    try {
                        git rev-parse --verify HEAD 1>$null 2>$null
                        if ($LASTEXITCODE -eq 0) { $headExists = $true }
                    } catch {}

                    if ($headExists) {
                        $args += "--push"
                    }
                }

                & gh @args

                if ($LASTEXITCODE -eq 0) {
                    Write-Okay "GitHub repository created"
                } else {
                    Write-Warn "GitHub repository creation did not complete successfully."
                }
            }
        }
    }
}

Write-Host ""
Write-Host "READY" -ForegroundColor Green
Write-Host "Open this folder in Codex and start with PROJECT.md."
Write-Host ""
Write-Host "Useful examples:"
Write-Host "  .\start-project.cmd -Type web"
Write-Host "  .\start-project.cmd -Type python -GitHub -Private"
Write-Host "  .\start-project.cmd -Name `"My Project`" -Type android -GitHub"
Write-Host ""
