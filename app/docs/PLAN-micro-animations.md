# PLAN-micro-animations.md

> **Goal**: Infuse the app with "AAA+" quality micro-animations using the standard React Native `Animated` API (to avoid binary crashes).

## 👥 Agent Assignments
| Agent | Role | Responsibilities |
|-------|------|------------------|
| `frontend-specialist` | Implementation | Create reusable animated components (`AnimatedPressable`, `FadeInView`) and integrate them. |
| `mobile-developer` | Integration | Apply animations to `Tabs`, `Feed`, and `Details`. |

## 📋 Task Breakdown

### Phase 1: Reusable Animation Primitives
- [ ] **Create `AnimatedScaleButton`**: A wrapper for TouchableOpacity that scales down slightly on press (tactile feel).
- [ ] **Create `StaggeredList` Wrapper**: A HOC or hook to animate list items sliding in one by one.

### Phase 2: Interactivity Enhancements
- [ ] **Tab Bar**: Animate the active tab icon (Scale Up + Color Burst).
- [ ] **Course Card**: Enhance the "Press" state (currently basic). Add a subtle shadow expansion.
- [ ] **Search Bar**: Animate width or opacity when focused.

### Phase 3: Screen Transitions & Loading
- [ ] **Feed Loading**: Replace simple spinner with a Skeleton Loader or Staggered Fade-In of cards.
- [ ] **Detail Screen**: Animate elements (Image -> Title -> Stats) appearing in sequence.

## 🛑 Constraints
- **NO `react-native-reanimated`**: Must use `Animated` from `react-native`.
- **Performance**: Use `useNativeDriver: true` wherever possible.
- **Subtlety**: Animations must be fast (100-300ms) and not block user interaction.
