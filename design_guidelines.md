# Bloom Gut Health App - Design Guidelines

## Design Approach

**Selected Approach**: Design System with Health/Wellness Focus

**Rationale**: Bloom is a utility-focused health application where trust, clarity, and efficient data entry are paramount. Drawing inspiration from Apple Health's clarity, Headspace's approachable wellness aesthetic, and Linear's clean data presentation, while establishing a unique gut health identity.

**Core Principles**:
- Scientific credibility through clean, data-driven design
- Approachable wellness aesthetic to reduce health anxiety
- Efficient mobile-first interactions for daily logging
- Clear visual hierarchy for complex microbiome data

---

## Color Palette

### Primary Colors
**Light Mode**:
- Primary Brand: 165 70% 50% (Teal-green representing growth/health)
- Primary Darker: 165 70% 40%
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 45%

**Dark Mode**:
- Primary Brand: 165 65% 55%
- Primary Darker: 165 70% 45%
- Background: 220 15% 10%
- Surface: 220 12% 14%
- Text Primary: 0 0% 95%
- Text Secondary: 220 5% 65%

### Functional Colors (Both Modes)
**Health Score Indicators**:
- Excellent (76-100): 142 70% 45% (Vibrant green)
- Good (51-75): 45 95% 50% (Warm amber)
- Needs Attention (0-50): 0 70% 50% (Alert red)

**Symptom Severity**:
- Low (1-3): 142 60% 50%
- Moderate (4-7): 45 90% 55%
- Severe (8-10): 0 65% 55%

### Accent Colors
- Info/Insight: 210 85% 55% (Bright blue for AI insights)
- Success: 142 70% 50%
- Warning: 45 95% 50%

---

## Typography

**Font Families**:
- Primary: 'Inter' (via Google Fonts) - Clean, highly readable for data
- Display: 'Poppins' (via Google Fonts) - Friendly, approachable for headers

**Type Scale**:
- Hero/Score Display: 3rem (48px), Poppins SemiBold
- Page Headers: 1.75rem (28px), Poppins SemiBold
- Section Headers: 1.25rem (20px), Poppins Medium
- Body Large: 1rem (16px), Inter Regular
- Body: 0.875rem (14px), Inter Regular
- Caption/Labels: 0.75rem (12px), Inter Medium
- Micro Text: 0.625rem (10px), Inter Medium

**Line Heights**:
- Headers: 1.2
- Body: 1.5
- Data/Numbers: 1.3

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (buttons, inputs): p-2, p-3, gap-2
- Component spacing: p-4, p-6, gap-4
- Section spacing: py-8, py-12
- Page padding: px-4, px-6 (mobile constraint)

**Mobile-First Constraints**:
- Container: max-w-md (448px), centered with mx-auto
- Content padding: px-4 (16px) for all pages
- Touch targets: Minimum h-12 (48px) for all interactive elements
- Bottom navigation: fixed, h-16 with safe-area-inset

**Grid System**:
- Dashboard stats: 2x2 grid with gap-3
- Food logs: Single column stack with gap-4
- Insights cards: Single column with gap-6

---

## Component Library

### Core Navigation
**Bottom Tab Bar** (Mobile Primary Navigation):
- Fixed bottom with backdrop blur
- 4 tabs: Dashboard, Log Meal, Insights, Profile
- Active state: Primary color with scale animation
- Icons: Heroicons (home, plus-circle, lightbulb, user-circle)

### Dashboard Components

**Gut Health Score Circle**:
- Large circular progress ring (stroke-width: 12)
- Animated arc from 0-360° based on score
- Score number centered: 3rem Poppins SemiBold
- Color dynamically matches health range
- Subtle glow/shadow effect for emphasis
- Beneath circle: Status text + trend arrow (↑↓) with 7-day change

**Quick Stats Cards** (2x2 Grid):
- Rounded containers (rounded-xl) with light shadow
- Icon + Large number + Label layout
- Gradient background hints of primary color
- Numbers: 1.5rem Poppins SemiBold
- Labels: 0.75rem Inter Medium
- Icons: Heroicons (fire for streak, exclamation-triangle for triggers, chart-bar for improvement, calendar for days)

**Action Button Cards**:
- Full-width cards with left icon + text + chevron-right
- Distinct background color per action
- "Log Today's Meals": Primary brand color
- "Upload Microbiome": Info blue
- "View Insights": Accent purple tint
- Pressed state: Scale 0.98 with darker shade

**Activity Feed**:
- Timeline-style with left accent bar
- Latest insight card with AI icon
- Recent symptom mini-chart (sparkline)
- Small date/time stamps: 0.625rem

### Food Logging Interface

**Meal Type Tabs**:
- Horizontal scrollable tabs
- Pills with rounded-full design
- Active: Primary color background, white text
- Inactive: Surface background, secondary text
- Icons preceding text (coffee, sun, moon, cookie)

