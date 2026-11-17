# Iniciador do Peres Tarefas.
# Chamado por "Iniciar Peres Tarefas.bat" (e por "Fazer backup.bat" com -Backup).
# Funciona tanto no pacote pronto (pasta "sistema") quanto no código-fonte.
param(
  [string]$Root,
  [switch]$Backup,
  [switch]$Recuperar,
  [int]$Port = 0
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Versão do Node usada no pacote. Precisa ser da mesma versão principal usada no build.
$NodeVersion = "24.15.0"

if ($Port -eq 0) { $Port = if ($env:PERES_PORTA) { [int]$env:PERES_PORTA } else { 3000 } }
if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
$Root = (Resolve-Path $Root).Path
$IsPackage = Test-Path (Join-Path $Root "sistema\server.js")
# Em testes automáticos: não abre navegador nem cria atalho.
$IsTest = $env:PERES_TESTE -eq "1"
$DataDir = Join-Path $Root "dados"
$env:PERES_DATA_DIR = $DataDir

if ($IsPackage) {
  $AppDir = Join-Path $Root "sistema"
  $ScriptsDir = Join-Path $AppDir "scripts"
  $MigrationsDir = Join-Path $AppDir "prisma\migrations"
} else {
  $AppDir = Join-Path $Root ".next\standalone"
  $ScriptsDir = Join-Path $Root "scripts"
  $MigrationsDir = Join-Path $Root "prisma\migrations"
}

function Write-Step([string]$Text) { Write-Host ""; Write-Host "> $Text" -ForegroundColor Cyan }

function Stop-WithError([string]$Text) {
  Write-Host ""
  Write-Host "ERRO: $Text" -ForegroundColor Red
  Write-Host "Tire um print desta janela e envie para quem cuida do sistema."
  Read-Host "Pressione Enter para fechar"
  exit 1
}

# ---------------------------------------------------------------- Node
function Get-NodeExe {
  $portable = Join-Path $Root "runtime\node\node.exe"
  if (Test-Path $portable) { return $portable }

  # Só o código-fonte pode usar um Node já instalado; o pacote usa sempre o dele.
  if (-not $IsPackage) {
    $system = Get-Command node -ErrorAction SilentlyContinue
    if ($system) {
      $major = [int]((& $system.Source -v).TrimStart("v").Split(".")[0])
      if ($major -ge 22) { return $system.Source }
    }
  }

  Install-PortableNode
  return $portable
}

function Install-PortableNode {
  Write-Step "Baixando o Node.js $NodeVersion (só na primeira vez, precisa de internet)..."
  $name = "node-v$NodeVersion-win-x64"
  $base = "https://nodejs.org/dist/v$NodeVersion"
  $tmp = Join-Path $env:TEMP "peres-tarefas-node"
  New-Item -ItemType Directory -Force $tmp | Out-Null
  $zip = Join-Path $tmp "$name.zip"
  try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest "$base/$name.zip" -OutFile $zip -UseBasicParsing
    $sums = (Invoke-WebRequest "$base/SHASUMS256.txt" -UseBasicParsing).Content
  } catch {
    Stop-WithError "Não foi possível baixar o Node.js. Verifique a internet e tente de novo."
  }

  # Confere a assinatura do arquivo baixado antes de usar.
  $expected = ($sums -split "`n" | Where-Object { $_ -match "  $name\.zip$" }) -replace "\s+.*$", ""
  $actual = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()
  if (-not $expected -or $expected.Trim() -ne $actual) { Stop-WithError "O arquivo do Node.js baixado está corrompido." }

  Expand-Archive $zip -DestinationPath $tmp -Force
  $target = Join-Path $Root "runtime\node"
  if (Test-Path $target) { Remove-Item $target -Recurse -Force }
  New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
  Move-Item (Join-Path $tmp $name) $target
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

function Invoke-Npm([string]$NodeExe, [string[]]$NpmArgs) {
  $npmCli = Join-Path (Split-Path $NodeExe) "node_modules\npm\bin\npm-cli.js"
  Push-Location $Root
  try {
    if (Test-Path $npmCli) { & $NodeExe $npmCli @NpmArgs } else { & npm @NpmArgs }
    if ($LASTEXITCODE -ne 0) { Stop-WithError "Falha ao executar: npm $($NpmArgs -join ' ')" }
  } finally { Pop-Location }
}

# --------------------------------------------- Preparação (código-fonte)
function Initialize-Source([string]$NodeExe) {
  $env:Path = "$(Split-Path $NodeExe);$env:Path"

  if (-not (Test-Path (Join-Path $Root "node_modules"))) {
    Write-Step "Instalando dependências (só na primeira vez, pode levar alguns minutos)..."
    Invoke-Npm $NodeExe @("ci", "--no-audit", "--no-fund")
  }

  if (-not (Test-Path (Join-Path $AppDir "server.js"))) {
    Write-Step "Preparando o sistema (só na primeira vez)..."
    Invoke-Npm $NodeExe @("run", "build")
  }

  # O build standalone não inclui os arquivos estáticos; copia para junto do servidor.
  Copy-Item (Join-Path $Root ".next\static") (Join-Path $AppDir ".next\static") -Recurse -Force
  if (Test-Path (Join-Path $Root "public")) { Copy-Item (Join-Path $Root "public") (Join-Path $AppDir "public") -Recurse -Force }
}

# ---------------------------------------------------------------- Rede
# Só placas conectadas à rede de verdade (com gateway); ignora adaptadores virtuais.
function Get-LanAddresses {
  try {
    Get-NetIPConfiguration -ErrorAction Stop |
      Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq "Up" } |
      ForEach-Object { $_.IPv4Address.IPAddress } |
      Where-Object { $_ -and $_ -notlike "169.254.*" }
  } catch { @() }
}

