export function offset(el) {
  return getPosition2(el);
}

export function isVisible(el) {
  if (el) {
    let styleDisplay = el.style.display;
    let styleVisibility = el.style.visibility;
    if (styleDisplay === 'none' || styleVisibility === 'hidden') {
      return false;
    } else {
      const computedStyle = window.getComputedStyle(el, null);
      if (computedStyle) {
        styleDisplay = computedStyle.getPropertyValue('display');
        styleVisibility = computedStyle.getPropertyValue('visibility');
        if (styleDisplay === 'none' || styleVisibility === 'hidden') {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}

// function getPosition1(el) {
//   let xPos = 0;
//   let yPos = 0;
//   let width = el.offsetWidth;
//   let height = el.offsetHeight;
//
//   while (el) {
//     if (el.tagName === 'BODY') {
//       // deal with browser quirks with body/window/document and page scroll
//       let xScroll = window.pageXOffset || document.documentElement.scrollLeft;
//       let yScroll = window.pageYOffset || document.documentElement.scrollTop;
//
//       xPos += (el.offsetLeft - xScroll + el.clientLeft);
//       yPos += (el.offsetTop - yScroll + el.clientTop);
//     } else {
//       // for all other non-BODY elements
//       xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
//       yPos += (el.offsetTop - el.scrollTop + el.clientTop);
//     }
//     el = el.offsetParent;
//   }
//   return {
//     left: xPos,
//     top: yPos,
//     right: xPos + width,
//     bottom: yPos + height,
//   };
// }

function getPosition2(el) {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: (rect.top + scrollTop),
    left: (rect.left + scrollLeft),
    right: rect.right + scrollLeft,
    bottom: rect.bottom + scrollTop
  };
}
