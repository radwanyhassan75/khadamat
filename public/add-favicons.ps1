Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match '(?i)<head[^>]*>') {
        # إضافة الروابط بعد وسم <head>
        $newContent = $content -replace '(?i)(<head[^>]*>)', "`$1`n    <link rel=`"icon`" type=`"image/png`" href=`"/favicon-96x96.png`" sizes=`"96x96`" />`n    <link rel=`"icon`" type=`"image/svg+xml`" href=`"/favicon.svg`" />`n    <link rel=`"shortcut icon`" href=`"/favicon.ico`" />`n    <link rel=`"apple-touch-icon`" sizes=`"180x180`" href=`"/apple-touch-icon.png`" />`n    <link rel=`"manifest`" href=`"/site.webmanifest`" />"
        Set-Content $_.FullName $newContent -Encoding UTF8
        Write-Host "Updated favicon links in: $($_.Name)"
    }
    else {
        Write-Host "No <head> found in: $($_.Name)"
    }
}
Write-Host "All HTML files processed."