**Input Components**:
- Text areas: rounded-lg, border with focus ring
- Time picker: Custom styled with clock icon
- Portion dropdown: Large touch-friendly options
- Photo upload: Dashed border square with camera icon

**Symptom Sliders**:
- Custom range inputs with gradient track
- Track color transitions: Green → Yellow → Red
- Large draggable thumb (h-6 w-6)
- Value display above thumb during drag
- Label + current value on left

**Symptom Cards** (Bloating, Energy, etc.):
- Individual cards with icon + label + slider
- Icon color matches current value range
- Smooth color transitions as slider moves

### Microbiome Upload

**Drag-Drop Zone**:
- Large dashed border area (rounded-xl)
- Upload cloud icon centered
- "Drag PDF/CSV or click to browse" text
- On drag-over: Primary color border with glow
- Progress bar appears inline on upload

**Manual Entry**:
- Collapsible section with chevron toggle
- Large monospace text area for data paste
- Format helper text with examples
- Validation indicators (checkmark/warning icons)

### Insights Display

**AI Insight Cards**:
- Gradient header with AI icon
- "Overall Assessment" in large type
- Expandable sections with chevron toggles
- Key findings with colored significance badges
- Bacterial data with horizontal bar charts (percentage visualization)

**Recommendation Lists**:
- Foods to emphasize: Green accent with plus icon
- Foods to limit: Red accent with minus icon
- Supplements: Blue info accent with pill icon
- Each item: Icon + Bold title + Description
- "Learn more" expandable details

**Charts & Visualizations**:
- Bacterial composition: Horizontal stacked bars
- Diversity scores: Radial gauge similar to gut score
- SCFA production: Three mini-circles (Butyrate, Propionate, Acetate)
- Trend lines: Smooth curves with gradient fills

### Forms & Inputs

**Text Inputs**:
- Height: h-12, rounded-lg
- Border: 2px, focus ring in primary color
- Placeholder: text-secondary
- Labels: 0.875rem above input with mb-2

**Buttons**:
- Primary: bg-primary, text-white, h-12, rounded-lg, shadow-sm
- Secondary: bg-surface, border-2, text-primary
- Icon buttons: Circular, h-10 w-10 for compact areas
- Pressed: Scale 0.95 transform

**Dropdowns/Select**:
- Match text input styling
- Chevron-down icon on right
- Options: Large touch targets, h-12 each

---

## Animations

**Principle**: Minimal, purposeful motion

**Allowed Animations**:
- Gut score circle: Animated arc draw-in over 1s on load
- Tab switches: 200ms slide transition
- Card expand/collapse: 300ms ease-out
- Button press: 100ms scale feedback
- Toast notifications: Slide-in from top

**Prohibited**: 
- Continuous looping animations
- Parallax scrolling
- Excessive micro-interactions

---

## Images

**Hero/Onboarding**:
- Login/Signup pages: Abstract microbiome visualization (microscopic bacteria aesthetic in brand colors, soft focused)
- Dashboard header: Optional subtle pattern background in primary tint

**Content Images**:
- Empty states: Friendly illustrations (gut-themed, minimalist line art)
- Bacterial profiles: Icon representations (not photos)
- Food logging: User-uploaded meal photos (rounded corners)

**Image Treatment**:
- All images: rounded-xl with subtle shadow
- Aspect ratio: 16:9 for meal photos
- Fallback: Gradient background with icon if no image

---

## Visual Hierarchy

**Information Density Management**:
- Critical data (Gut Score): Largest, centered, high contrast
- Primary actions: Above the fold, high color saturation
- Supporting data: Grouped in cards, secondary emphasis
- Detailed insights: Collapsible, revealed on demand

**Color Strategy**:
- Use color sparingly for meaning (health status, severity)
- Monochrome for most UI chrome
- Brand color for primary actions and navigation
- Never use color as only indicator (pair with icons/text)

---

## Accessibility Considerations

**Dark Mode**:
- Fully implemented across entire app
- Form inputs, text fields maintain consistent dark styling
- Sufficient contrast ratios (WCAG AA minimum)
- Toggle in profile settings

**Touch Targets**:
- Minimum 44x44px for all interactive elements
- Adequate spacing between adjacent buttons
- Bottom nav safe from screen gestures

**Visual Feedback**:
- Focus states for keyboard navigation
- Loading states for all async operations
- Success/error toast messages
- Disabled state clearly distinguishable

---

## Platform-Specific Considerations

**Mobile Safari/Chrome**:
- Account for bottom safe area on iPhone
- Fixed elements use safe-area-inset-bottom
- Prevent zoom on input focus (font-size ≥16px)
- Pull-to-refresh disabled on logged-in pages

**Progressive Web App**:
- App-like feel with no browser chrome
- Splash screen with Bloom logo + brand gradient
- Offline-ready messaging when network unavailable