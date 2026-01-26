@echo off
echo BilStop V2 Gecisi Basliyor...
echo.

echo 1. Eski Git baglantisi temizleniyor...
if exist .git (
    rmdir /s /q .git
)

echo.
echo 2. Yeni depo baslatiliyor...
git init
git add .
git commit -m "Guncelleme geliyor"
git branch -M main

echo.
echo 3. Yeni sunucuya baglanti kuruluyor...
git remote add origin https://github.com/dhantion/bilstop2.git

echo.
echo 4. Kodlar gonderiliyor...
git push -u origin main --force

echo.
echo ISLEM TAMAMLANDI! 
echo Simdi GitHub Settings > Secrets kismindan API anahtarlarini eklemeyi unutmayin.
echo Ve Settings > Pages kismindan "GitHub Actions" secmeyi unutmayin.
pause
