

# React (Chakra UI)

# React + Chakra UI .cursorrules

## Color Palette
- Primary Color: `#062A1F` (Deep Teal)
- Secondary Color: `#BADAD3` (Soft Aqua)
- Accent Color: `#D6C34E` (Mustard Yellow)
- Background Color: `#FDF5E6` (Light Cream)
- Text Color: `#000000` (Black)
- Error Color: `#B00020` (Standard Error Red)
- Success Color: `#2E7D32` (Standard Success Green)
- Warning Color: `#F9A825` (Standard Warning Amber)
- Info Color: `#0288D1` (Standard Info Blue)
- Link Color: `#062A1F` (Deep Teal)
- Disabled Color: `#A8A8A8` (Light Gray)
- Border Color: `#E0E0E0` (Very Light Gray)
- Shadow Color: `#A8A8A8` (Light Gray)
- Hover Color: `#044336` (Darker Teal)
- Active Color: `#041F18` (Darkest Teal)
- Focus Color: `#062A1F` (Deep Teal)
- Placeholder Color: `#A8A8A8` (Light Gray)
- Selected Color: `#062A1F` (Deep Teal)
- Highlight Color: `#D6C34E` (Mustard Yellow)
- Divider Color: `#E0E0E0` (Very Light Gray)
- Loading Color: `#062A1F` (Deep Teal)
- Success Background Color: `#E8F5E9` (Light Success Green)
- Error Background Color: `#FFEBEE` (Light Error Red)
- Warning Background Color: `#FFF8E1` (Light Warning Amber)
- Info Background Color: `#E1F5FE` (Light Info Blue)
- Disabled Background Color: `#F5F5F5` (Very Light Gray)
- Selected Background Color: `#BADAD3` (Soft Aqua)
- Highlight Background Color: `#FFF9C4` (Light Mustard Yellow)
- Divider Background Color: `#E0E0E0` (Very Light Gray)
- Loading Background Color: `#FDF5E6` (Light Cream)


## Project Background
This project is a React application that leverages Chakra UI for building a consistent, accessible, and responsive user interface. The application follows best practices for modern frontend development, including the use of functional components, TypeScript for type safety, and Chakra UI's built-in features for theming, accessibility, and performance optimization.

## Coding Standards
- Use functional components with api to ensure a modern and maintainable codebase.
- Variable declarations should prioritize `const` over `let`.
- Variable and function names should use `camelCase`, while component names should use `PascalCase`.

## Preferred Libraries
- **Chakra UI**: For building consistent and accessible UI components.
- **TypeScript**: For type safety and improved developer experience.
- **React**: As the core library for building the user interface.

## File Structure
```
src/
  components/  # Reusable UI components
  containers/  # Container components that manage state and logic
  pages/       # Application pages
  api/         # API service layer
  providers/  # Context providers for state management
```

## Performance Optimization Guide
- Use `React.memo` on pure function components to prevent unnecessary re-renders.
- Implement lazy loading for routing components to improve initial load performance.
- Optimize `useEffect` dependencies to prevent unnecessary side effects.

## Testing Requirements
- Write unit tests using **Jest** and **React Testing Library**.
- Ensure test coverage reaches at least 80%.
- Use snapshot testing for UI components to detect unintended changes.

## Documentation Specifications
- Write comments for functions and components in **JSDoc** format.
- Components must include **PropTypes** validation.
- Each main directory must contain a `README.md` file.
- Provide both **English** and **Chinese** versions of the `README.md` file.

## Error Handling
- Use `try/catch` blocks to handle asynchronous operations.
- Implement a global error boundary component to catch runtime errors.

## Additional Instructions
1. Use **TypeScript** for type safety with Chakra UI components.
2. Implement proper component composition using Chakra UI.
3. Utilize Chakra UI's built-in accessibility features.
4. Use the `as` prop for semantic HTML rendering.
5. Implement dark mode using Chakra UI's color mode.
6. Use Chakra UI's layout components for responsive design.
7. Follow Chakra UI best practices for performance optimization.

## Chakra UI Best Practices
- Use `ChakraProvider` at the root of your app.
- Utilize Chakra UI components for consistent design.
- Implement a custom theme for brand-specific styling.
- Use responsive styles with the Chakra UI breakpoint system.
- Leverage Chakra UI hooks for enhanced functionality.

