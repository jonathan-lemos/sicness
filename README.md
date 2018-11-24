# sicness
A work-in-progress online SIC/XE assembler/debugger written in Typescript (ES6)/HTML/CSS. It is available as both a website and a standalone script.

## Features
### Assembler
* All SIC/XE instructions are supported.
* SIC Legacy instructions (*LDA) are supported.
* Outputs a complete .lst properly.
* The following compiler directives are supported:
    * START/END
    * RESW/RESB
	* WORD/BYTE
	* USE
	* BASE/NOBASE
* The following compiler directives are partially supported:
    * LTORG (does not place a new literal when out of pcrel/baserel range, fix AUTO-LTORG/LTORG-WORD)
	* EQU (does not interact with asterisk properly)
	* \* (does not interact with EQU properly)

### Website:
* Basic frontend complete (it looks awful).

## Roadmap
### Assembler:
* Add tests for SIC legacy operands and SicSpace instructions.
* Implement .obj format.
* Implement expression parser (BUFFERB - BUFFERA).
* Fix LTORG/EQU/\*
* Implement CSECT/ORG

### Website:
* Clean up the css/html so it doesn't look awful.
* Make a nicer looking frontend with React/Angular/Vue.
* Seperate output for .lst and .obj.
* Add a tabbed setup to switch between assembler and debugger.

### Debugger:
* Implement entire thing.

## Running the project
The latest "stable" version of the website can be viewed at <https://jonathanrlemos.github.io/sicness>.
If you want to run the standalone script or want to develop it, follow the instructions below.

### Getting started
First, clone the repository:
```shell
git clone https://github.com/jonathanrlemos/sicness.git
cd sicness
```

Then download all dependencies:
```shell
npm install
```

The standalone script can then be run as follows:
```shell
npm start path/to/asm
```

### Building the project
The browser js file can be built with the following command:
```shell
npx gulp
```

The built file can then be moved to the website with:
```shell
rm docs/sicness.min.js
cp dist/sicness.min.js docs
```

### Testing the project
The project can then be tested with the following command:
```shell
npm test
```

### Running the project
The website can be run with the following command:
```shell
cd docs
python -m http.server
```

You can then access the website by visiting <localhost:8000>.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for contributing guidelines.

## Licensing
This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt) for details.
