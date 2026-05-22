# Ikoms Healthcare Solutions Platform (Next)

A Next.js 13 (App Router) front-end for the Ikoms Healthcare Solutions Platform.

## Quick start

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

Other useful scripts:

- `npm run lint` — run linters
- `npm run test` — run tests (if present)

Open http://localhost:3000 in your browser.

## Project layout (workspace tree)

```
AGENTS.md
CLAUDE.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
README.md
tsconfig.json
app/
	globals.css
	layout.tsx
	not-found.tsx
	page.tsx
	about/
		page.tsx
	admin/
		layout.tsx
		page.tsx
		consultancy/
			page.tsx
		courses/
			page.tsx
		jobs/
			page.tsx
		login/
			page.tsx
		orders/
			page.tsx
	consultancy/
		page.tsx
		topics/
			page.tsx
			[id]/
				page.tsx
	contact/
		page.tsx
	recruitment/
		page.tsx
		jobs/
			page.tsx
			[id]/
				page.tsx
	shop/
		page.tsx
		cart/
			page.tsx
		checkout/
			page.tsx
		collections/
			[handle]/
				page.tsx
		order-confirmation/
			page.tsx
		products/
			page.tsx
			[handle]/
				page.tsx
	training/
		page.tsx
		courses/
			page.tsx
			[id]/
				page.tsx
components/
	AppLayout.tsx
	theme-provider.tsx
	layout/
		AdminLayout.tsx
		Footer.tsx
		Header.tsx
		SiteLayout.tsx
ui/
	accordion.tsx
	alert-dialog.tsx
	alert.tsx
	aspect-ratio.tsx
	avatar.tsx
	badge.tsx
	breadcrumb.tsx
	button.tsx
	calendar.tsx
	card.tsx
	carousel.tsx
	chart.tsx
	checkbox.tsx
	collapsible.tsx
	command.tsx
	context-menu.tsx
	dialog.tsx
	drawer.tsx
	dropdown-menu.tsx
	form.tsx
	hover-card.tsx
	input-otp.tsx
	input.tsx
	label.tsx
	menubar.tsx
	navigation-menu.tsx
	pagination.tsx
	popover.tsx
	progress.tsx
	radio-group.tsx
	resizable.tsx
	scroll-area.tsx
	select.tsx
	separator.tsx
	sheet.tsx
	sidebar.tsx
	skeleton.tsx
	slider.tsx
	sonner.tsx
	switch.tsx
	table.tsx
	tabs.tsx
	textarea.tsx
	toast.tsx
	toaster.tsx
	toggle-group.tsx
	toggle.tsx
	tooltip.tsx
	use-toast.ts
hooks/
	use-mobile.tsx
	use-toast.ts
lib/
	cart.ts
	constants.ts
	supabase.ts
	utils.ts
public/
```

## Notes

- This project uses the Next.js App Router and React Server Components where appropriate.
- UI primitives live in the `ui/` directory and layout components in `components/layout/`.

If you'd like, I can also commit this change or add a generated tree file. 
