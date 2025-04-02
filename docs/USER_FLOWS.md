# ImageMax User Flows

## 1. Navigation & Dashboard Access

### Main Navigation
1. User sees main navigation items:
   - Home
   - My Tools (Dashboard)
   - Pricing
   - About
   - Contact

### Dashboard Access for Visitors
1. Visitor clicks "My Tools" in navigation
2. System checks authentication status
3. If not authenticated:
   - Dashboard content loads but with white blur overlay
   - Authentication dialog appears in center
   - Dialog shows:
     - "Sign Up" button
     - "Login" button
     - Close button
4. Visitor can:
   - Click "Sign Up" to register
   - Click "Login" to sign in
   - Click "Close" to dismiss dialog
5. After authentication:
   - Blur overlay disappears
   - User gets full access to dashboard

### Dashboard Layout
1. User sees two-panel layout:
   - Left Sidebar:
     - Tool categories
     - List of available tools
     - Quick access to recent tools
   - Main Content Area:
     - Selected tool interface
     - Tool-specific controls
     - Preview/result area

## 2. User Registration & Authentication

### New User Registration
1. User lands on homepage
2. Clicks "Sign Up" button
3. Fills registration form:
   - Email address
   - Password
   - Name
4. Verifies email
5. Completes profile setup
6. Redirected to dashboard

### User Login
1. User clicks "Login" button
2. Enters credentials
3. Successfully authenticated
4. Redirected to dashboard

## 3. Tool Access & Processing

### Tool Selection
1. User navigates to dashboard
2. Selects tool from sidebar
3. Tool interface loads in main content area
4. User can:
   - Upload new image
   - Select from recent images
   - Access tool-specific settings

### Basic Image Upload
1. User selects tool from sidebar
2. Clicks "Upload Image" button in tool interface
3. Selects image from device or drags & drops
4. Image uploads with progress indicator
5. Image appears in tool workspace

### Premium Feature Usage
1. User selects premium tool from sidebar
2. System checks subscription status
3. If not subscribed:
   - Shows premium feature preview
   - Displays upgrade prompt
4. If subscribed:
   - Tool becomes available
   - User can proceed with editing

## 4. Image Editing Workflows

### Background Removal
1. User selects "Background Removal" from sidebar
2. Uploads or selects image
3. Clicks "Remove Background" button
4. AI processes image
5. User can fine-tune results
6. Clicks "Apply" to save changes

### Image Upscaling
1. User selects "Upscale" from sidebar
2. Uploads or selects image
3. Selects target resolution
4. AI processes image
5. Preview shows before/after
6. User can download result

### Object Removal
1. User selects "Object Removal" from sidebar
2. Uploads or selects image
3. Selects object to remove
4. AI processes image
5. User can adjust selection
6. Clicks "Apply" to save changes

## 5. Project Management

### Saving Projects
1. User makes edits in tool interface
2. Clicks "Save" button
3. System auto-saves to cloud
4. Shows success notification

### Project Organization
1. User navigates to projects section
2. Can create folders
3. Can rename/move projects
4. Can delete projects

## 6. Export & Sharing

### Image Export
1. User clicks "Export" button in tool interface
2. Selects format (PNG, JPG, etc.)
3. Adjusts quality settings
4. Clicks "Download"

### Sharing
1. User clicks "Share" button in tool interface
2. Selects sharing method:
   - Generate link
   - Social media
   - Email
3. Sets permissions
4. Shares content

## 7. Subscription Management

### Upgrading to Premium
1. User clicks "Upgrade" button
2. Views pricing plans
3. Selects plan
4. Enters payment details via Paystack
5. Completes subscription
6. Gains premium access

### Managing Subscription
1. User navigates to account settings
2. Selects "Subscription"
3. Can:
   - View current plan
   - Change plan
   - Cancel subscription
   - Update payment method

## 8. Support & Help

### Accessing Help
1. User clicks "Help" icon in navigation
2. Can:
   - Browse documentation
   - Search for topics
   - Contact support
   - View tutorials

### Reporting Issues
1. User clicks "Report Issue"
2. Selects issue type
3. Describes problem
4. Attaches screenshots
5. Submits report
6. Receives confirmation 