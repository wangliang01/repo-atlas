@echo off
rem Windows 计划任务调这个文件：cmd 里才能可靠地切到仓库根目录
cd /d "%~dp0.."
if not exist ".scratch" mkdir ".scratch"
node scripts\picks-cron.mjs >> ".scratch\picks-cron.log" 2>&1
