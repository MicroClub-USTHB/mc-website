# Graph Report - mc-website  (2026-11-06)

## Corpus Check
- 464 files · ~202,603 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 4, .example 1, .css 1)

## Summary
- 1859 nodes · 4841 edges · 93 communities (87 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.85)
- Token cost: 77,029 input · 0 output

## Community Hubs (Navigation)
- Admin Auth Pages
- Landing Page Composition
- Review Validation Schemas
- Department Art Generator
- Hero Stickers
- Lint and Dev Tooling
- Registration Mongoose Model
- Admin Dialogs and Icons
- User Actions Menu
- Registration Field Styles
- Site Menu Bar
- Hero Playground Assets
- Featured Events Active State
- Registration Store and Schema
- Project Docs and Conventions
- Runtime Dependencies
- Hero Sticky Note
- Next Config and Admin Layout
- Department Art Route
- Registration Detail Page
- Admin Data Tables
- Animated Icons
- Registrations List Page
- Event Chain Viewport
- Feedback Modals
- Student ID Upload Actions
- Trusted By Partners
- Better Auth Core
- Seed Scripts
- Club Section Icons
- shadcn Components Config
- CI Workflow
- Registrations Window Button
- Email Templates
- Hero Activities and Wins
- Club Sections Showcase
- Birth Date Field
- Registration Flow Steps
- Contact Form
- Registration Context Provider
- Status Badge and List Params
- Community Activity Cursor
- Footer Tile Physics
- Box Physics Core
- Recommendations Page
- Multi Select Filter
- Playground Drag Physics
- MicroBot Widget
- Statistics Counters
- TypeScript Config
- Root Layout and Scroll
- HR User Management
- Hero Headline
- Hero Robotics
- About Photo Spiral
- Hero Playground Board
- Docker Compose MongoDB
- MicroBot API
- Hero Canvas Navigator
- MicroBot Face
- Package Scripts
- Translate DOM Guard
- Not Found Page
- Footer Falling Tiles
- Permissions and Session
- Hero AR Card
- List Pagination
- Footer Brand Icons
- Featured Projects
- Hero Level Up
- Hero Photobooth
- President CLI Scripts
- Chain Slice Animations
- Hero Todo List
- McCard Component
- MongoDB Client and Rate Limit
- Review Server Actions
- Registrations Route and Sitemap
- Site Layout and MicroBot
- McCheckbox Component
- Hero Voice Note
- Event Card Dialog
- Prettier Config
- MicroBot Answer Parser
- Registration Feature Docs
- Error Fallback Boundaries
- Menu Backdrop Detection
- pnpm Workspace
- Unsaved Changes Guard
- Section Stack Layout
- Easing and Motion Docs
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `react` - 93 edges
2. `McButton()` - 76 edges
3. `next` - 70 edges
4. `lucide-react` - 42 edges
5. `motion` - 38 edges
6. `startPile()` - 31 edges
7. `requireStaff()` - 27 edges
8. `startPlayground()` - 25 edges
9. `RecommendDialog()` - 23 edges
10. `McInput()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `getMongoClient()`  [EXTRACTED]
  scripts/run.ts → src/lib/mongodb.ts
- `Open Graph image alt text (Micro Club logo among club-life cards)` --conceptually_related_to--> `microclub.info (site being replaced)`  [INFERRED]
  src/app/opengraph-image.alt.txt → README.md
- `ChangePasswordForm()` --indirect_call--> `changePassword()`  [INFERRED]
  src/components/admin/change-password-form.tsx → src/actions/admin/change-password.ts
- `RegistrationProvider()` --indirect_call--> `createRegistrationStore()`  [INFERRED]
  src/components/registrations/state/registration-context.tsx → src/components/registrations/state/registration-store.ts
- `parseRecommendationParams()` --indirect_call--> `isRecommendationTarget()`  [INFERRED]
  src/lib/registrations/recommendation-params.ts → src/lib/registrations/recommendations.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Registration submission pipeline (window, form, signed upload, rate limit)** — agents_registrations_window, agents_registration_flow, agents_student_id_upload, agents_rate_limiting, agents_thin_server_actions [INFERRED 0.85]
- **HR review workflow (roles, guarded list, timeline, recommendations)** — agents_staff_roles, agents_requirestaff_guard, agents_url_driven_registrations_list, agents_review_timeline, readme_recommendations [INFERRED 0.85]
- **Visual design conventions (tokens, theming, width, easings)** — agents_mcoli_ui_tokens, agents_single_theme_dark_sections, agents_max_width_site, agents_easing_tokens, readme_design_system [INFERRED 0.85]

## Communities (93 total, 6 thin omitted)

### Community 0 - "Admin Auth Pages"
Cohesion: 0.09
Nodes (35): ChangePasswordPage(), metadata, ForgotPasswordPage(), metadata, metadata, ResetPasswordPage(), metadata, SignInPage() (+27 more)

### Community 1 - "Landing Page Composition"
Cohesion: 0.12
Nodes (35): HomePage(), metadata, revalidate, SITE_JSON_LD, ClubSectionDetails(), DepartmentCard(), HeroItems(), FOOTER_JSON_LD (+27 more)

### Community 2 - "Review Validation Schemas"
Cohesion: 0.10
Nodes (34): zod, FAILED, INVALID, registrationIdSchema, isRecommendationTarget(), RecommendationInput, recommendationSchema, REVIEW_TEXT_MAX_LENGTH (+26 more)

### Community 3 - "Department Art Generator"
Cohesion: 0.10
Nodes (40): apply(), applyThemeTokens(), area(), artShapes(), barTransform(), bounds(), boxArea(), boxMatrix() (+32 more)

### Community 4 - "Hero Stickers"
Cohesion: 0.07
Nodes (31): fromCenter(), getCanHover(), GLASSES_COFFEE, MICROBOT, MicroBotTooltip(), Stickers(), subscribeToHover(), TEXT_STICKERS (+23 more)

### Community 5 - "Lint and Dev Tooling"
Cohesion: 0.08
Nodes (34): eslintConfig, devDependencies, babel-plugin-react-compiler@1.0.0, eslint@^9, eslint-config-next@16.4.2, prettier@^3.9.9, prettier-plugin-tailwindcss@^0.8.1, svgo@^4.1.0 (+26 more)

### Community 6 - "Registration Mongoose Model"
Cohesion: 0.10
Nodes (32): mongoose@^9.11.2, mongoose, DECISIONS, connectToDatabase(), recommendation, registrationDocument, RegistrationDocument, RegistrationModel (+24 more)

### Community 7 - "Admin Dialogs and Icons"
Cohesion: 0.20
Nodes (24): lucide-react, react, CreateUserDialog(), Errors, RecommendDialog(), TARGET_ITEMS, ACTIONS, ReviewActions() (+16 more)

### Community 8 - "User Actions Menu"
Cohesion: 0.10
Nodes (22): ActionConfig, ActionId, ACTIONS, RESULT_TITLE, UserActionsMenu(), McAlertDialog(), McAlertDialogAction(), McAlertDialogCancel() (+14 more)

### Community 9 - "Registration Field Styles"
Cohesion: 0.11
Nodes (25): FIELD_LABEL_CLASS, INPUT_FIELD_CLASS, TEXTAREA_FIELD_CLASS, PhoneField(), RegistrationInput(), RegistrationInputProps, RegistrationTextarea(), RegistrationTextareaProps (+17 more)

### Community 10 - "Site Menu Bar"
Cohesion: 0.14
Nodes (24): RegistrationsLayout(), SiteMenu(), BAR, LOGO_CELL, MenuBar(), MenuWordmark(), CLOSE_TRANSITION, MenuContext (+16 more)

### Community 11 - "Hero Playground Assets"
Cohesion: 0.06
Nodes (3): Illustrated(), Logo(), Vector()

### Community 12 - "Featured Events Active State"
Cohesion: 0.12
Nodes (23): ActiveEvent, ActiveEventContext, ActiveEventProvider(), SetActiveEventContext, useActiveEvent(), useShowEvent(), CursorBadge(), OFFSET (+15 more)

### Community 13 - "Registration Store and Schema"
Cohesion: 0.10
Nodes (27): RegistrationContextValue, stepErrors(), createRegistrationStore(), Draft, INITIAL_STATE, RegistrationState, RegistrationStore, stepOf() (+19 more)

### Community 14 - "Project Docs and Conventions"
Cohesion: 0.07
Nodes (27): AGENTS.md (AI agent guidelines), sendEmail via Resend with branded layout, Feedback modals (useFeedbackModal), lucide-react and lucide-animated icon convention, max-w-site 1440px content width, Local MongoDB single-node replica set (pnpm db:up), mustChangePassword lock for new HR accounts, Next.js 16 breaking changes notice (+19 more)

### Community 15 - "Runtime Dependencies"
Cohesion: 0.06
Nodes (34): dependencies, @base-ui/react@^1.8.0, @better-auth/mongo-adapter@^1.7.12, cloudinary@^2.11.0, cn@^0.4.0, date-fns@^4.4.0, @date-fns/tz@^1.5.0, @hookform/resolvers@^7.0.1 (+26 more)

### Community 16 - "Hero Sticky Note"
Cohesion: 0.14
Nodes (27): Char, comparePos(), INITIAL_TEXT, Line, parse(), Pos, render(), StickyNote() (+19 more)

### Community 17 - "Next Config and Admin Layout"
Cohesion: 0.12
Nodes (20): nextConfig, next, AdminLayout(), metadata, AdminHeader(), ROLE_LABEL, AdminNav(), AdminTheme() (+12 more)

### Community 18 - "Department Art Route"
Cohesion: 0.11
Nodes (22): dynamicParams, GET(), DepartmentArt(), DepartmentArtLayers(), fitLayers(), rasterizeLayers(), usedDefs(), art (+14 more)

### Community 19 - "Registration Detail Page"
Cohesion: 0.12
Nodes (23): Field(), LINKS, metadata, RegistrationPage(), Section(), CopyButton(), ArrowLink(), RegistrationPager() (+15 more)

### Community 20 - "Admin Data Tables"
Cohesion: 0.18
Nodes (24): date-fns, COLUMNS, RecommendationsTable(), RecommendedBy(), COLUMNS, RegistrationsTable(), Reviewers(), SortHeader() (+16 more)

### Community 21 - "Animated Icons"
Cohesion: 0.16
Nodes (16): motion, ArrowUpIcon(), ArrowUpIconProps, PATH_VARIANTS, ARROW_VARIANTS, ArrowUpRightIcon(), ArrowUpRightIconProps, SECOND_PATH_VARIANTS (+8 more)

### Community 22 - "Registrations List Page"
Cohesion: 0.13
Nodes (22): metadata, RegistrationsPage(), RegistrationsToolbar(), column, columns, UsersTable(), createMcDataTableColumnHelper(), getPageItems() (+14 more)

### Community 23 - "Event Chain Viewport"
Cohesion: 0.12
Nodes (21): useSetActiveEvent(), centeredEvent(), ChainControlProvider(), ChainPlayingContext, ChainSlice, ChainSlicesContext, ChainSpeedContext, ChainViewport() (+13 more)

### Community 24 - "Feedback Modals"
Cohesion: 0.13
Nodes (17): COPY, ErrorModal(), FeedbackModalHost(), FeedbackModalHostProps, MODALS, COPY, SuccessModal(), FeedbackModalOptions (+9 more)

### Community 25 - "Student ID Upload Actions"
Cohesion: 0.14
Nodes (21): RATE_LIMIT, SignatureResult, discardUpload(), EMAIL_RATE_LIMIT, IP_RATE_LIMIT, readUploadReference(), RegistrationResult, submitRegistration() (+13 more)

### Community 26 - "Trusted By Partners"
Cohesion: 0.15
Nodes (19): HoveredPartnerContext, HoveredPartnerName(), HoveredPartnerProvider(), PARTNER_ATTRIBUTE, PartnerHoverArea(), SetHoveredPartnerContext, useSetHoveredPartner(), LogoCell() (+11 more)

### Community 27 - "Better Auth Core"
Cohesion: 0.14
Nodes (20): better-auth@^1.7.12, better-auth, changePassword(), ChangePasswordState, Field, GET, POST, auth (+12 more)

### Community 28 - "Seed Scripts"
Cohesion: 0.09
Nodes (15): assertLocalDatabase(), FIELDS, FIRST_NAMES, LAST_NAMES, RECOMMENDERS, REVIEW_REASONS, REVIEW_SETS, REVIEWERS (+7 more)

### Community 29 - "Club Section Icons"
Cohesion: 0.17
Nodes (20): DevSectionIcon(), SLASH, states, BODY_PATHS, EYES, GameDevSectionIcon(), states, EARS (+12 more)

### Community 30 - "shadcn Components Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 31 - "CI Workflow"
Cohesion: 0.09
Nodes (21): runs-on, steps, concurrency, cancel-in-progress, group, BETTER_AUTH_SECRET, BETTER_AUTH_URL, MONGODB_URI (+13 more)

### Community 32 - "Registrations Window Button"
Cohesion: 0.16
Nodes (16): Arrow(), formatCountdown(), RegistrationsButton(), RegistrationsButtonProps, REGISTRATIONS_WINDOW, getSnapshot(), listeners, subscribe() (+8 more)

### Community 33 - "Email Templates"
Cohesion: 0.22
Nodes (18): appUrl(), AuthEmail, credentialsEmail(), resetPasswordEmail(), buildClubEmail(), buildConfirmationEmail(), contactRows(), renderText() (+10 more)

### Community 34 - "Hero Activities and Wins"
Cohesion: 0.11
Nodes (8): Activities(), Print, PrintedPhoto(), PRINTS, Print, PrintedPhoto(), PRINTS, Wins()

### Community 35 - "Club Sections Showcase"
Cohesion: 0.15
Nodes (19): ClubSectionsShowcase(), close(), handleKeyDown(), step(), ClubSectionsShowcaseProps, ShowcaseSection, ClubSectionsStage(), ClubSectionsStageProps (+11 more)

### Community 36 - "Birth Date Field"
Cohesion: 0.20
Nodes (15): BirthDateField(), DEFAULT_MONTH, maskDate(), McCalendar, pad(), toCalendarDate(), today, toDisplay() (+7 more)

### Community 37 - "Registration Flow Steps"
Cohesion: 0.22
Nodes (17): FormActions(), RegistrationSteps(), STEPS, AS_TYPED, ReviewDialog(), StepSection(), useImagePreview(), useRegistration() (+9 more)

### Community 38 - "Contact Form"
Cohesion: 0.24
Nodes (16): ContactState, RATE_LIMIT, sendContactMessage(), ContactForm(), handleSubmit(), INITIAL_STATE, SendIcon(), CONTACT_FIELDS (+8 more)

### Community 39 - "Registration Context Provider"
Cohesion: 0.22
Nodes (17): createStudentIdUploadSignature(), hasErrors(), RegistrationContext, RegistrationProvider(), openStep(), scrollToForm(), showStepErrors(), validateUpTo() (+9 more)

### Community 40 - "Status Badge and List Params"
Cohesion: 0.18
Nodes (15): StatusCounts, VARIANTS, DEFAULT_LIST_PARAMS, first(), MAX_QUERY_LENGTH, parseListParams(), REGISTRATION_SORTS, RegistrationListParams (+7 more)

### Community 41 - "Community Activity Cursor"
Cohesion: 0.16
Nodes (13): ActivityCursor(), draw(), play(), pop(), FOLLOW_TRANSITION, OFFSET, POP_IN_TRANSITION, POP_OUT_TRANSITION (+5 more)

### Community 42 - "Footer Tile Physics"
Cohesion: 0.22
Nodes (19): startPile(), fall(), fallStep(), goLive(), land(), onPointerDown(), onPointerMove(), release() (+11 more)

### Community 43 - "Box Physics Core"
Cohesion: 0.17
Nodes (19): applyContact(), clamp(), clampCorners(), Corner, Drag, keepInside(), matchShape(), Point (+11 more)

### Community 44 - "Recommendations Page"
Cohesion: 0.17
Nodes (16): metadata, RecommendationsPage(), listContext(), RecommendationsToolbar(), SearchParams, SortOrder, recommendationsOverview(), DEFAULT_RECOMMENDATION_PARAMS (+8 more)

### Community 45 - "Multi Select Filter"
Cohesion: 0.16
Nodes (9): MultiSelectFilter(), TARGET_OPTIONS, McSelectContent(), McSelectIcons(), McSelectItem(), McSelectTrigger(), McSelectTriggerProps, McSelectValue() (+1 more)

### Community 46 - "Playground Drag Physics"
Cohesion: 0.21
Nodes (18): startPlayground(), drop(), grab(), onPointerDown(), onPointerMove(), release(), render(), run() (+10 more)

### Community 47 - "MicroBot Widget"
Cohesion: 0.19
Nodes (13): LoadingDots(), MessageInput(), isPhone(), MicroBotWidget(), MicroBotWidgetProps, subscribePhone(), SuggestionChip(), ThinkingStatus() (+5 more)

### Community 48 - "Statistics Counters"
Cohesion: 0.21
Nodes (13): Face(), RouletteNumber(), StatText(), StatTextProps, StatisticsScroll(), StepContext, stepLayout(), useStatisticsStep() (+5 more)

### Community 49 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "Root Layout and Scroll"
Cohesion: 0.16
Nodes (15): lenis@^1.3.26, @vercel/analytics@^2.0.1, lenis, @vercel/analytics, dmSans, metadata, plusJakartaSans, RootLayout() (+7 more)

### Community 51 - "HR User Management"
Cohesion: 0.22
Nodes (14): createHrUser(), deactivateHrUser(), deleteHrUser(), emailCredentials(), failure(), HrUserActionResult, reactivateHrUser(), resetHrUserPassword() (+6 more)

### Community 52 - "Hero Headline"
Cohesion: 0.14
Nodes (13): CHIPS, Headline(), IconLetter, ICONS, LETTERS, SWAPPED, HEADLINE_POSITION, isSkipped() (+5 more)

### Community 53 - "Hero Robotics"
Cohesion: 0.14
Nodes (7): DRONE, DRONE_BOX, Layer, layerStyle(), Photo(), Print(), Robotics()

### Community 54 - "About Photo Spiral"
Cohesion: 0.20
Nodes (13): PhotoSpiral(), spiralClearSide(), Strip(), u(), RevealText(), RevealTextProps, SpiralScroll(), SpiralScrollProps (+5 more)

### Community 55 - "Hero Playground Board"
Cohesion: 0.19
Nodes (13): BoardApi, Box, DroppedBox(), PlaygroundBoard(), PLAYGROUND_VIEWS, Playground(), HERO_CANVAS, PLAYGROUND (+5 more)

### Community 56 - "Docker Compose MongoDB"
Cohesion: 0.12
Nodes (15): interval, retries, test, timeout, command, container_name, healthcheck, image (+7 more)

### Community 57 - "MicroBot API"
Cohesion: 0.22
Nodes (13): askMicroBot(), RATE_LIMIT, single(), MICROBOT_ERRORS, MICROBOT_MAX_LENGTH, MicroBotEvent, CitationFilter, errorCode() (+5 more)

### Community 58 - "Hero Canvas Navigator"
Cohesion: 0.19
Nodes (11): CanvasNavigator(), NavigatorHandle, NavigatorRect, HeroCanvas(), centerOn(), onPointerDown(), sync(), noSubscription() (+3 more)

### Community 59 - "MicroBot Face"
Cohesion: 0.14
Nodes (12): BLOCK, CURSOR, DEAD_FRAMES, FRAMES, MicroBotFace(), PROMPT, Shape, TYPED (+4 more)

### Community 60 - "Package Scripts"
Cohesion: 0.13
Nodes (15): scripts, auth:create-president, auth:deactivate-president, build, db:down, db:seed-registrations, db:seed-staff, db:up (+7 more)

### Community 61 - "Translate DOM Guard"
Cohesion: 0.19
Nodes (8): vitest@^5.0.5, vitest, childHolding(), guardDomAgainstTranslation(), GUARDED, GuardedMethods, FakeNode, guardedProto()

### Community 62 - "Not Found Page"
Cohesion: 0.21
Nodes (11): boot(), CORNERS, Lines(), longest(), metadata, NotFound(), ORDER, vt323 (+3 more)

### Community 63 - "Footer Falling Tiles"
Cohesion: 0.18
Nodes (13): Draw, HANG_BANDS, HANG_TILT, Point, Pose, reach(), scatter(), Size (+5 more)

### Community 64 - "Permissions and Session"
Cohesion: 0.29
Nodes (10): AdminHomePage(), GET(), text(), hasPermission(), isStaffRole(), Permissions, getSession, homeFor() (+2 more)

### Community 65 - "Hero AR Card"
Cohesion: 0.18
Nodes (5): ArCard(), CardShape(), CORNERS, DOTS, MENU_LINES

### Community 66 - "List Pagination"
Cohesion: 0.26
Nodes (8): ListPagination(), pageItems(), ListItem, ListNavigation, listNavigation(), ListNeighbor, pageOf(), REGISTRATIONS_PER_PAGE

### Community 67 - "Footer Brand Icons"
Cohesion: 0.26
Nodes (10): BrandIconProps, FacebookIcon(), GitHubIcon(), InstagramIcon(), LinkedInIcon(), MediumIcon(), TikTokIcon(), TILE_STYLES (+2 more)

### Community 68 - "Featured Projects"
Cohesion: 0.29
Nodes (8): @base-ui/react, ProjectItem(), ORGANIZATION_URL, Project, PROJECT_CATEGORIES, ProjectCategory, PROJECTS, PROJECTS_JSON_LD

### Community 69 - "Hero Level Up"
Cohesion: 0.20
Nodes (7): LevelUp(), pixelify, SHADES, SPARKLES, Star(), STAR_PIXELS, EASE_OUT_QUART

### Community 70 - "Hero Photobooth"
Cohesion: 0.22
Nodes (5): Booth(), Photobooth(), PHOTOS, STRIP_OFFSETS, buttonVariants

### Community 71 - "President CLI Scripts"
Cohesion: 0.38
Nodes (5): findPresidents(), PresidentUser, readOptions(), run(), STAFF

### Community 73 - "Hero Todo List"
Cohesion: 0.27
Nodes (7): ITEMS, RULES, TASKS, TodoList(), HERO_ITEMS, HeroCanvasItem, HeroCanvasItemId

### Community 74 - "McCard Component"
Cohesion: 0.24
Nodes (8): cardVariants, footerVariants, McCard(), McCardContentProps, McCardDirectionContext, McCardFooter(), McCardFooterProps, McCardHeaderProps

### Community 75 - "MongoDB Client and Rate Limit"
Cohesion: 0.39
Nodes (7): mongodb, server-only, cache, getMongoClient(), Counter, ensureRateLimitIndexes(), isRateLimited()

### Community 76 - "Review Server Actions"
Cohesion: 0.28
Nodes (9): applyChange(), recommendRegistration(), removeRecommendation(), reviewer(), reviewRegistration(), handleRemove(), handleSubmit(), handleSubmit() (+1 more)

### Community 77 - "Registrations Route and Sitemap"
Cohesion: 0.36
Nodes (7): generateMetadata(), RegistrationsPage(), revalidate, sitemap(), RegistrationFlow(), siteRoutes, areRegistrationsOpen()

### Community 78 - "Site Layout and MicroBot"
Cohesion: 0.39
Nodes (6): SiteLayout(), MicroBot(), MICROBOT_GREETING, MICROBOT_MAX_FOLLOW_UPS, MICROBOT_PLACEHOLDER, MICROBOT_SUGGESTIONS

### Community 79 - "McCheckbox Component"
Cohesion: 0.36
Nodes (7): class-variance-authority@^0.7.1, class-variance-authority, checkboxVariants, McCheckbox(), McCheckboxProps, supportTextVariants, textVariants

### Community 80 - "Hero Voice Note"
Cohesion: 0.32
Nodes (4): FIGMA_BARS, formatTime(), VoiceNote(), waveform()

### Community 81 - "Event Card Dialog"
Cohesion: 0.48
Nodes (6): EventCard(), logoScale(), EventDialogOpenContext, EventDialogProvider(), OpenEventContext, XIcon()

### Community 82 - "Prettier Config"
Cohesion: 0.33
Nodes (5): plugins, printWidth, semi, tailwindFunctions, tailwindStylesheet

### Community 83 - "MicroBot Answer Parser"
Cohesion: 0.53
Nodes (5): AnswerText(), Block, hideOpenMarkers(), Inline(), parseBlocks()

### Community 84 - "Registration Feature Docs"
Cohesion: 0.40
Nodes (5): Bare pages route group (isBarePage), Multi-step registration form, REGISTRATIONS_WINDOW (opensAt/closesAt), Signed browser upload of student IDs to Cloudinary, guardDomAgainstTranslation (Google Translate crash guard)

### Community 86 - "Menu Backdrop Detection"
Cohesion: 0.70
Nodes (4): effectiveOpacity(), isBackdropDark(), isDominantSectionDark(), toRgba()

### Community 87 - "pnpm Workspace"
Cohesion: 0.50
Nodes (3): allowBuilds, esbuild, unrs-resolver

### Community 90 - "Easing and Motion Docs"
Cohesion: 0.67
Nodes (3): Shared easing tokens (ease-out-expo, EASE_*), Lenis smooth scroll and Motion animations, Lenis driven by Motion frame loop (autoRaf false)

## Knowledge Gaps
- **13 isolated node(s):** `REGISTRATIONS_WINDOW (opensAt/closesAt)`, `Signed browser upload of student IDs to Cloudinary`, `sendEmail via Resend with branded layout`, `requireStaff guard on admin pages and actions`, `max-w-site 1440px content width` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 592 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Admin Dialogs and Icons` to `Admin Auth Pages`, `Hero Stickers`, `Lint and Dev Tooling`, `User Actions Menu`, `Registration Field Styles`, `Site Menu Bar`, `Featured Events Active State`, `Registration Store and Schema`, `Runtime Dependencies`, `Hero Sticky Note`, `Next Config and Admin Layout`, `Department Art Route`, `Registration Detail Page`, `Animated Icons`, `Registrations List Page`, `Event Chain Viewport`, `Feedback Modals`, `Trusted By Partners`, `Club Section Icons`, `Registrations Window Button`, `Club Sections Showcase`, `Birth Date Field`, `Registration Flow Steps`, `Contact Form`, `Registration Context Provider`, `Community Activity Cursor`, `Multi Select Filter`, `MicroBot Widget`, `Statistics Counters`, `Root Layout and Scroll`, `Hero Headline`, `Hero Robotics`, `About Photo Spiral`, `Hero Playground Board`, `Hero Canvas Navigator`, `Footer Falling Tiles`, `Permissions and Session`, `Hero AR Card`, `Hero Level Up`, `Hero Photobooth`, `Hero Todo List`, `McCard Component`, `McCheckbox Component`, `Hero Voice Note`, `Event Card Dialog`, `MicroBot Answer Parser`, `Error Fallback Boundaries`, `Section Stack Layout`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **What connects `REGISTRATIONS_WINDOW (opensAt/closesAt)`, `Signed browser upload of student IDs to Cloudinary`, `sendEmail via Resend with branded layout` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Auth Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.09176470588235294 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Next Config and Admin Layout` to `Admin Auth Pages`, `Landing Page Composition`, `Review Validation Schemas`, `Hero Stickers`, `Lint and Dev Tooling`, `Admin Dialogs and Icons`, `Site Menu Bar`, `Hero Playground Assets`, `Featured Events Active State`, `Runtime Dependencies`, `Hero Sticky Note`, `Registration Detail Page`, `Admin Data Tables`, `Registrations List Page`, `Student ID Upload Actions`, `Trusted By Partners`, `Better Auth Core`, `Registrations Window Button`, `Hero Activities and Wins`, `Birth Date Field`, `Registration Flow Steps`, `Contact Form`, `Registration Context Provider`, `Status Badge and List Params`, `Community Activity Cursor`, `Recommendations Page`, `Multi Select Filter`, `Root Layout and Scroll`, `HR User Management`, `Hero Headline`, `Hero Robotics`, `MicroBot API`, `Hero Canvas Navigator`, `Not Found Page`, `Permissions and Session`, `Hero AR Card`, `List Pagination`, `Hero Level Up`, `Hero Photobooth`, `Registrations Route and Sitemap`, `Hero Voice Note`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Should `Landing Page Composition` be split into smaller, more focused modules?**
  _Cohesion score 0.11748381128584644 - nodes in this community are weakly interconnected._
- **Why does `svgo` connect `Lint and Dev Tooling` to `Department Art Generator`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `Review Validation Schemas` be split into smaller, more focused modules?**
  _Cohesion score 0.09872241579558652 - nodes in this community are weakly interconnected._