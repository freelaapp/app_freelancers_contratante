---
name: Freela UI Component Inventory
description: Available reusable UI components in src/presentation/components/ui/ with their props and usage patterns
type: project
---

All components live in `src/presentation/components/ui/`. Always check this list before creating anything inline.

## InputField
Props: label, placeholder, value, onChangeText, icon (Ionicons key), secureTextEntry?, showToggle?, keyboardType?, autoCapitalize?, autoCorrect?, onSubmitEditing?, returnKeyType?, blurOnSubmit?, editable?, error?, rightElement?
- Uses forwardRef for focus chaining
- Renders label above, icon on left, optional eye toggle on right
- Shows red border + error text below when error prop is set
- Height 52dp, border 1.5dp, radius 12dp, bg #F9FAFB

## PrimaryButton
Props: label, onPress, loading?, disabled?, variant? ('primary' | 'soft')
- primary: amber #F5A623 background, dark text
- soft: #FFF3DC background, secondary text (#687076)
- Shows ActivityIndicator when loading
- Height 52dp, radius 12dp, marginTop 4dp (own style)

## SocialButton
Props: icon, iconColor, labelColor?, backgroundColor, borderColor?, label?, fullWidth?, onPress, loading?, disabled?
- fullWidth=false: 60x60dp square icon button
- fullWidth=true: 52dp tall, full width, 3-column layout (28dp icon slot | flex label | 28dp spacer)

## SocialAuthButtons
Props: onGooglePress, onApplePress, googleLoading?, appleLoading?, disabled?
- Renders Google (always) + Apple (iOS only) as fullWidth SocialButtons
- Gap 12dp between buttons
- Apple button only shown on iOS (Platform.OS === 'ios' guard)

## AuthHeader
Props: title?, subtitle?, logoSize?, containerStyle?, subtitleStyle?, footer?
- Amber background section at top of auth screens
- Decorative circles (3): large top-left, medium bottom-right, small top-right
- Logo image from assets/img/LogoFreela.png
- paddingTop 52dp iOS / 32dp Android

## Divider
Props: label?
- Full-width horizontal line with optional centered label
- Line color #E5E7EB, 1dp height
- Label: captionSmall (13/400), color #687076

## LoadingOverlay
Props: visible, message?
- Full-screen overlay shown during async operations
- Use instead of inline ActivityIndicator for form submissions

## Other available components
- AppHeader, Card, ComingSoonScreen, DecorativeCircle, EmptyState, FormSection
- OnboardingHeader, OnboardingScrollView, OpportunityCard
- SectionHeader, StatCard, ActiveOpportunitiesCard, SplashScreen

**Why:** Prevents duplication and keeps the design system consistent.
**How to apply:** Always check this inventory first. If a needed component doesn't exist, create it in ui/ as a reusable component, not inline.
