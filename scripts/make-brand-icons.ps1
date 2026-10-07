# 品牌圖示產生器(TimeCare)——以 System.Drawing 繪製幾何時鐘,重跑可再現。
# 對齊 docs/DESIGN-SPEC.md token:奶油底 #FBF5EC / 墨棕 #2E2A25 / 陶土橘 #E2795A。
# 用法:pwsh -File scripts/make-brand-icons.ps1(repo 根執行)
# 注意:限 PowerShell 7(pwsh)——WinPS 5.1 將無 BOM UTF-8 中文註解誤讀為 CP950,會靜默漏行。
Add-Type -AssemblyName System.Drawing

$Cream  = [System.Drawing.ColorTranslator]::FromHtml('#FBF5EC')
$Ink    = [System.Drawing.ColorTranslator]::FromHtml('#2E2A25')
$Accent = [System.Drawing.ColorTranslator]::FromHtml('#E2795A')

function New-Canvas([int]$size) {
  $bmp = [System.Drawing.Bitmap]::new($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  return @{ Bmp = $bmp; G = $g }
}

# 繪製時鐘:圓環(ring)+四向刻度+時針(accent,指向 10)+分針(ink,指向 2)+中心點。
# $size 畫布邊長;$diameter 時鐘直徑;$bg 背景色($null=透明);$mono $true=全 ink(Android themed icon 用 alpha)
function Draw-Clock([hashtable]$c, [double]$diameter, [object]$bg, [bool]$mono) {
  $g = $c.G; $S = $c.Bmp.Width
  $cx = $S / 2.0; $cy = $S / 2.0
  $R = $diameter / 2.0            # 面盤外緣半徑
  $ringW = $diameter * 0.075      # 圓環粗細
  $ringColor = if ($mono) { $Ink } else { $Ink }
  $accentColor = if ($mono) { $Ink } else { $Accent }

  if ($null -ne $bg) { $g.Clear($bg) } else { $g.Clear([System.Drawing.Color]::Transparent) }

  # 圓環
  $penRing = [System.Drawing.Pen]::new($ringColor, [float]$ringW)
  $rRing = $R - $ringW / 2.0
  $g.DrawEllipse($penRing, [float]($cx - $rRing), [float]($cy - $rRing), [float](2 * $rRing), [float](2 * $rRing))

  # 四向刻度(12/3/6/9)——favicon 等極小尺寸可略($diameter >= 100 才畫)
  if ($diameter -ge 100) {
    $penTick = [System.Drawing.Pen]::new($accentColor, [float]($diameter * 0.028))
    $penTick.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penTick.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    foreach ($deg in 0, 90, 180, 270) {
      $rad = $deg * [Math]::PI / 180.0
      $r1 = $R * 0.80; $r2 = $R * 0.90
      $g.DrawLine($penTick,
        [float]($cx + $r1 * [Math]::Sin($rad)), [float]($cy - $r1 * [Math]::Cos($rad)),
        [float]($cx + $r2 * [Math]::Sin($rad)), [float]($cy - $r2 * [Math]::Cos($rad)))
    }
    $penTick.Dispose()
  }
  $penRing.Dispose()

  # 指針:時針指向 10(-60°)、分針指向 2(+60°),圓端點
  $hourLen = $R * 0.46; $minLen = $R * 0.68
  $penHour = [System.Drawing.Pen]::new($accentColor, [float]($diameter * 0.06))
  $penMin  = [System.Drawing.Pen]::new($ringColor,   [float]($diameter * 0.048))
  foreach ($p in $penHour, $penMin) {
    $p.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $p.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  }
  $aH = -60 * [Math]::PI / 180.0
  $aM = 60 * [Math]::PI / 180.0
  $g.DrawLine($penHour, [float]$cx, [float]$cy,
    [float]($cx + $hourLen * [Math]::Sin($aH)), [float]($cy - $hourLen * [Math]::Cos($aH)))
  $g.DrawLine($penMin, [float]$cx, [float]$cy,
    [float]($cx + $minLen * [Math]::Sin($aM)), [float]($cy - $minLen * [Math]::Cos($aM)))
  $penHour.Dispose(); $penMin.Dispose()

  # 中心點
  $dotR = $diameter * 0.052
  $brushDot = [System.Drawing.SolidBrush]::new($accentColor)
  $g.FillEllipse($brushDot, [float]($cx - $dotR), [float]($cy - $dotR), [float](2 * $dotR), [float](2 * $dotR))
  $brushDot.Dispose()
}

function Save-Png([hashtable]$c, [string]$path) {
  $c.G.Dispose()
  $c.Bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $c.Bmp.Dispose()
  Write-Host "OK $path"
}

$root = $PSScriptRoot | Split-Path
$img = Join-Path $root 'assets\images'

# 1) 主圖示(iOS/通用)1024——奶油底滿版
$c = New-Canvas 1024; Draw-Clock $c 636 $Cream $false; Save-Png $c (Join-Path $img 'icon.png')

# 2) Android adaptive 前景 512——透明底,內容限安全區(直徑 ≤ 66%)
$c = New-Canvas 512; Draw-Clock $c 266 $null $false; Save-Png $c (Join-Path $img 'android-icon-foreground.png')

# 3) Android adaptive 背景 512——純奶油
$c = New-Canvas 512; $c.G.Clear($Cream); Save-Png $c (Join-Path $img 'android-icon-background.png')

# 4) Android themed(monochrome)432——透明底全 ink(僅 alpha 有意義)
$c = New-Canvas 432; Draw-Clock $c 300 $null $true; Save-Png $c (Join-Path $img 'android-icon-monochrome.png')

# 5) Splash 圖 256——透明底
$c = New-Canvas 256; Draw-Clock $c 224 $null $false; Save-Png $c (Join-Path $img 'splash-icon.png')

# 6) Favicon 48——奶油底,極簡(無刻度)
$c = New-Canvas 48; Draw-Clock $c 36 $Cream $false; Save-Png $c (Join-Path $img 'favicon.png')
