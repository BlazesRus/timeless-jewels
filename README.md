# timeless-jewels [![push](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yml/badge.svg)](https://github.com/BlazesRus/timeless-jewels/actions/workflows/push.yaml) ![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/vilsol/timeless-jewels) ![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/vilsol/timeless-jewels) [![GitHub license](https://img.shields.io/github/license/Vilsol/timeless-jewels)](https://github.com/BlazesRus/timeless-jewels/blob/master/LICENSE)

A simple timeless jewel calculator with a skill tree view by Vilsol
with some modifications for better trade search functionality
- choose specific conqueror or select any conqueror if you don't care about keystone passive
- trade search gets split into multiple links with 200 seeds per link (max poe trade site can handle)
- fixed bug with duplicate filter groups in trade link

Original Hosted Version: [https://vilsol.github.io/timeless-jewels](https://vilsol.github.io/timeless-jewels)

Hosted Timeless Jewel Searcher:[https://blazesrus.github.io/timeless-jewels/tree]https://blazesrus.github.io/timeless-jewels/tree

Modified version: https://BlazesRus.github.io/timeless-jewels

Official Branch(Github):[https://github.com/vilsol/timeless-jewels](https://github.com/vilsol/timeless-jewels)

Source of ImHamba Branch(Github):[https://github.com/ImHamba/timeless-jewels](https://github.com/ImHamba/timeless-jewels)

Uses data extracted with https://github.com/Vilsol/go-pob-data

## Updates to new leagues

Whenever a new league is coming, the passive tree might get updated.
**But** it is not guaranteed to contain correct data until a game download is available.

Specifically, this project depends on the following data tables:

* Alternate Passive Additions
* Alternate Passive Skills
* Passive Skills
* Stats
* Translations

---------------------------------Local testing instruction------------------------
Update golangci-lint via running in console:
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

run command:
golangci-lint config verify
golangci-lint run ./... --default=none -E errcheck

after using cd frontend:
pnpm install
pnpm run format
pnpm run lint
pnpm run check
pnpm run prepare
pnpm run build