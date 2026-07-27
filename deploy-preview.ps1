$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Build multi-LP → dist/" -ForegroundColor Cyan
node build-site.js

Write-Host ""
Write-Host "Deploiement Cloudflare Pages" -ForegroundColor Cyan

$whoami = npx wrangler whoami 2>&1
if ($whoami -match "not authenticated") {
  Write-Host "Connexion Cloudflare requise. Lancement de wrangler login..." -ForegroundColor Yellow
  npx wrangler login
}

npx wrangler pages deploy dist --project-name=irisolaris-landing-pages-promo --branch=main

Write-Host ""
Write-Host "URLs de production :" -ForegroundColor Green
Write-Host "  PAC Climatisation : https://irisolaris-landing-pages-promo.pages.dev/"
Write-Host "  PAC Piscine       : https://irisolaris-landing-pages-promo.pages.dev/pac-piscine/"
Write-Host "  Centrale PV       : https://irisolaris-landing-pages-promo.pages.dev/centrale-pv/"
