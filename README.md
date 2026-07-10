# EdCircles

A marketing and booking website for EdCircles, a two-sided marketplace connecting teachers, students, and schools with verified education consultants.

The site has three zones, reached from a pie chart on the homepage or directly by URL:

- **The Staffroom** (`staffroom.html`): teacher training and career support
- **The Classroom** (`classroom.html`): student career counselling, tutoring, and exam prep
- **The Library** (`library.html`): whole-school training and resources

`career-counselling.html` is the one fully built booking page for now; every other item links to a placeholder page with real draft copy and an email capture for interest.

## Running locally

Plain HTML, CSS, and JavaScript, no build step. Serve the folder with any static file server, for example:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Structure

```
index.html                 landing page, pie chart role gate
staffroom.html              Teacher Training bento grid
classroom.html               Student Support bento grid
library.html                  Whole-School Training bento grid
career-counselling.html       full booking page
*.html                          individual item placeholder pages
styles/main.css
js/main.js
```
