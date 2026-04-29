# Changelog

All notable changes to this project will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
following [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-04-29
### Added
- AuthContext with AuthProvider and useAuth hook (context/auth-context.tsx)
- Root layout rewritten with auth-gated redirect logic and ActivityIndicator loading state
- Route group (auth): Stack navigator + login and register screens
- Route group (home): Tab navigator (Início, Explorar, Perfil) with Ionicons
- Profile screen shows authenticated user name and signOut button

### Removed
- app/index.tsx placeholder screen (routing now handled via Redirect in root layout)

## [0.1.0] - 2026-04-29
### Added
- Initial Expo project setup with expo-router
