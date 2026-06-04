$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Deploiement Cloudflare Pages - PAC Climatisation" -ForegroundColor Cyan
Write-Host ""

$whoami = npx wrangler whoami 2>&1
if ($whoami -match "not authenticated") {
  Write-Host "Connexion Cloudflare requise. Lancement de wrangler login..." -ForegroundColor Yellow
  npx wrangler login
}

npx wrangler pages deploy pac-climatisation --project-name=iss-pac-climatisation --branch=preview

Write-Host ""
Write-Host "URL principale (apres 1er deploy) : https://iss-pac-climatisation.pages.dev" -ForegroundColor Green
