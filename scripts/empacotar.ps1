# Gera o pacote pronto para o escritório: dist\PeresTarefas-<versão>.zip
# Contém o sistema já compilado e o Node portátil; não precisa instalar nada.
#
# Uso: npm run empacotar
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Root = Split-Path -Parent $PSScriptRoot
$Version = (Get-Content (Join-Path $Root "package.json") -Raw | ConvertFrom-Json).version

# Mesma versão fixada no iniciador.
$NodeVersion = (Select-String -Path (Join-Path $PSScriptRoot "iniciar.ps1") -Pattern '^\$NodeVersion = "(.+)"').Matches[0].Groups[1].Value

# O driver do SQLite é compilado para a versão principal do Node que roda o build.
$buildMajor = (node -v).TrimStart("v").Split(".")[0]
if ($buildMajor -ne $NodeVersion.Split(".")[0]) {
  throw "O build precisa rodar com Node $($NodeVersion.Split('.')[0]).x (atual: $(node -v))."
}

Write-Host "> Gerando build de produção..."
Push-Location $Root
try {
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Falha no build." }
} finally { Pop-Location }

$dist = Join-Path $Root "dist"
$out = Join-Path $dist "PeresTarefas"
if (Test-Path $out) { Remove-Item $out -Recurse -Force }
$app = Join-Path $out "sistema"
New-Item -ItemType Directory -Force $app | Out-Null

Write-Host "> Copiando o sistema..."
Copy-Item (Join-Path $Root ".next\standalone\*") $app -Recurse -Force
Copy-Item (Join-Path $Root ".next\static") (Join-Path $app ".next\static") -Recurse -Force
if (Test-Path (Join-Path $Root "public")) { Copy-Item (Join-Path $Root "public") (Join-Path $app "public") -Recurse -Force }
New-Item -ItemType Directory -Force (Join-Path $app "prisma") | Out-Null
Copy-Item (Join-Path $Root "prisma\migrations") (Join-Path $app "prisma\migrations") -Recurse -Force
New-Item -ItemType Directory -Force (Join-Path $app "scripts") | Out-Null
foreach ($file in "iniciar.ps1", "migrar.mjs", "backup.mjs") {
  Copy-Item (Join-Path $PSScriptRoot $file) (Join-Path $app "scripts\$file")
}
foreach ($file in "Iniciar Peres Tarefas.bat", "Fazer backup.bat", "COMO USAR.txt") {
  Copy-Item (Join-Path $Root $file) (Join-Path $out $file)
}

# O build rastreia a pasta dados/ local (caminho montado em tempo de execução): remove.
foreach ($dir in "dados", "backups") {
  $path = Join-Path $app $dir
  if (Test-Path $path) { Remove-Item $path -Recurse -Force }
}

# Segurança: nada de banco, segredo ou token de desenvolvimento no pacote.
Get-ChildItem $out -Recurse -Force -Include "*.db", "*.db-journal", "session-secret", "setup-token" |
  ForEach-Object { throw "Arquivo sensível encontrado no pacote: $($_.FullName)" }

Write-Host "> Incluindo o Node.js $NodeVersion portátil..."
$name = "node-v$NodeVersion-win-x64"
$cache = Join-Path $Root "runtime\cache"
New-Item -ItemType Directory -Force $cache | Out-Null
$zip = Join-Path $cache "$name.zip"
if (-not (Test-Path $zip)) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest "https://nodejs.org/dist/v$NodeVersion/$name.zip" -OutFile $zip -UseBasicParsing
}
$sums = (Invoke-WebRequest "https://nodejs.org/dist/v$NodeVersion/SHASUMS256.txt" -UseBasicParsing).Content
$expected = (($sums -split "`n" | Where-Object { $_ -match "  $name\.zip$" }) -replace "\s+.*$", "").Trim()
if ($expected -ne (Get-FileHash $zip -Algorithm SHA256).Hash.ToLower()) {
  Remove-Item $zip -Force
  throw "O arquivo do Node.js em cache está corrompido. Rode de novo."
}
$tmp = Join-Path $cache "extract"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
Expand-Archive $zip -DestinationPath $tmp
# Para rodar o sistema basta o node.exe (o npm não é necessário no pacote).
New-Item -ItemType Directory -Force (Join-Path $out "runtime\node") | Out-Null
Copy-Item (Join-Path $tmp "$name\node.exe") (Join-Path $out "runtime\node\node.exe")
Copy-Item (Join-Path $tmp "$name\LICENSE") (Join-Path $out "runtime\node\LICENSE")
Remove-Item $tmp -Recurse -Force

Write-Host "> Compactando..."
$zipOut = Join-Path $dist "PeresTarefas-$Version.zip"
if (Test-Path $zipOut) { Remove-Item $zipOut -Force }
Compress-Archive -Path $out -DestinationPath $zipOut

$size = [math]::Round((Get-Item $zipOut).Length / 1MB, 1)
Write-Host ""
Write-Host "Pacote pronto: $zipOut ($size MB)" -ForegroundColor Green
