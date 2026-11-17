# Things only you can fill in

Search the code for `TODO(tenzing)` to find each spot. Anything with a dashed border on the page is a placeholder.

## Check before publishing

- [ ] **Resume PDF has the wrong email link.** The visible text says `tenzingdhendupd@gmail.com`, but the link behind it opens `mailto:tabishnavaid06@gmail.com`. Fix that in the resume itself.
- [ ] **Project links point at other people's accounts.** They are copied from your resume: `TabishNavaid/1stseen`, `MurtazaKafka/mantra`, `Makoninio/Personal-finance-assistant`. Confirm those are the links you want, or swap in forks or live demos (`js/content.js`).
- [ ] **Email address.** `tenzingdhendupd@gmail.com` is shown publicly in the contact section. Change it if you want a different one there (`index.html`).
- [ ] **Phone number** is left off the site on purpose. Add it only if you want it public.
- [ ] **GPA** (3.9, major 4.0) is shown in the character sheet. Remove the "Standing" row if you would rather not list it.
- [ ] **Contact line** says you are looking for software engineering internships for summer 2027. Edit it to match what you want.

## Content to add

- [ ] Portrait: `assets/img/portrait.jpg` (4:5, at least 800x1000), then replace the placeholder block in `index.html`.
- [ ] Bio: the current text is a draft written from your resume. Rewrite it and delete the "Draft bio" note.
- [ ] Experience photos: add files to `assets/img/` and set `image` on each quest in `js/content.js`.
- [ ] Project screenshots (16:9): same, on each project in `js/content.js`.
- [ ] Resume: add `assets/resume.pdf` (a public copy), then remove `data-placeholder` from the link in `index.html`.
- [ ] Inventory tools: set `note` on each tool in `js/content.js` with one line on how you use it.
- [ ] Player: check the "Current objective" and "Hobbies and interests" rows in `index.html`.
- [ ] Map: write your own line for Bhutan and North Carolina (`places` in `js/content.js`).
- [ ] Summit note: check the wording of the Tenzing Norgay note in `index.html` (search for `summit__note`).
- [ ] Skill tree: if you add or remove a skill, add a star to that constellation's shape in `js/skills.js` (`SHAPES`), or it falls back to a zigzag.
- [ ] Skill tree: add `usedIn` to more skills where you can point to real work (for example PyTorch for the ALPhA Lab).
- [ ] Social preview: add an `og:image` and the real `og:url` in the `<head>` once deployed.

## Ideas for later versions

- A title screen with "press any key", and a pause menu on Esc.
- Project detail pages or a slide-out "item inspect" view with more screenshots.
- A contact form (needs a form service, since the site is static).
- Sound toggle with menu ticks.
- A small flying mini-game on the start screen.
