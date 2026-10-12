# Kursat Shop — Automotive E-Commerce UI/UX & Frontend Implementation Brief

> Kaynak: Proje sahibinin ilk talebi (2026-10-12), içerik korunarak derlendi. Tasarım kararları ve bu briefe yapılan
> netleştirmeler için bkz. `docs/superpowers/specs/2026-10-12-kursat-shop-design.md`.

## 1. Project Overview
Build a complete, polished and functional frontend prototype for Kursat Shop, a Turkish automotive parts e-commerce store.
This is a single-vendor online store, not a marketplace. The initial target audience is individual customers in Türkiye.
The project must include two connected areas:

1. A customer-facing e-commerce storefront.
2. A practical administration panel for managing the product catalog and basic store data.

The primary goal is to deliver a realistic, clean, visually refined and easy-to-use product. Do not overengineer the first version. Prioritize usability, coherent visual design, functional interactions and maintainable code over feature quantity.
Use AUTODOC as a reference for catalog discovery and vehicle-based navigation, and ECS Tuning as a reference for technical product information and usability. Do not copy their layouts directly. Create a more contemporary, restrained and visually consistent design.

## 2. Technology Stack
- Next.js with App Router.
- TypeScript with strict typing.
- Tailwind CSS.
- React components with clear responsibilities.
- Lucide icons or another consistent lightweight icon library.
- Local mock data and a centralized data-access layer.
- Browser storage only where appropriate for prototype persistence.

Use current stable versions that are compatible with each other. Configure the project correctly rather than mixing incompatible dependencies.
Do not introduce Redux, a backend framework, a database, a CMS or a large UI component library unless a concrete requirement justifies it.
Keep dependencies minimal. Prefer reusable, accessible components and native browser capabilities where appropriate.

## 3. Brand and Visual Direction
Brand name: Kursat Shop. Market: Türkiye. Language: Turkish. Currency: TRY, displayed using the Turkish locale.
Design direction: premium, neutral, minimal, technical and trustworthy.

### Color system
- Primary background: white.
- Secondary background: very light neutral gray.
- Main text: dark charcoal.
- Secondary text: muted gray.
- Borders: subtle light gray.
- Primary actions: charcoal or near-black.
- Success indicators: restrained green.
- Error indicators: restrained red.

Avoid excessive accent colors, strong gradients, oversized shadows, glassmorphism, unnecessary decorative elements and generic AI-generated landing-page aesthetics.
Define colors, spacing, typography, border radii and other recurring design values through reusable theme tokens or CSS variables.

### Typography and layout
Use Inter or a comparable modern sans-serif typeface.
Establish a clear hierarchy for page titles, section titles, product names, prices, technical metadata and helper text.
Use a consistent content container, spacing scale and responsive grid. Avoid both cramped layouts and excessively large empty spaces.
The interface should look like a real specialist automotive retailer rather than a generic SaaS dashboard.

### Product presentation
Product cards should be compact, informative and consistent. Include: product image, product name, brand, SKU and/or OEM reference when available, price in TRY, stock status, add-to-cart action.
Use consistent image ratios and object-fit behavior. Prevent image distortion. Provide sensible fallbacks for missing product images.
Do not use random image URLs or misleading product imagery. Use available local assets or reliable placeholder assets and make it straightforward to replace them with real catalog images.

### Responsive design
Support mobile, tablet and desktop layouts.
Desktop navigation should make product discovery fast. Mobile navigation should prioritize search, vehicle selection, account access and the cart.
Product grids, filter panels, tables, forms, dialogs and navigation must adapt to narrow screens. Avoid horizontal overflow.

## 4. Project Scope

### Customer storefront routes
- `/` — Home page.
- `/products` — All products.
- `/categories/[slug]` — Category and subcategory listing.
- `/search` — Search results.
- `/products/[slug]` — Product detail.
- `/garage` — Vehicle selection and saved vehicles.
- `/cart` — Shopping cart.
- `/favorites` — Favorite products.
- `/checkout` — Simulated checkout.
- `/order-success` — Simulated order confirmation.
- `/help` — Help and contact information.
- `/shipping-returns` — Shipping and returns information.
- `/legal` — Privacy and legal information.
- A custom not-found page.

Use shared layouts and components. Avoid duplicating the header, footer, product cards and other recurring interface elements.

### Administration panel routes
- `/admin/login` — Demo login screen.
- `/admin` — Dashboard.
- `/admin/products` — Product list and management.
- `/admin/products/new` — Create a product.
- `/admin/products/[id]/edit` — Edit a product.
- `/admin/categories` — Category management.
- `/admin/brands` — Brand management.
- `/admin/vehicles` — Vehicle catalog management.
- `/admin/compatibility` — Product-to-vehicle compatibility management.
- `/admin/orders` — Demo order listing and details.
- `/admin/settings` — Basic store settings.

