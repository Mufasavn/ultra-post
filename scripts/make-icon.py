from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

out = Path(__file__).resolve().parents[1] / 'desktop' / 'assets'
out.mkdir(parents=True, exist_ok=True)
size = 512
im = Image.new('RGBA', (size, size))
mask = Image.new('L', (size, size))
ImageDraw.Draw(mask).rounded_rectangle((0, 0, 511, 511), radius=120, fill=255)
for y in range(size):
    for x in range(size):
        t = (x+y)/(2*size)
        im.putpixel((x,y), (int(159-63*t), int(124-57*t), int(255-36*t), 255))
im.putalpha(mask)
d = ImageDraw.Draw(im)
font = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 390)
d.text((82,-43), 'u', fill='white', font=font)
d.line([(305,190),(410,85)], fill='white', width=23)
d.line([(337,85),(410,85),(410,158)], fill='white', width=23, joint='curve')
im.save(out/'icon.png')
im.save(out/'icon.ico', sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
print('Application icon created.')
