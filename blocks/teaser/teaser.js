// /blocks/teaser/teaser.js
export default function decorate(block) {
  // block is <div class="teaser block" data-block-name="teaser" ...>
  // rows -> block.children, cells -> row.children

  const rows = [...block.children];

  // Simplest pattern: first row = image, second row = text/body/CTA, etc.
  const [imageRow, textRow] = rows;

  const img = imageRow?.querySelector('picture, img');
  const heading = textRow?.querySelector('h2, h3, h4');
  const paragraphs = textRow ? [...textRow.querySelectorAll('p')] : [];
  const cta = textRow?.querySelector('a');

  const wrapper = document.createElement('div');
  wrapper.classList.add('teaser-inner');

  const media = document.createElement('div');
  media.classList.add('teaser-media');
  if (img) media.append(img);

  const content = document.createElement('div');
  content.classList.add('teaser-content');
  if (heading) content.append(heading);
  paragraphs.forEach((p) => content.append(p));
  if (cta) {
    cta.classList.add('teaser-cta', 'button');
    content.append(cta);
  }

  wrapper.append(media, content);

  block.textContent = '';
  block.append(wrapper);
}
