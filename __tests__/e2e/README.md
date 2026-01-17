# E2E Test Plan for NexusAI

## Test Framework
- Playwright recommended for full E2E testing
- Install: `npm install -D @playwright/test`

## Test Scenarios

### 1. Authentication Flow
```typescript
test('anonymous sign in', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.click('text=Continue as Guest');
  await page.waitForURL('/');
  expect(await page.locator('[data-testid="chat-interface"]')).toBeVisible();
});

test('google sign in redirect', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.click('text=Continue with Google');
  // Verify redirect to Google OAuth
  await expect(page.url()).toContain('accounts.google.com');
});
```

### 2. Chat Flow
```typescript
test('send message and receive response', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('textarea[placeholder="Type your message..."]');
  await input.fill('Hello, how are you?');
  await page.keyboard.press('Enter');
  
  // Wait for response
  await page.waitForSelector('[data-role="assistant"]');
  const response = await page.locator('[data-role="assistant"]').textContent();
  expect(response).toBeTruthy();
});

test('stop generation', async ({ page }) => {
  await page.goto('/');
  await page.fill('textarea', 'Write a long story');
  await page.keyboard.press('Enter');
  
  // Click stop button while streaming
  await page.click('[data-testid="stop-button"]');
  // Verify stream stopped
});
```

### 3. Conversation Management
```typescript
test('create new conversation', async ({ page }) => {
  await page.goto('/');
  await page.click('text=New Chat');
  // Verify empty chat state
});

test('rename conversation', async ({ page }) => {
  // Create a conversation first
  await page.fill('textarea', 'Hello');
  await page.keyboard.press('Enter');
  
  // Rename
  await page.hover('[data-testid="conversation-item"]');
  await page.click('[data-testid="edit-button"]');
  await page.fill('input', 'Renamed Chat');
  await page.click('[data-testid="save-button"]');
  
  expect(await page.locator('text=Renamed Chat')).toBeVisible();
});

test('delete conversation', async ({ page }) => {
  // Create and delete
});
```

### 4. Tools Panel
```typescript
test('open tools panel', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="tools-button"]');
  expect(await page.locator('text=Canvas')).toBeVisible();
  expect(await page.locator('text=Code')).toBeVisible();
  expect(await page.locator('text=Image')).toBeVisible();
  expect(await page.locator('text=Search')).toBeVisible();
});

test('canvas tool drawing', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="tools-button"]');
  await page.click('text=Canvas');
  
  // Draw on canvas
  const canvas = page.locator('canvas');
  await canvas.dragTo(canvas, {
    sourcePosition: { x: 50, y: 50 },
    targetPosition: { x: 150, y: 150 },
  });
});

test('code generator', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="tools-button"]');
  await page.click('text=Code');
  await page.fill('textarea', 'sorting algorithm');
  await page.click('text=Generate Code');
  await page.waitForSelector('pre code');
});

test('web search', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="tools-button"]');
  await page.click('text=Search');
  await page.fill('input', 'Next.js documentation');
  await page.click('text=Search');
  await page.waitForSelector('[data-testid="search-result"]');
});
```

### 5. Theme Toggle
```typescript
test('toggle dark/light theme', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  
  // Initially dark
  await expect(html).toHaveClass(/dark/);
  
  // Toggle to light
  await page.click('[data-testid="theme-toggle"]');
  await expect(html).not.toHaveClass(/dark/);
  
  // Toggle back
  await page.click('[data-testid="theme-toggle"]');
  await expect(html).toHaveClass(/dark/);
});
```

### 6. Responsive Design
```typescript
test('mobile sidebar collapse', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Sidebar should be collapsed
  const sidebar = page.locator('[data-testid="sidebar"]');
  expect(await sidebar.getAttribute('data-collapsed')).toBe('true');
});
```

### 7. Error Handling
```typescript
test('handles API error gracefully', async ({ page }) => {
  // Mock API failure
  await page.route('/api/chat', (route) => {
    route.fulfill({ status: 500, body: 'Internal Server Error' });
  });
  
  await page.goto('/');
  await page.fill('textarea', 'Hello');
  await page.keyboard.press('Enter');
  
  // Should show error message
  await expect(page.locator('text=something went wrong')).toBeVisible();
});
```

### 8. Voice Input
```typescript
test('voice input button', async ({ page }) => {
  await page.goto('/');
  const voiceButton = page.locator('[data-testid="voice-button"]');
  await expect(voiceButton).toBeVisible();
  
  // Click should trigger speech recognition (if available)
  await voiceButton.click();
});
```

## Setup Instructions

1. Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

2. Create playwright.config.ts:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

3. Run tests:
```bash
npx playwright test
```

## CI/CD Integration

Add to GitHub Actions:
```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```
