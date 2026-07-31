from PIL import Image

img = Image.new("RGB", (400, 300), color=(30, 30, 40))
img.save("/build/badge.jpg", "JPEG")
