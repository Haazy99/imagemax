# ImageMax - Design Guidelines

## 1. Brand Identity

### 1.1 Color Palette
- Primary: #2563EB (Blue)
- Secondary: #4F46E5 (Indigo)
- Accent: #10B981 (Emerald)
- Background: #FFFFFF (White)
- Text: #1F2937 (Gray 800)
- Error: #EF4444 (Red 500)
- Success: #10B981 (Green 500)

### 1.2 Typography
- Primary Font: Inter
- Secondary Font: Poppins
- Font Sizes:
  - Headings: 24px-48px
  - Body: 16px
  - Small Text: 14px

### 1.3 Logo
- Primary Logo: Full color version
- Secondary Logo: Monochrome version
- Icon: Square with rounded corners

## 2. UI Components

### 2.1 Navigation
- Height: 64px
- Background: White
- Border: 1px solid #E5E7EB
- Fixed position at top
- Logo on left
- Navigation items on right
- Mobile: Hamburger menu

### 2.2 Dashboard Layout
- Two-panel design:
  - Sidebar: 256px width, fixed position
  - Main Content: Flexible width, scrollable
- Sidebar Components:
  - Tool categories with icons
  - Collapsible sections
  - Active state indicators
  - Quick access to recent tools
- Main Content Area:
  - Tool interface
  - Preview panel
  - Controls panel

### 2.3 Authentication Dialog
- Position: Center of screen
- Size: 400px width
- Background: White
- Border Radius: 12px
- Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- Blur Overlay:
  - Background: rgba(255, 255, 255, 0.8)
  - Backdrop Filter: blur(8px)
- Components:
  - Close button (top-right)
  - Logo
  - Title
  - Sign Up button (primary)
  - Login button (secondary)
  - Social login options

### 2.4 Tool Interface
- Split view layout:
  - Left: Controls and settings
  - Right: Preview and results
- Upload Area:
  - Drag and drop zone
  - File input button
  - Preview thumbnail
- Tool Controls:
  - Sliders
  - Toggles
  - Color pickers
  - Preset buttons

### 2.5 Buttons
- Primary Button:
  - Background: Primary color
  - Text: White
  - Hover: Darker shade
  - Active: Pressed state
- Secondary Button:
  - Background: Transparent
  - Border: 1px solid primary
  - Text: Primary color
  - Hover: Light background
- Icon Button:
  - Circular
  - Icon centered
  - Hover: Light background

### 2.6 Cards
- Background: White
- Border: 1px solid #E5E7EB
- Border Radius: 8px
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Padding: 16px
- Hover: Slight elevation

### 2.7 Forms
- Input Fields:
  - Height: 40px
  - Border: 1px solid #E5E7EB
  - Border Radius: 6px
  - Focus: 2px solid primary
- Labels:
  - Above input
  - Required indicator
- Error States:
  - Red border
  - Error message below

## 3. Layout Guidelines

### 3.1 Spacing
- Base unit: 4px
- Common spacings:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
  - 2xl: 48px

### 3.2 Grid System
- 12-column grid
- Gutter: 24px
- Margins: 16px (mobile), 32px (desktop)
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### 3.3 Responsive Design
- Mobile First approach
- Fluid typography
- Flexible layouts
- Touch-friendly targets
- Collapsible navigation

## 4. Image Processing Interface

### 4.1 Upload Area
- Drag and drop zone
- File type indicators
- Size limits
- Progress indicator
- Preview thumbnail

### 4.2 Tool Controls
- Sliders with visual feedback
- Preset buttons
- Undo/Redo
- Reset button
- Apply button

### 4.3 Preview Panel
- Before/After toggle
- Zoom controls
- Pan controls
- Reset view
- Fullscreen mode

## 5. Animation Guidelines

### 5.1 Transitions
- Duration: 200ms
- Timing: ease-in-out
- Properties:
  - Opacity
  - Transform
  - Background color
  - Border color

### 5.2 Loading States
- Skeleton screens
- Progress indicators
- Spinners
- Pulse animations

### 5.3 Micro-interactions
- Button hover
- Input focus
- Tool selection
- Dialog open/close

## 6. Accessibility

### 6.1 Color Contrast
- Text: 4.5:1 ratio
- Large text: 3:1 ratio
- Interactive elements: 3:1 ratio

### 6.2 Keyboard Navigation
- Focus indicators
- Tab order
- Skip links
- ARIA labels

### 6.3 Screen Readers
- Alt text
- ARIA roles
- Live regions
- Error announcements

## 7. Dark Mode

### 7.1 Color Palette
- Background: #111827
- Surface: #1F2937
- Text: #F9FAFB
- Border: #374151
- Primary: #60A5FA
- Secondary: #818CF8

### 7.2 Component Styles
- Adjusted shadows
- Modified borders
- Updated hover states
- Preserved contrast

### 7.3 Images
- Maintained quality
- Adjusted brightness
- Preserved transparency 