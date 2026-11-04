Add-Type -AssemblyName System.Drawing
$src = "C:\Users\shaib\.gemini\antigravity\brain\fbc1ee13-ca2f-4547-8a80-aa4fc93250d3\.user_uploaded\media_1793752030371_cae75fe8.jpg"
$img = [System.Drawing.Bitmap]::FromFile($src)

$cropM = New-Object System.Drawing.Rectangle(0, 560, 220, 200)
$bmpM = $img.Clone($cropM, $img.PixelFormat)
$bmpM.Save("c:\Users\shaib\Desktop\Projects\PremiumBank\public\mountain.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmpM.Dispose()

$cropG = New-Object System.Drawing.Rectangle(430, 110, 580, 175)
$bmpG = $img.Clone($cropG, $img.PixelFormat)
$bmpG.Save("c:\Users\shaib\Desktop\Projects\PremiumBank\public\globe-network.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmpG.Dispose()

$img.Dispose()
Write-Output "Assets successfully extracted"

