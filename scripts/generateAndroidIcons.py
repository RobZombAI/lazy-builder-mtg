import os
from PIL import Image

src_img_path = '/Users/robzomb/.gemini/antigravity/brain/5a870d4c-431c-48a2-b254-f6649b35da66/lazymagic_app_icon_1784930708938.jpg'
base_res_dir = '/Users/robzomb/Desktop/Progetti_Antigravity/MAGIC CON CHEF/android/app/src/main/res'

densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

img = Image.open(src_img_path)

# Also save a 512x512 play store icon & web icon
img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save('/Users/robzomb/Desktop/Progetti_Antigravity/MAGIC CON CHEF/public/icon.png', 'PNG')
img_512.save('/Users/robzomb/Desktop/Progetti_Antigravity/MAGIC CON CHEF/docs/lazymagic_icon_512.png', 'PNG')

for folder, size in densities.items():
    folder_path = os.path.join(base_res_dir, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Save standard launcher icon
    resized.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')
    # Save round launcher icon
    resized.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')
    # Save foreground launcher icon
    resized.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), 'PNG')

print('Successfully generated all Android mipmap icons!')
