export function offset(el) {
  return getPosition2(el);
}

function getPosition1(el) {
  let xPos = 0;
  let yPos = 0;
  let width = el.offsetWidth;
  let height = el.offsetHeight;

  while (el) {
    if (el.tagName === 'BODY') {
      // deal with browser quirks with body/window/document and page scroll
      let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      let yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent;
  }
  return {
    left: xPos,
    top: yPos,
    right: xPos + width,
    bottom: yPos + height,
  };
}

function getPosition2(el) {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    right: rect.right + scrollLeft,
    bottom: rect.bottom + scrollTop
  };
}