The admin panel may have a denser, more operational layout than the storefront, but both areas must share the same underlying design principles and visual identity.
Do not build a separate stock-management module. Stock is managed through the product list and product form.

## 5. Storefront User Experience

### Global header
Responsive header containing: Kursat Shop logo or a simple text-based brand mark; prominent product search; vehicle selection entry point; account entry point; favorites; cart with item count. Keep navigation clear and compact. Avoid excessive menu levels.

### Home page
1. Main header and navigation.
2. A concise hero section explaining that customers can find automotive parts for their vehicles.
3. A prominent search input supporting product names, SKU and OEM references.
4. A vehicle-selection entry point.
5. A small, well-organized category section.
6. A curated featured-products section.
7. A simple trust/information strip for store policies and support.
8. A consistent footer with useful links.

Do not fill the home page with many marketing sections, carousels, animated banners or invented promotions.

### Vehicle selection
Guided vehicle selector supporting: make, model, generation or body/chassis, production year, engine or technical variant.
Options must depend on previous selections when the mock data supports that relationship. Use a clear step-by-step interface. Show the current selection and allow the user to change it. Allow a selected vehicle to be saved to the user's garage.
Only show vehicle combinations that exist in the demo dataset. Do not imply that the prototype contains a complete automotive database.
If compatibility data is missing, show an explicit unknown/unverified state rather than claiming that a part fits.

### Search
Search available mock products by product name, brand, SKU, OEM reference. Provide a clear empty state. If practical, include lightweight autocomplete using the same local dataset; suggestions must navigate to relevant products or search results. Do not add a search service or external API.

### Product catalog and categories
Reusable product-listing experience with: breadcrumbs; page title and product count; responsive product grid; category navigation where relevant; sort control; filters for category, brand, price and stock status; active filter indicators; clear-all-filters action; empty and loading states.
Filtering and sorting must operate on the actual local product data. On mobile, use an accessible filter drawer or dialog.

### Product details
Image gallery or primary image with thumbnails; name and brand; SKU; OEM references; price; stock availability; quantity selector; add-to-cart; technical specifications; description; compatibility information; breadcrumbs; related products.
Clear information hierarchy. Never fabricate technical specifications, certifications, customer ratings, warranties or compatibility claims. When sample information is used, it must be clearly understood as demo data.

### Cart and checkout
Cart supports adding, updating quantities, removing, item subtotals and totals, handling unavailable or insufficient-stock products, navigating back to the catalog. Consistent TRY formatter.
Checkout is a simulation only: customer/contact details, delivery address, shipping summary and order review. Do not collect or process real payment-card information. The confirmation page must clearly represent a demo order, stored in the prototype's local data layer, with a generated confirmation identifier.

### Favorites and garage
Favorites: add and remove products. Garage: save, select and remove demo vehicles. Persist via browser storage. Useful empty states with links to relevant actions.

## 6. Admin Panel UX

### Dashboard
Summary cards: total products, published products, low-stock products, out-of-stock products, total categories and brands, demo order count. A concise list of recent demo orders or low-stock products. No elaborate analytics; do not pretend demo figures are real.

### Product management
List: search by name, SKU or OEM; filter by category, brand, publication status and stock status; sorting; view and edit; delete with confirmation; navigate to creation; empty states.
Form: name and slug; description; SKU; one or more OEM references; brand; category; selling price; optional comparison price; stock quantity; publication status; images or image references; technical specifications; compatibility records where available.
Sensible validation with readable errors. Logical sections. Explicit confirmation for destructive operations. After saving, show feedback and update list and storefront state.

### Categories and brands
Basic create, edit and delete. Do not allow a category or brand to be deleted silently if products still depend on it. Keep hierarchy simple.

### Vehicle and compatibility management
Structured demo vehicle records. Create/edit vehicles and manage product-to-vehicle relationships. Explicit states: confirmed fitment; unverified; incompatible (only with an explicit record). Do not infer confirmed compatibility from similar names, engine capacity or model years.

### Orders
Order reference, date, total and status. View details and change demo order status. Simulated records only.

### Settings
Store name, contact details and simple store preferences only. No permission system.

### Admin access disclaimer
The demo login is for navigation and presentation only. Do not represent client-side checks or browser-stored flags as secure authentication. Document that real authentication and authorization must be implemented before production.

## 7. Data Model
Types for at least: `Product`, `ProductImage`, `ProductVariant` (only where genuinely required), `Category`, `Brand`, `Vehicle`, `CompatibilityRecord`, `Cart`, `CartItem`, `Favorite`, `Address`, `Order`, `OrderItem`, `StoreSettings`.

