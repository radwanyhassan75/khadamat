# =================================================================
#   Advanced Language File Generator Script (PowerShell Version)
#   This script recursively finds all HTML files in the project
#   and creates new versions for each specified language.
# =================================================================

# قائمة اللغات المطلوبة (يمكنك إضافة أو حذف لغات هنا)
$languages = @("fr", "en", "es")

Write-Host "Starting to generate language files across all directories..."

# استخدام أمر Get-ChildItem للبحث عن جميع ملفات HTML بشكل متكرر
# -Exclude "node_modules" : لتجاهل مجلد node_modules
Get-ChildItem -Path . -Recurse -Filter *.html -Exclude "node_modules" | ForEach-Object {
    $original_file = $_
    
    # استخراج اسم الملف بدون الامتداد (مثال: "settings")
    $base_name = $original_file.BaseName

    # التأكد من أننا لا ننسخ الملفات التي تم إنشاؤها بالفعل (مثل settings-fr)
    if ($base_name -notmatch "-[a-z]{2}$") {
        
        Write-Host "Processing base file: $($original_file.FullName)"
        
        # المرور على كل لغة في القائمة
        foreach ($lang in $languages) {
            
            # إنشاء المسار الكامل للملف الجديد (مثال: C:\...\settings-fr.html)
            $new_file_path = Join-Path -Path $original_file.DirectoryName -ChildPath "$($base_name)-$($lang).html"
            
            # نسخ الملف الأصلي إلى الاسم والمسار الجديد
            Copy-Item -Path $original_file.FullName -Destination $new_file_path
            
            # طباعة رسالة تأكيد
            Write-Host "  -> Created: $new_file_path"
        }
    }
}

Write-Host "Process completed successfully!"
