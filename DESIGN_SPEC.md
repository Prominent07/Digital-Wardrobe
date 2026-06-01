# My Closet - Design System & Wireframes

## 🎨 Creative Direction
**Aesthetic**: Pinterest meets Digital Wardrobe. Feminine, minimal, airy, and intentional.
**Vibe**: Calming, organized, highly visual, elevated basic.

---

## 📐 Design Tokens (Figma Global Styles)

### Colors
**Surfaces & Backgrounds**
- `bg-base` (Pastel Sand): `#fbf9f6` - The main app background. Warm, off-white. 
- `bg-card` (White): `#ffffff` - Used for item cards and containers to make them pop.
- `bg-accent-1` (Pastel Rose): `#f4ebe8` - Used for active states, highlights, and empty slots.
- `bg-accent-2` (Pastel Blush): `#fdf8f6` - Used for subtle banners or hovered items.

**Text & Ink**
- `text-primary` (Ink Dark): `#2a2523` - Main headings and high-contrast text. 
- `text-secondary` (Ink Muted): `#5c534f` - Descriptions, metadata, and inactive states.

**Borders & Lines**
- `border-soft` (Pastel Taupe): `#e2d5d0` - Very gentle borders for cards (often 30-50% opacity).

### Typography
**Headings (Playfair Display)**
- H1: 36px / 48px Desktop, Medium weight.
- H2: 24px Desktop / 20px Mobile, Medium weight. (Often paired with an italicized first word or icon).

**Body/UI (Inter)**
- Body UI: 14px, Regular, 150% line-height.
- Metadata/Labels: 10px-12px, Medium/Semi-bold, Uppercase, tracking-wider (letter-spacing 0.5px).

### Spacing & Components
- **Card Radius**: `24px` for main panels, `16px` for clothing item thumbnails.
- **Buttons**: Pill-shaped (rounded-full). Padding: `12px 24px`.
- **Shadows**: Soft, diffused shadows on hover (`shadow-sm`), zero harsh drop shadows.
- **Grids**: 4px/8px standard layout grid. Card gaps are `16px` (Mobile) and `24px` (Desktop).

---

## 📱 Wireframes by Page

### 1. Global Navigation (App Shell)
* **Desktop View**: Sticky left-side navigation rail (256px width).
  - Top: Monogram logo (Italic 'M' in a soft circle) + "My Closet" (Serif).
  - Links: Icon + Label, resting flat, highlighting with `bg-white` and bold text on active.
* **Mobile View**: Bottom floating navigation bar or top hamburger menu keeping the screen focused wholly on the content.

### 2. Dashboard (`/`)
* **Layout**: Stacked card-based layout.
* **Header**: "Welcome back, [Name]" (Serif) + subtitle.
* **Hero Card (Today's Outfit)**:
  - Takes up 2/3 of desktop width, full width on mobile.
  - Background: Edge-to-edge white with subtle texture/sparkle icon absolute positioned.
  - Contents: Pill label "TODAY'S OUTFIT", overlapping circle thumbnails of clothing items (avatar group style).
* **Stats Card**: 1/3 desktop width. List of basic stats (counts, most worn color) with subtle divider lines.
* **Recently Added**: A horizontal scrolling row (Pinterest-style) of 3:4 aspect ratio item cards.

### 3. My Closet (`/closet`)
* **Layout**: Fluid Pinterest-style masonry/grid.
* **Controls**: 
  - Mobile: Horizontal scrolling row of filter pills (All, Top, Bottom, etc). Search bar below.
  - Desktop: Left aligned search bar, right aligned category pills.
* **Card Component**: 
  - Image: 3:4 aspect ratio, rounded-2xl. `object-cover`. Soft hover scale (1.05x).
  - Overlay: Appears only on hover (Edit/Delete icons).
  - Data: Brand name (10px uppercase, tracking wide), Category name (14px font-medium), Color swatch circle (12px, rounded-full, bordered).
* **Grid**: 2 columns (Mobile) → 3 columns (Tablet) → 4 columns (Desktop).

### 4. Outfit Builder (`/builder`)
* **Desktop View (Split View)**:
  - Left Panel (60%): Wardrobe gallery. Top row of category tabs. Grid of selectable items.
  - Right Panel (40%): Sticky "Preview" Mannequin. 
* **Mobile View (Stacked)**:
  - Sticky at top: A visual summary of selected items (or a bottom sheet that pulls up).
  - Scrollable content: The wardrobe picker.
* **Mannequin Interface**: 
  - Vertical list of "slots" (Top, Bottom, Footwear).
  - Empty Slot State: Dashed border, 40% opacity, placeholder icon.
  - Filled Slot State: Solid white card, thumbnail on left, item details right, "X" remove button.
* **Action Area**: Solid `bg-white` bottom floating panel with "Outfit Name" input and "Save Outfit" primary button.

### 5. Outfit Calendar (`/calendar`)
* **Layout**: Calendar + Details Sidebar.
* **Calendar Grid**:
  - Full width on mobile, 2/3 width on desktop. 
  - Clean white cards with `border-pastel-taupe`.
  - Number centered top. If an outfit is planned, a full-bleed or centered 3:4 thumbnail sits inside the day cell.
* **Details Sidebar**:
  - Selected date title (Serif).
  - Planned outfit card (similar to Dashboard hero). 
  - Or, if empty, a dashed box to "Assign Saved Outfit", revealing a scrollable list of pre-saved outfits.

### 6. AI Stylist (`/aistylist`)
* **Layout**: Split input/output view, heavily leaning on whitespace.
* **Left Sidebar (Preferences)**:
  - Pure white card heavily rounded (`rounded-[2rem]`).
  - Dropdowns for Weather, Occasion styled with pill-like inputs.
  - Big bold black CTA button: "✨ Get Recommendation".
* **Right Area (Results)**:
  - Background is a soft `pastel-rose/20` holding area.
  - Loading State: Elegant turning dashed rings, not a standard spinner.
  - Result: "Stylist Note" card (white, crisp text) followed by a 2 or 3 column grid of the chosen top/bottom/shoes.

### 7. Upload Item (`/upload`)
* **Layout**: Two-column data entry flow.
* **Left Image Area**: 
  - Large drag-and-drop zone. 
  - 3:4 aspect ratio. Dashed borders transitioning to solid white with image preview upon upload.
* **Right Details Area**: 
  - Clean input forms. Dropdowns have soft background colors instead of harsh borders.
  - Primary "Save to Closet" button anchored at the bottom.
