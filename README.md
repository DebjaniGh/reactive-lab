# ReactiveLab – RxJS Operators Playground

ReactiveLab is an Angular 19 application that **demonstrates how individual RxJS operators transform observable streams**. Each operator has its own interactive demo so you can tweak inputs, see real-time visualisations and immediately understand the operator’s behaviour. It is hosted at https://reactive-lab.vercel.app

## Why this project exists

Learning RxJS from documentation alone can be abstract. This playground lets you:

- **Experiment** with operators like `map`, `filter`, `merge`, `switchMap`, `debounceTime`, `combineLatest`, `zip`, etc.
- **Observe** live marble diagrams / log output as streams flow through the operator.
- **Compare** operators side by side to pick the right tool for your use-case.

## Getting started

```bash
# install dependencies
npm install

# start development server
ng serve
```

Then open `http://localhost:4200/` in your browser; the app reloads on code changes.

## Project structure

- `src/app/operators/*` – one component per operator demo
- `src/app/shared/*` – reusable helpers (e.g. marble visualiser)

## Scripts

- **Build** (production): `ng build`
- **Unit tests**: `ng test`
- **E2E tests**: `ng e2e` (add a compatible runner first)

## Contributing

Want to add a new operator demo or improve existing ones? Pull requests are welcome! Please open an issue first if you plan a large change.

## License

MIT
