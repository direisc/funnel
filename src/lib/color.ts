type HSL = {
  hue: number;
  saturation: number;
  lightness: number;
};

type Shade = {
  name: string;
  hexcode: string;
  hsl: HSL;
  cw?: number;
  cb?: number;
};
const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const rgbToHsl = (r: number, g: number, b: number): { hue: number; saturation: number; lightness: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    hue: parseFloat((h * 360).toFixed(2)),
    saturation: parseFloat((s * 100).toFixed(2)),
    lightness: parseFloat((l * 100).toFixed(2)),
  };
};

const hslToHex = (h: number, s: number, l: number): string => {
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  };

  const [r, g, b] = hslToRgb(h, s / 100, l / 100);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const luminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

const contrastRatio = (hex1: string, hex2: string): number => {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = luminance(r1, g1, b1) + 0.05;
  const l2 = luminance(r2, g2, b2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
};

const __generateScale = (baseHex: string): Shade[] => {
  const baseHsl = rgbToHsl(...hexToRgb(baseHex));
  const lightnessSteps = [90, 82, 74, 66, 58, 50, 42, 34, 26, 18];
  const saturationSteps = [95, 92, 89, 86, 83, 80, 78, 76, 74, 72];

  const scale: Shade[] = lightnessSteps.map((lightness, index) => {
    const saturation =
      (baseHsl.saturation * saturationSteps[index]) / 100;
    const hex = hslToHex(baseHsl.hue, saturation, lightness);

    return {
      name: `${50 + index * 100}`,
      hexcode: hex,
      hsl: { hue: baseHsl.hue, saturation: Math.round(saturation), lightness },
    };
  });

  return scale.map(
    (shade) => ({...shade, cw: contrastRatio(shade.hexcode, "#ffffff"), cb: contrastRatio(shade.hexcode, "#000000")})
  );
};

// Example usage
const baseColor = "#ef4e74";
// const scale = generateScale(baseColor);
// console.log(scale);

// const colors = ["#fff1f3", "#fee5e9", "#fccfd7", "#faa7b6", "#f77590", "#ef4e74", "#db2358", "#b81849", "#9a1743", "#84173f", "#4a071e"]
// const colors =    ["#fbf4f9", "#f9eaf5", "#f5d5ec", "#edb4dc", "#e185c3", "#d460ab", "#be3e8b", "#a63074", "#8a2a60", "#742752", "#45122e"]
// console.log(JSON.stringify(
//   colors.map((c) => ({ hex: c, hsl: rgbToHsl(...hexToRgb(c))})), null, 2
// ))

// console.log({
//   hex: baseColor,
//   // rgb: hexToRgb(baseColor),
//   hsl: rgbToHsl(...hexToRgb(baseColor)),
// })

type ColorScale = Record<string, string>;

function findClosestIndex(arr: number[], target: number): number {
  let closestIndex = 0;
  let closestDiff = Math.abs(arr[0] - target);

  for (let i = 1; i < arr.length; i++) {
    const diff = Math.abs(arr[i] - target);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }

  return closestIndex;
}

function generateScale(baseColor: string, numberOfSteps = 11): ColorScale {
  const scaleStops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  // const hslBase = tinycolor(baseColor).toHsl();
  const hslBase = rgbToHsl(...hexToRgb(baseColor));
  const result: ColorScale = {};

  const _lightnessSteps = [97, 95, 90, 82, 71, 62, 50, 41, 35, 30, 16]
  const saturationSteps = [100, 93, 88, 89, 89, 83, 72, 77, 74, 70, 83]


  const closestLigtness = findClosestIndex(_lightnessSteps, hslBase.lightness)
  const diff = hslBase.lightness - _lightnessSteps[closestLigtness]
  const lightnessSteps = _lightnessSteps.map((l) => parseFloat((l + diff).toFixed(2)))

  let hue = hslBase.hue + closestLigtness
  for (let i = 0; i < numberOfSteps; i++) {
    const lightness = lightnessSteps[i];
    const saturation = saturationSteps[i];


    result[scaleStops[i]] = hslToHex(hue, saturation , lightness ) //+ `__${hue}:${saturation}:${lightness}`
    --hue
  }

  return result;
}

// Example usage
const exampleSlate = generateScale('#636462'); // Pass a base color
console.log(exampleSlate);

// #ef4e74 346, 83, 62
// #ef4e73 346, 83, 62

// const lightnessSteps = [96, 92, 86, 75, 63, 50, 38, 27, 19, 12, 8]; // Example lightness values
// const saturationSteps = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]; // Example saturation values
// const saturationSteps = [100,
//   93,
//   88,
//   89,
//   89,
//   83,
//   72,
//   77,
//   74,
//   70,
//   83]



// const avg = lightnessSteps.map((l, i) => (l + saturationSteps[i])/2)
// console.log(avg)
// const lightnessSteps =    [90, 82, 74, 66, 58, 50, 42, 34, 26, 18]
//   const saturationSteps = [95, 92, 89, 86, 83, 80, 78, 76, 74, 72]
//                                                V
// const lightnessSteps =   [97, 95, 90, 82, 71, 62, 50, 41, 35, 30, 16]
//                             2 - 5 - 8 - 11 - 9 - 8 - 9 - 6 - 5 - 14
// const saturationSteps = [100, 93, 88, 89, 89, 83, 72, 77, 74, 70, 83]
// [
//   { hex: '#fff1f3', hsl: { hue: 351, saturation: 100, lightness: 97 } },
//   { hex: '#fee5e9', hsl: { hue: 350, saturation: 93, lightness: 95 } },
//   { hex: '#fccfd7', hsl: { hue: 349, saturation: 88, lightness: 90 } },
//   { hex: '#faa7b6', hsl: { hue: 349, saturation: 89, lightness: 82 } },
//   { hex: '#f77590', hsl: { hue: 348, saturation: 89, lightness: 71 } },
//   { hex: '#ef4e74', hsl: { hue: 346, saturation: 83, lightness: 62 } },
//   { hex: '#db2358', hsl: { hue: 343, saturation: 72, lightness: 50 } },
//   { hex: '#b81849', hsl: { hue: 342, saturation: 77, lightness: 41 } },
//   { hex: '#9a1743', hsl: { hue: 340, saturation: 74, lightness: 35 } },
//   { hex: '#84173f', hsl: { hue: 338, saturation: 70, lightness: 30 } },
//   { hex: '#4a071e', hsl: { hue: 339, saturation: 83, lightness: 16 } }
// ]

// {
//   '50': '#fff1f3',
//   '100': '#fee7eb',
//   '200': '#fcd0d8',
//   '300': '#faa9b9',
//   '400': '#f77491',
//   '500': '#ef4e74',
//   '600': '#db2453',
//   '700': '#ba1844',
//   '800': '#9c173d',
//   '900': '#831738',
//   '950': '#4b071d'
// }
// {
//   50: '#fff0f2', // '351:100:97',
//   100: '#fee6ea', // '350:93:95',
//   200: '#fccfd7', // '349:88:90',
//   300: '#faa8b9', // '348:89:82',
//   400: '#f77390', // '347:89:71',
//   500: '#ef4e73', // '346:83:62',
//   600: '#db2452', // '345:72:50',
//   700: '#b91843', // '344:77:41',
//   800: '#9b173d', // '343:74:35',
//   900: '#821737', // '342:70:30',
//   950: '#4b071c', // '341:83:16'
// }

// const lightnessSteps =    [90, 82, 74, 66, 58, 50, 42, 34, 26, 18]
//   const saturationSteps = [95, 92, 89, 86, 83, 80, 78, 76, 74, 72]
//                                                   V
// const lightnessSteps =   [97, 95, 90, 82, 70, 60, 49, 42, 35, 30, 17]
//                            2 - 5 - 8 - 8 - 10 - 11 - 7 - 7 - 5 - 13
// const saturationSteps =  [47, 56, 62, 61, 61, 57, 51, 55, 53, 50, 59]
// [
//   { hex: '#fbf4f9', hsl: { hue: 317, saturation: 47, lightness: 97 } },
//   { hex: '#f9eaf5', hsl: { hue: 316, saturation: 56, lightness: 95 } },
//   { hex: '#f5d5ec', hsl: { hue: 317, saturation: 62, lightness: 90 } },
//   { hex: '#edb4dc', hsl: { hue: 318, saturation: 61, lightness: 82 } },
//   { hex: '#e185c3', hsl: { hue: 320, saturation: 61, lightness: 70 } },
//   { hex: '#d460ab', hsl: { hue: 321, saturation: 57, lightness: 60 } },
//   { hex: '#be3e8b', hsl: { hue: 324, saturation: 51, lightness: 49 } },
//   { hex: '#a63074', hsl: { hue: 325, saturation: 55, lightness: 42 } },
//   { hex: '#8a2a60', hsl: { hue: 326, saturation: 53, lightness: 35 } },
//   { hex: '#742752', hsl: { hue: 326, saturation: 50, lightness: 30 } },
//   { hex: '#45122e', hsl: { hue: 327, saturation: 59, lightness: 17 } }
// ]


