# Issue Tracker: GitHub

The authoritative tracker for this repository is GitHub Issues in
`ZDAN-GHN/.agent-plugins`.

## Operations

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."`
- Close: `gh issue close <number> --comment "..."`

GitHub Issues are the publication target for specifications and implementation
work. Pull requests are not a request surface for triage.
