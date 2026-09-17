param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Replace-TextPreserveUtf8 {
    param(
        [string]$RelativePath,
        [array]$Replacements
    )

    $path = Join-Path $root $RelativePath
    if (-not (Test-Path $path)) {
        throw "파일을 찾을 수 없습니다: $RelativePath`n이 ZIP을 reason-essence 저장소 루트에 풀었는지 확인하세요."
    }

    $bytes = [System.IO.File]::ReadAllBytes($path)
    $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
    if ($hasBom) {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
    } else {
        $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    }

    $original = $text
    foreach ($r in $Replacements) {
        $old = [string]$r[0]
        $new = [string]$r[1]
        if ($text.Contains($old)) {
            $text = $text.Replace($old, $new)
        } elseif (-not $text.Contains($new)) {
            throw "예상 문자열을 찾지 못했습니다: $RelativePath`n$old"
        }
    }

    if ($text -ne $original) {
        $enc = New-Object System.Text.UTF8Encoding($hasBom)
        [System.IO.File]::WriteAllText($path, $text, $enc)
        Write-Host "수정: $RelativePath"
    } else {
        Write-Host "이미 수정됨: $RelativePath"
    }
}

# 1. 도서 데이터
Replace-TextPreserveUtf8 "js\books-data.js" @(
    @('title: "실천이성의 귀환"', 'title: "도덕이 나라를 세운다"'),
    @('subtitle: "이익의 시대에 도덕을 다시 세우는 법"', 'subtitle: "이익의 시대, 시민의 도덕성으로 공동체를 다시 세우는 법"'),
    @('subtitle: "혼자 있으면 외롭고 함께 있으면 괴로운 이들을 위한 25가지 처세술"', 'subtitle: "흔들리는 삶을 위한 25가지 철학의 질문"')
)

# 2. 『도덕이 나라를 세운다』 상세 페이지
Replace-TextPreserveUtf8 "books\practical-reason.html" @(
    @('실천이성의 귀환', '도덕이 나라를 세운다'),
    @('이익의 시대에 도덕을 다시 세우는 법', '이익의 시대, 시민의 도덕성으로 공동체를 다시 세우는 법')
)

# 3. 『철학자의 인생 매뉴얼』 상세 페이지
Replace-TextPreserveUtf8 "books\philosopher-manual.html" @(
    @('혼자 있으면 외롭고 함께 있으면 괴로운 이들을 위한 25가지 처세술', '흔들리는 삶을 위한 25가지 철학의 질문')
)

# 4. 도서목록의 정적 색인/구조화 데이터
Replace-TextPreserveUtf8 "books.html" @(
    @('실천이성의 귀환', '도덕이 나라를 세운다'),
    @('js/books-data.js?v=202609041800', 'js/books-data.js?v=202609180600')
)

# 5. 새 표지 덮어쓰기
$coverSource = Join-Path $root "assets\practical-reason.webp"
$coverDest = Join-Path $root "images\books\practical-reason.webp"
if (Test-Path $coverSource) {
    Copy-Item $coverSource $coverDest -Force
    Write-Host "교체: images\books\practical-reason.webp"
}

Write-Host ""
Write-Host "완료했습니다."
Write-Host "GitHub Desktop에서 변경된 파일을 확인한 뒤 커밋/푸시하세요."
Write-Host ""
Write-Host "반영 내용:"
Write-Host "  도덕이 나라를 세운다"
Write-Host "  부제: 이익의 시대, 시민의 도덕성으로 공동체를 다시 세우는 법"
Write-Host "  철학자의 인생 매뉴얼"
Write-Host "  부제: 흔들리는 삶을 위한 25가지 철학의 질문"
Write-Host ""
Read-Host "창을 닫으려면 Enter"
