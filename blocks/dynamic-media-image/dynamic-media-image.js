function getRowValue(row) {
  const link = row.querySelector('a[href]');
  if (link) {
    return link.href;
  }

  const image = row.querySelector('img[src]');
  if (image) {
    return image.getAttribute('src') || image.src;
  }

  return row.textContent.trim();
}

function isValidInteger(value, min = 1, max = 100000) {
  if (!value) return false;

  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max;
}

function isValidQuality(value) {
  return isValidInteger(value, 1, 100);
}

function isValidCrop(value) {
  if (!value) return false;

  // Examples:
  // 500,500,500,550
  // 0,0,100,100
  // 0%,0%,50%,50%
  return /^[0-9.,%_-]+$/.test(value);
}

function isValidRotation(value) {
  return ['0', '90', '180', '270'].includes(value);
}

function isValidFlip(value) {
  return ['h', 'v', 'hv', 'vh'].includes(value);
}

function buildDynamicMediaUrl(baseValue, options) {
  const url = new URL(baseValue, window.location.origin);

  // This example expects a Dynamic Media with OpenAPI delivery URL.
  const isOpenApiUrl = (
    url.pathname.includes('/adobe/assets/')
    || url.pathname.includes('/adobe/dynamicmedia/')
  );

  if (!isOpenApiUrl) {
    throw new Error(
      `The selected image does not look like a Dynamic Media with OpenAPI URL: ${url}`
    );
  }

  if (isValidInteger(options.width, 1, 100000)) {
    url.searchParams.set('width', options.width);
  }

  if (isValidInteger(options.height, 1, 100000)) {
    url.searchParams.set('height', options.height);
  }

  if (isValidQuality(options.quality)) {
    url.searchParams.set('quality', options.quality);
  }

  if (isValidCrop(options.crop)) {
    url.searchParams.set('crop', options.crop);
  }

  if (isValidRotation(options.rotate)) {
    url.searchParams.set('rotate', options.rotate);
  }

  if (isValidFlip(options.flip)) {
    url.searchParams.set('flip', options.flip);
  }

  if (options.format && ['jpeg', 'jpg', 'png', 'webp', 'avif'].includes(options.format)) {
    url.searchParams.set('format', options.format);
  }

  return url.toString();
}

export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length < 2) {
    console.warn('Dynamic Media Image requires an image and configuration fields.');
    return;
  }

  /*
   * Field order must match _dynamic-media-image.json:
   *
   * 0 image
   * 1 altValue
   * 2 dmWidth
   * 3 dmHeight
   * 4 dmQuality
   * 5 dmCrop
   * 6 dmRotate
   * 7 dmFlip
   * 8 dmFormat
   */

  const imageValue = getRowValue(rows[0]);
  const altValue = getRowValue(rows[1]);
  const width = getRowValue(rows[2]);
  const height = getRowValue(rows[3]);
  const quality = getRowValue(rows[4]);
  const crop = getRowValue(rows[5]);
  const rotate = getRowValue(rows[6]);
  const flip = getRowValue(rows[7]);
  const format = getRowValue(rows[8]);

  if (!imageValue) {
    console.warn('Dynamic Media Image has no selected image.');
    return;
  }

  let finalUrl;

  try {
    finalUrl = buildDynamicMediaUrl(imageValue, {
      width,
      height,
      quality,
      crop,
      rotate,
      flip,
      format,
    });
  } catch (error) {
    console.error(error);
    return;
  }

  const picture = document.createElement('picture');
  const image = document.createElement('img');

  image.src = finalUrl;
  image.alt = altValue || '';
  image.loading = 'lazy';
  image.decoding = 'async';

  picture.append(image);

  // Replace the first authored field with the generated image.
  rows[0].replaceChildren(picture);

  // Hide the configuration values from the visitor-facing page.
  rows.slice(1).forEach((row) => {
    row.hidden = true;
  });

  block.classList.add('dynamic-media-image-built');
}
