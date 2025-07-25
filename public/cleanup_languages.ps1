# =================================================================
#   Language File Cleanup Script (PowerShell Version)
#   This script recursively finds and deletes all generated language files.
# =================================================================

# قائمة اللواحق التي سيتم حذفها
$suffixes = @("-fr.html", "-en.html", "-es.html")

Write-Host "Starting to clean up generated language files..." -ForegroundColor Yellow

# ✅ FIX: بناء أنماط البحث بشكل ديناميكي من مصفوفة $suffixes
$includePatterns = $suffixes | ForEach-Object { "*$_" }

# البحث عن جميع الملفات التي تنتهي باللواحق المحددة وحذفها
# ✅ FIX: استخدام الأنماط الصحيحة واستثناء مجلد node_modules
Get-ChildItem -Path . -Recurse -Include $includePatterns -Exclude "node_modules" | ForEach-Object {
    # هذا الشرط هو إجراء وقائي إضافي
    if ($_.Name -match "(-fr.html|-en.html|-es.html)$") {
        Write-Host "Deleting: $($_.FullName)" -ForegroundColor Red
        Remove-Item -Path $_.FullName -Force
    }
}

Write-Host "Cleanup completed successfully!" -ForegroundColor Green
