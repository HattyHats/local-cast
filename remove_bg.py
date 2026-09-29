from PIL import Image
import sys

img = Image.open('hat-logo.png')
img = img.convert("RGBA")
datas = img.getdata()
newData = []
for item in datas:
    # If the pixel is very close to white
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        newData.append((255, 255, 255, 0)) # transparent
    else:
        newData.append(item)
img.putdata(newData)
img.save('hat-logo-transparent.png', "PNG")
print("Saved transparent image")