function Test-PortInUse([int]$P) {
  try { [bool](Get-NetTCPConnection -LocalPort $P -State Listen -ErrorAction Stop) } catch { $false }
}

# ---------------------------------------------------------------- Atalho
function New-DesktopShortcut {
  if ($IsTest) { return }
  $desktop = [Environment]::GetFolderPath("Desktop")
  $link = Join-Path $desktop "Peres Tarefas.lnk"
  if (Test-Path $link) { return }
  try {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($link)
    $shortcut.TargetPath = Join-Path $Root "Iniciar Peres Tarefas.bat"
    $shortcut.WorkingDirectory = $Root
    $shortcut.Description = "Abrir o Peres Tarefas"
    $shortcut.Save()
    Write-Host "Atalho 'Peres Tarefas' criado na área de trabalho."
  } catch {
    Write-Host "Não foi possível criar o atalho na área de trabalho (sem problema)."
  }
}

# ================================================================ Início
Write-Host "==============================================="
Write-Host "  Peres Tarefas"
Write-Host "==============================================="

$node = Get-NodeExe
if (-not $IsPackage) { Initialize-Source $node }

if ($Backup) {
  Write-Step "Fazendo backup do banco de dados..."
  & $node (Join-Path $ScriptsDir "backup.mjs")
  if ($LASTEXITCODE -ne 0) { Stop-WithError "Não foi possível fazer o backup." }
  Read-Host "Pressione Enter para fechar"
  exit 0
}

if ($Recuperar) {
  Write-Step "Recuperar acesso"
  & $node (Join-Path $ScriptsDir "recuperar-acesso.mjs")
  Write-Host ""
  $email = Read-Host "Digite o e-mail da pessoa (ou só Enter para sair)"
  if ($email) {
    & $node (Join-Path $ScriptsDir "recuperar-acesso.mjs") $email
    if ($LASTEXITCODE -ne 0) { Stop-WithError "Não foi possível gerar a nova senha." }
  }
  Read-Host "Pressione Enter para fechar"
  exit 0
}

$baseUrl = "http://localhost:$Port"
if (Test-PortInUse $Port) {
  Write-Host ""
  Write-Host "O sistema já está aberto. Abrindo o navegador..."
  if (-not $IsTest) { Start-Process $baseUrl }
  Start-Sleep -Seconds 2
  exit 0
}

Write-Step "Verificando o banco de dados..."
& $node (Join-Path $ScriptsDir "migrar.mjs") (Join-Path $DataDir "peres-tarefas.db") $MigrationsDir
if ($LASTEXITCODE -ne 0) { Stop-WithError "Não foi possível preparar o banco de dados." }

New-DesktopShortcut

# Espera o servidor responder e abre o navegador. Na primeira vez, abre a
# configuração inicial já com o token, para ninguém precisar digitar nada.
$opener = Start-Job -ArgumentList $baseUrl, $DataDir, $IsTest -ScriptBlock {
  param($Url, $Data, $Quiet)
  for ($i = 0; $i -lt 60; $i++) {
    try { Invoke-WebRequest "$Url/configuracao-inicial" -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop | Out-Null; break }
    catch { if ($_.Exception.Response) { break } ; Start-Sleep -Milliseconds 500 }
  }
  if ($Quiet) { return }
  $tokenFile = Join-Path $Data "setup-token"
  if (Test-Path $tokenFile) {
    $token = (Get-Content $tokenFile -Raw).Trim()
    Start-Process "$Url/configuracao-inicial?token=$token"
  } else {
    Start-Process $Url
  }
}

Write-Host ""
Write-Host "Sistema ligado!" -ForegroundColor Green
Write-Host "Neste computador:   $baseUrl"
foreach ($ip in Get-LanAddresses) { Write-Host "Outros computadores: http://${ip}:$Port" }
Write-Host ""
Write-Host "NÃO FECHE ESTA JANELA enquanto estiver usando o sistema." -ForegroundColor Yellow
Write-Host "Para desligar, feche esta janela."
Write-Host ""

$env:NODE_ENV = "production"
$env:PORT = "$Port"
$env:HOSTNAME = "0.0.0.0"
Push-Location $AppDir
try { & $node "server.js" } finally {
  Pop-Location
  Remove-Job $opener -Force -ErrorAction SilentlyContinue
}
