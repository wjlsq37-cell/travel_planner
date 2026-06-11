param(
  [string]$Message = "",
  [string]$Remote = "origin",
  [string]$Branch = "",
  [switch]$SkipBuild,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Stop-WithMessage {
  param([string]$Text)
  Write-Host ""
  Write-Host "ERROR: $Text" -ForegroundColor Red
  exit 1
}

function Run-Command {
  param(
    [string]$Command,
    [string[]]$Arguments,
    [switch]$AllowDryRun
  )

  $display = "$Command $($Arguments -join ' ')"
  if ($DryRun -and $AllowDryRun) {
    Write-Host "[dry-run] $display" -ForegroundColor DarkGray
    return
  }

  Write-Host "> $display" -ForegroundColor Cyan
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    Stop-WithMessage "$display failed."
  }
}

Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Stop-WithMessage "Git was not found. Install Git first, then run this script again."
}

$insideRepo = (& git rev-parse --is-inside-work-tree 2>$null)
if ($LASTEXITCODE -ne 0 -or $insideRepo.Trim() -ne "true") {
  Stop-WithMessage "This folder is not a Git repository."
}

$remoteUrl = (& git remote get-url $Remote 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) {
  Stop-WithMessage "Remote '$Remote' is not configured. Example: git remote add $Remote https://github.com/<user>/<repo>.git"
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
  $Branch = (& git branch --show-current).Trim()
}
if ([string]::IsNullOrWhiteSpace($Branch)) {
  Stop-WithMessage "Could not detect the current branch. Pass -Branch <branch-name>."
}

Write-Host "Repository: $PSScriptRoot" -ForegroundColor Green
Write-Host "Remote:     $Remote ($remoteUrl)" -ForegroundColor Green
Write-Host "Branch:     $Branch" -ForegroundColor Green

if (-not $SkipBuild) {
  if (Test-Path -LiteralPath "package.json") {
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
      Stop-WithMessage "npm was not found. Install Node.js or run with -SkipBuild."
    }
    Run-Command -Command "npm" -Arguments @("run", "build")
  }
}

$statusLines = (& git status --porcelain)
if ([string]::IsNullOrWhiteSpace(($statusLines -join "`n"))) {
  Write-Host "No local changes to commit. Pushing current branch anyway..." -ForegroundColor Yellow
  Run-Command -Command "git" -Arguments @("push", "-u", $Remote, $Branch) -AllowDryRun
  Write-Host "Done." -ForegroundColor Green
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "Update travel planner $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "Commit:     $Message" -ForegroundColor Green
Run-Command -Command "git" -Arguments @("add", "-A") -AllowDryRun
Run-Command -Command "git" -Arguments @("commit", "-m", $Message) -AllowDryRun
Run-Command -Command "git" -Arguments @("push", "-u", $Remote, $Branch) -AllowDryRun

Write-Host ""
if ($DryRun) {
  Write-Host "Dry run complete. No files were staged, committed, or pushed." -ForegroundColor Green
} else {
  Write-Host "Pushed to GitHub successfully." -ForegroundColor Green
}
