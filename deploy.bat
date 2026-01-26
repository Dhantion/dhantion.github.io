@echo off
echo BilStop Deployment Scripti Calisiyor...
echo.

echo 1. Dosyalar ekleniyor...
git add .

echo.
echo 2. Degisiklikler paketleniyor...
git commit -m "Final fix with locations and secure firebase [Automated]"

echo.
echo 3. GitHub'a gonderiliyor (Force Push)...
git push -u origin main --force

echo.
echo ISLEM TAMAMLANDI! 
echo Pencereyi kapatabilirsiniz.
pause