Product: unique ID; slug; name and description; SKU; OEM reference list; brand ID; category ID; numeric price; optional comparison price; stock quantity; publication status; images; technical specifications; compatibility record references where appropriate. Do not use SKU and OEM interchangeably. No unnecessary duplication of stock/pricing. Model variants only when genuinely distinct.

Vehicles: make, model, generation/body, production-year range, engine/technical variant. Compatibility records reference product and vehicle explicitly. Missing record = unknown.

Orders: items preserve product name, SKU, quantity and unit price at order time. Price changes must not alter historical totals.

Mock data: multiple categories and subcategories; several brands; varied products across part types; multiple vehicles; mix of confirmed and unknown compatibility; different stock states; a small set of demo orders. Centralized and internally consistent.

## 8. State Management and Persistence
No complex state management. React state and context where appropriate. Clear separation between mock data, data access functions, UI components, business rules/validation, and client-side persistence.
localStorage for cart, favorites, saved vehicles. If admin changes persist after refresh, implement a simple local persistence adapter with clear initialization and error handling.
Keep SSR output and hydration consistent; no browser APIs during server rendering.
Explain that browser-local changes are not shared across users/devices and are not a database replacement. Do not claim secure storage or production readiness.

## 9. Component Architecture
Suggested: StoreHeader, StoreFooter, SearchInput, VehicleSelector, Breadcrumbs, ProductCard, ProductGrid, ProductFilters, SortControl, StockStatus, PriceDisplay, QuantitySelector, AddToCartButton, EmptyState, LoadingState, ConfirmationDialog, AdminSidebar, AdminHeader, DataTable, FormField, PageHeader, SummaryCard. Names are suggestions. Avoid over-abstraction. Separate storefront and admin layouts while sharing tokens and utilities.

## 10. Accessibility and Interaction Quality
Semantic HTML; keyboard-accessible controls; visible focus; proper labels; accessible dialogs and drawers; sufficient contrast; useful alt text; clear validation; no horizontal overflow.
Every visible interactive element must perform its advertised action — no dead buttons, nonfunctional filters, fake submissions or dead links. Feedback after add-to-cart, save, update, delete. Handle empty results, missing images, invalid input and unavailable products gracefully.

## 11. Explicitly Out of Scope
Real backend/database; real payments; production auth; live supplier integrations; third-party fitment databases; automatic OEM cross-reference; multi-warehouse inventory; dealer/wholesale pricing; marketplace; CSV/Excel import; reviews and ratings; advanced promotions/coupons; advanced analytics; real shipping integration; real-time delivery estimates; complex CRM. Structure code so future integration is possible.

## 12. Implementation Plan
1. Foundation: Next.js app, TypeScript, Tailwind, design tokens, routes/layouts, shared components, types and mock data.
2. Storefront: header/footer/nav, home, catalog and categories, search/sort/filter, product detail, vehicle selection and garage, cart and favorites.
3. Admin: layout and demo login, dashboard, product CRUD, categories and brands, vehicles and compatibility, orders and settings.
4. Checkout and persistence: simulated checkout and confirmation, browser persistence, consistent data between storefront and admin, price/quantity/stock behavior.
5. QA: all routes, primary journeys, forms/filters/search/CRUD, persistence after refresh, mobile/tablet/desktop, console/hydration errors, loading/empty/validation/error states.

## 13. Acceptance Criteria
Storefront:
1. Home renders correctly on mobile and desktop.
2. Search returns relevant products by name, SKU and OEM.
3. Category navigation works.
4. Filters and sorting change displayed results.
5. Product cards link to correct detail pages.
6. Product details show price, stock and technical info.
7. Vehicle selection follows valid dataset options.
8. Unknown compatibility is never shown as confirmed.
9. Cart add / update quantity / remove work.
10. Cart totals update correctly.
11. Favorites and saved vehicles work.
12. Required state persists after refresh.
13. Demo checkout completes without real card data.

Admin:
14. Admin routes render with consistent layout.
15. Product creation validates required fields.
16. Products can be edited and deleted with confirmation.
17. Product changes appear in storefront data.
18. Categories and brands support basic management.
19. Vehicles and compatibility can be managed.
20. Admin product search, filters and stock indicators work.
21. Demo orders viewable without implying real processing.
22. All actions show feedback.

Engineering and design:
23. No TypeScript errors.
24. No broken internal links or dead primary actions.
25. Consistent typography, spacing, color, component behavior.
26. Responsive on mobile, tablet, desktop.
27. No avoidable hydration or runtime errors.
28. Organized, readable, documented code.
29. README with setup and run instructions.
30. Demo-only limitations documented.

## 14. Delivery Requirements
Runnable Next.js app; all routes; shared design system and components; typed mock data; functional core interactions; clear structure; README with install/run commands; concise list of features and known limitations.
Before declaring completion, run lint, type-check and build, and fix errors. If a feature cannot be implemented, explain and provide the closest honest working alternative.
