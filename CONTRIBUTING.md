# Contributing
Follow these guidelines when contributing to the repository.

## Coding style
Use `npx gulp lint` for a definitive guide on coding style. See [tslint.json](tslint.json) for details.

Below are some of the major points in the coding style:

* Tabs are made using the tab character (`\t`). A new level of indentation should be applied whenever a set of curly braces (`{}`) are used.
* All opening curly braces have spaces before them and are on the same line as the preceeding statement:
```javascript
const f = (n: string) => {
	//...
}

constructor(n: string) {
	//...
}
```
* All closing curly braces go on their own line.
* Variable names are `camelCase`. Class names are `PascalCase`. Constant names are `ALL_CAPS`.
* Do not use `extends` unless absolutely necessary. Use `implements` to provide similar functionality across classes.
* Use ES6 style whenever possible. For example, instead of using `function f(e: string){...}`, use `const f = e => {...}`.
* Use `const` over `let` whenever possible.
* If else is done like follows:
```javascript
if (condition) {
	//...
}
else if (condition2) {
	//...
}
else {
	//...
}
```

## Submitting a code change
1. Do not commit directly to `master`. Instead, make your changes on a new branch with a descriptive name (`ltorg-fix`, `adding-comments`, etc.). The `master` branch must contain a working, stable version of the code at all times.
2. If your code adds new functionality, add the appropriate unit tests in `/tests`.
3. When merging into `master`, make sure all tests pass (`npx gulp test`).
