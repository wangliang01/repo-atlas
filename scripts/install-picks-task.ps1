# 注册「每天 4 次同步精选」的 Windows 计划任务。
# 用法：右键 → 使用 PowerShell 运行；或在仓库根目录执行
#   powershell -ExecutionPolicy Bypass -File scripts/install-picks-task.ps1
# 卸载：
#   schtasks /Delete /TN "RepoAtlas-Picks" /F
#
# 每小时触发、每 6 小时真正执行一次 = 一天 4 次。
# 日志在 .scratch/picks-cron.log。

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$cmd = Join-Path $root "scripts\picks-cron.cmd"

if (-not (Test-Path $cmd)) {
  throw "找不到 $cmd"
}

schtasks /Create /TN "RepoAtlas-Picks" /TR "$cmd" /SC HOURLY /MO 6 /F | Out-Host

if ($LASTEXITCODE -ne 0) {
  throw "注册失败（退出码 $LASTEXITCODE）。可能需要在「以管理员身份运行」的 PowerShell 里再试一次。"
}

Write-Host ""
Write-Host "已注册。查状态： schtasks /Query /TN `"RepoAtlas-Picks`" /V /FO LIST"
Write-Host "立刻跑一次： schtasks /Run /TN `"RepoAtlas-Picks`""
Write-Host "看日志：     Get-Content .scratch/picks-cron.log -Tail 30"
