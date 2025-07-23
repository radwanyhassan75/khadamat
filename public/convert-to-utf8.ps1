Get-ChildItem -Recurse -Include *.html, *.htm | ForEach-Object {
    $content = Get-Content $_.FullName -Encoding Default
    $content | Set-Content $_.FullName -Encoding utf8
    Write-Host "✅ Converted: $($_.FullName)"
}
