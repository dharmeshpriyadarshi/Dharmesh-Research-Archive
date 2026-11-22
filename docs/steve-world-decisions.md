# Steve Mode — World and Asset Decisions

## Initial house concept
Asset: to-keep-your-photo-frame-house.glb

The first Steve Mode prototype used a small house model
in a static Three.js viewer with orbit controls.

## Playable-world upgrade
World: bought-a-bigger-house-just-so-that-i-could-keep-you-somewhere-safe.glb
Character: minecraft_-_steve.glb
Separate chest: minecraft_chest.glb

Reason:
The replacement environment includes terrain, vegetation,
buildings and recognizable in-world objects. This supports
a third-person exploration experience instead of a
standalone model viewer.

## Architecture
- Academic archive remains the default website.
- Steve Mode is isolated under /steve.
- Movement and interaction are restricted to portfolio activities.
- Terrain geometry will drive navigation and collision checks.
- Chests, bookshelves and crafting tables represent portfolio content.

## Known limitations at this checkpoint
- The initial character spawn is below the terrain.
- Terrain collisions and walkable surfaces need calibration.
- Steve does not yet have skeletal walking animations.
- Interior navigation and accessible research panels are incomplete.

## Publication requirement
Verify each third-party asset's original source, license,
attribution and applicable intellectual-property rights
before pushing the models to a public repository.
