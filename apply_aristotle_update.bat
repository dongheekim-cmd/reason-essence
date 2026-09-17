@echo off
chcp 65001 >nul
setlocal
set "ROOT=%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"$ErrorActionPreference='Stop';" ^
"$root=[System.IO.Path]::GetFullPath('%ROOT%');" ^
"function Edit([string]$rel,[object[]]$pairs) {" ^
"  $p=Join-Path $root $rel;" ^
"  if(-not (Test-Path $p)){ throw ('파일을 찾을 수 없습니다: ' + $rel + ' / ZIP을 reason-essence 저장소 루트에 풀어주세요.') };" ^
"  $bytes=[IO.File]::ReadAllBytes($p);" ^
"  $bom=($bytes.Length -ge 3 -and $bytes[0]-eq 0xEF -and $bytes[1]-eq 0xBB -and $bytes[2]-eq 0xBF);" ^
"  if($bom){$t=[Text.Encoding]::UTF8.GetString($bytes,3,$bytes.Length-3)}else{$t=[Text.Encoding]::UTF8.GetString($bytes)};" ^
"  $orig=$t;" ^
"  foreach($pair in $pairs){$old=[string]$pair[0];$new=[string]$pair[1]; if($t.Contains($old)){$t=$t.Replace($old,$new)} elseif(-not $t.Contains($new)){throw ('예상 문자열을 찾지 못했습니다: '+$rel+' / '+$old)}};" ^
"  if($t -ne $orig){$enc=New-Object Text.UTF8Encoding($bom);[IO.File]::WriteAllText($p,$t,$enc);Write-Host ('수정: '+$rel)}else{Write-Host ('이미 수정됨: '+$rel)}" ^
"};" ^
"$pairs=@(@('과학자 아리스토텔레스','아리스토텔레스라는 세계'),@('틀린 자연학은 어떻게 과학이 되었는가','자연과 인간을 하나의 체계로 읽다'));" ^
"Edit 'js\books-data.js' $pairs;" ^
"Edit 'books\scientist-aristotle.html' $pairs;" ^
"Edit 'books.html' @(@('과학자 아리스토텔레스','아리스토텔레스라는 세계'));" ^
"$src=Join-Path $root 'assets\scientist-aristotle.webp';" ^
"$dst=Join-Path $root 'images\books\scientist-aristotle.webp';" ^
"if(Test-Path $src){Copy-Item $src $dst -Force; Write-Host '교체: images\books\scientist-aristotle.webp'};" ^
"Write-Host '';" ^
"Write-Host '완료: 아리스토텔레스라는 세계 / 자연과 인간을 하나의 체계로 읽다';"

echo.
echo GitHub Desktop에서 변경 파일을 확인한 뒤 커밋/푸시하세요.
pause
