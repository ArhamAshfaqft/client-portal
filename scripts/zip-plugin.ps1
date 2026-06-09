# Load both required compression assemblies
Add-Type -Assembly 'System.IO.Compression'
Add-Type -Assembly 'System.IO.Compression.FileSystem'

$zipPath = 'feedspace-connector\feedspace-connector.zip'
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "Creating clean zip archive at: $zipPath"

# Create new zip file using string enum 'Create' to prevent assembly parsing issues
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

# Helper to add files with clean forward-slash entry paths
function Add-FileToZip($filePath, $entryName) {
    Write-Host "Adding $filePath as $entryName"
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $filePath, $entryName) | Out-Null
}

# Add files with explicit forward slashes for Linux/WordPress compatibility
Add-FileToZip 'feedspace-connector\feedspace-connector.php' 'feedspace-connector/feedspace-connector.php'
Add-FileToZip 'feedspace-connector\widget\feeddash-widget.js' 'feedspace-connector/widget/feeddash-widget.js'
Add-FileToZip 'feedspace-connector\assets\admin.css' 'feedspace-connector/assets/admin.css'

# Close and write the archive
$archive.Dispose()

Write-Host "Zip archive created successfully!"
