Set-Location "E:\White label Client Portal"
$logFile = "E:\White label Client Portal\dev-output.log"
node node_modules\next\dist\bin\next dev > $logFile 2>&1
