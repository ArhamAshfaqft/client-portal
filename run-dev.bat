@echo off
cd /d "E:\White label Client Portal"
start /B node node_modules\next\dist\bin\next dev > dev-server.log 2>&1
