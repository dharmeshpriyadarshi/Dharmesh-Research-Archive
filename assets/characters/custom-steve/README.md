# Custom Steve 3D Character Package

Ready-to-use 3D character asset package reconstructed from reference screenshots, including a native Blockbench project, a binary glTF 2.0 model, and a unified pixel-art texture atlas.

## Archive Contents

| File | Description |
| :--- | :--- |
| `custom_steve.bbmodel` | Native Blockbench project (`free` / Generic Model, format v4.10) with the 128×64 texture atlas embedded directly as base64. Opens immediately with no external path relinking required. |
| `custom_steve.glb` | Binary glTF 2.0 3D model (16 px = 1 m, 2.0 m total height) with articulated bone hierarchy, nearest-neighbor (`NEAREST`) texture filtering, `MASK` alpha cutout, `doubleSided` overlays, and embedded atlas. |
| `custom_steve_atlas.png` | Unified 128×64 RGBA pixel-art texture atlas. Left `64×64` (`u: 0–63`) follows the standard Minecraft 64×64 skin + overlay layout; right `64×64` (`u: 64–127`) contains the custom 3D flat-top wide-brim hat UV regions. |
| `README.md` | Package documentation and integration guide. |

## Opening in Blockbench

1. Launch **Blockbench** (desktop or web app).
2. Go to **File → Open Model** and select `custom_steve.bbmodel`.
3. All cubes, bone groups (`Root`, `Head`, `Hat`, `Body`, `RightArm`, `LeftArm`, `RightLeg`, `LeftLeg`), and the embedded `custom_steve_atlas.png` texture load automatically.
4. To paint or edit pixels externally, edit `custom_steve_atlas.png` (keep 128×64 RGBA with nearest-neighbor scaling) and reload it in Blockbench's **Textures** panel.

## Using `custom_steve.glb` (Three.js / React Three Fiber / Blender)

- **Scale:** `16 px = 1.0 m` (character stands from `y = 0.0` to `y ≈ 2.02 m`, facing `+Z` via a 180° Y rotation on `Root`).
- **Filtering & Material:** Uses `magFilter: NEAREST`, `minFilter: NEAREST`, `metallicFactor: 0`, `roughnessFactor: 1`, `alphaMode: MASK`, `doubleSided: true` for sharp voxel edges and clean cutout overlays (open jacket front, short sleeves, rolled trouser cuffs).
- **Articulated Bone Nodes (Animation Pivots):**
  - `Root` — origin `[0, 0, 0]` (world anchor)
  - `Head` — pivot `[0, 1.50, 0]` (neck); contains child node `Hat` (`HatCrown` + `HatBrim`)
  - `Body` — pivot `[0, 1.50, 0]` (`BodyBase` + `JacketOverlay`)
  - `RightArm` — pivot `[+0.3125, 1.375, 0]` (`RightArmBase` + `RightSleeveOverlay`)
  - `LeftArm` — pivot `[-0.3125, 1.375, 0]` (`LeftArmBase` + `LeftSleeveOverlay`)
  - `RightLeg` — pivot `[+0.11875, 0.75, 0]` (`RightLegBase` + `RightPantCuffOverlay`)
  - `LeftLeg` — pivot `[-0.11875, 0.75, 0]` (`LeftLegBase` + `LeftPantCuffOverlay`)

## Texture Atlas UV Map (`128×64`)

- **`x: 0..63, y: 0..63`** — Standard 64×64 Minecraft Steve skin layout:
  - Head (`0..31, 0..15`), Body Base (`16..39, 16..31`), Jacket Overlay (`16..39, 32..47`)
  - Right Arm Base (`40..55, 16..31`) & Sleeve Overlay (`40..55, 32..47`)
  - Left Arm Base (`32..47, 48..63`) & Sleeve Overlay (`48..63, 48..63`)
  - Right Leg Base (`0..15, 16..31`) & Cuff Overlay (`0..15, 32..47`)
  - Left Leg Base (`16..31, 48..63`) & Cuff Overlay (`0..15, 48..63`)
- **`x: 64..127, y: 0..63`** — Custom 3D Hat:
  - Crown Top (`64..73, 0..9`)
  - Crown Sides (`64..100, 12..15`)
  - Brim Top (`64..77, 20..33`) & Brim Underside (`80..93, 20..33`)
  - Brim Outer Rim (`64..77, 36..37`)
