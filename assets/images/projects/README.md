# Project Images Gallery

This folder contains separate subfolders for each project's gallery images.

## Folder Structure

```
assets/images/projects/
├── wod/                    # World of Dungeon gallery images
├── typing-warriors/        # Typing Warriors gallery images
├── essu-igp/              # ESSU IGP gallery images
├── lakwatsa/               # Lakwatsa gallery images
├── essu-digital-archive/   # ESSU Digital Archive gallery images
├── portfolio/              # Personal Portfolio gallery images
├── midman-ai/              # Midman AI gallery images
└── woogle/                 # Woogle Search Engine gallery images
```

## How to Add Images

1. Place your gallery images in the corresponding project folder
2. Update `assets/js/app.js` in the `projectGalleries` object
3. Add image paths like: `'assets/images/projects/{project-id}/image-name.jpg'`

## Example

For World of Dungeon, add images to `wod/` folder:
- `assets/images/projects/wod/screenshot1.jpg`
- `assets/images/projects/wod/screenshot2.jpg`
- `assets/images/projects/wod/gameplay1.jpg`

Then update in `app.js`:
```javascript
'wod': {
  title: 'World of Dungeon - Gallery',
  images: [
    'assets/images/projects/wod/screenshot1.jpg',
    'assets/images/projects/wod/screenshot2.jpg',
    'assets/images/projects/wod/gameplay1.jpg'
  ]
}
```

## Note

- Main project thumbnail images (WOD.png, PW.png, etc.) remain in `assets/images/` for card displays
- Only gallery images go in these project-specific folders
- Supported image formats: .jpg, .jpeg, .png, .webp, .gif

