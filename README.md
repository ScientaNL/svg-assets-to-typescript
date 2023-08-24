# SVG Assets to Typescript

Converts SVG files to one tree-shakable typescript definition model, which can be used by a icon library.

Adaptation of the [svg-to-ts](https://github.com/kreuzerk/svg-to-ts) project. The main addition which this project provides for, is an svg
color variant workflow. With this workflow, it is possible to have one annotated svg and a map of color variants which can be used to render
a svg in multiple color scheme's and variants using *css variables*.

## Workflow

- SVG files must be annotated with properties containing the name of a css variable.
- A *rc-file* must be added to the svg root, containing the configuration.
- Optionally a *variants file* can be added, containing the color schemes of the variants.
- Run the tool.
- Implement the definition model in your application.

## Annotating and SVG Parsing

We use  *Affinity Designer* to manage our Icon Library at Scienta. Each layer which must be thematically colorized is named after the css
variable which must be used. When exported, these layer names are preserved by the exporter of Affinity Sesigner.

**Input example:**

```svg
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="100%" height="100%" viewBox="0 0 18 18" version="1.1" xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/"
     style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
>
  <rect serif:id="--secondary-color" x="1.029" y="2" width="16" height="2" style="fill:#aaa;"/>
  <rect serif:id="--secondary-color" x="1.029" y="8" width="16" height="2" style="fill:#aaa;"/>
  <rect serif:id="--secondary-color" x="1.029" y="14" width="16" height="2" style="fill:#aaa;"/>
  <rect serif:id="--main-color" x="13.029" y="1" width="2" height="4" style="fill:#333;"/>
  <rect serif:id="--main-color" x="4.029" y="7" width="2" height="4" style="fill:#333;"/>
  <rect serif:id="--main-color" x="10.029" y="13" width="2" height="4" style="fill:#333;"/>
</svg>
```

**This will be transformed to:**

```svg

<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" xml:space="preserve"
     style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"
>
  <path style="fill:var(--secondary-color,#aaa)" d="M1.029 2h16v2h-16zm0 6h16v2h-16zm0 6h16v2h-16z"/>
  <path style="fill:var(--main-color,#333)" d="M13.029 1h2v4h-2zm-9 6h2v4h-2zm6 6h2v4h-2z"/>
</svg>
```

The icon is optimized by [svgo](https://github.com/svg/svgo) and the colors are substituted with a css-variable having the original color
set as default. The settings of how to parse annotated svgs are configurable.

## Variants

If you want to use one svg asset to be used in multiple color schemes, you can add a variants file.

**Example variants file:**

```yml
action/preset.svg:
  dark: { --main-color: "#ffccff", --secondary-color: "#aaddee" }
  active: { --main-color: "#eeffcc", --secondary-color: "#22eedd" }
```

These variant will be added to the definition model file and can be used by an svg component to load the svg with these css variables.

### Mono variants (SVG's currentColor)

You can activate *mono variant* option. This adds for each svg asset a pre-set variant with all the colors on *currentColor*.

## Definition model

The output of this tool is a definition model with a constant for each converted svg asset and it's variants. The typings can be configured
in the configuration rc file.

** Example Typescript definition model file:**

```typescript

// Prefixed with the prefix `scaIcon` and typed `ScaIcon`
export const scaIcon_action_preset: ScaIcon = {
  name: `action-preset`,
  svg: `<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"><path style="fill:none;fill-rule:nonzero" d="M0 0h18v18H0z"/><path style="fill:var(--secondary-color,#aaa)" d="M1.029 2h16v2h-16zm0 6h16v2h-16zm0 6h16v2h-16z"/><path style="fill:var(--main-color,#333)" d="M13.029 1h2v4h-2zm-9 6h2v4h-2zm6 6h2v4h-2z"/></svg>`,
  variants: {
    dark: {
      "--secondary-color": `#333`,
      "--main-color": `#aaa`
    },
    mono: {
      "--secondary-color": `currentColor`,
      "--main-color": `currentColor`
    }
  }
};

// ... All other converted files

// A type of all the asset names
export type scaIcon =
  | 'action-preset' // ... And all other converted files
  ;

// ... Type definitions
export interface ScaIcon {
  name: string;
  svg: string;
  variants?: Record<string, ScaIconVariant>
}

export interface ScaIconVariant {
  [key: string]: string;
}
```

## Configuration

It is mandatory to add a rc file to the path you want to create a svg definition model for.

### .svg-assets-to-typescriptrc.yml

The main config can be configured in a rc yml file. This file must be specified as command parameter when running the tool.

```typescript
interface ConfigInterface {
  inputs: string[]; // One ore more input paths locating the SVGs
  variants?: { //Optional, when utilizing asset variants
    path: string; // Path of the variants definition yml
    autoAddMonoVariant: boolean; // Automatically add a mono variant to each asset
    monoVariantName: string // Name of the mono variant variant
    monoVariableMap: { // The names of variables and the value it must get as a mono variant
      default: string,
      [key: string]: string,
    },
  },
  parser: {
    cssVariableAttribute: string; //Name of the aattribute in which the css variable name is annotated to
    cssVariableRegex: string; // Regex to fetch the variable
    svgoPlugins?: string[]; // List of svgo plugins to use
    js2svg: Record<string, any> // js2svg settings
  };
  writer: {
    constPrefix: string; // Name of the constant prefix to use in the definition model
    assetInterfaceName: string; // Name of the Typescript asset interface which will be generated
    variantEnumName: string; //Name of the Typescript variant type which will be generated
  }
}
```

### variants.yml
If you want to use a variants file. Enable the option in the rc file and create a variants map. The key of the svg asset must be the relative path to the configured **input** of the asset.

**Variants yml schema:**
```yml
action/preset.svg: // Relative path of the svg asset
  dark: { //Name of the variant
    --main-color: "#ffccff", // Map of css variables and the associated colors
    --secondary-color: "#aaddee"
  }
```

## Running the tool
# Using the tool
Checkout this repository and run it 😃

## Bash
```shell
./svg-assets-to-typescript.sh .svg-assets-to-typescriptrc.yml .
 ```

# Developing the tool
- Edit the .env-file according to the template and your paths
- Spin up the container

```bash
docker-compose -f docker-compose.development.yml up -d --build --force-recreate --remove-orphans
docker exec -ti svg-assets-to-typescript sh
```

And in the container's terminal:
- Install dependencies
- run the tool
  - `--input`: The root input rc file
  - `--output`: The root output definition model file

```bash
npm install
npm run extract --input=/assets/.svg-assets-to-typescriptrc.yml --output=/output
```
