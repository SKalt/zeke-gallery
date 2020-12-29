/**
 * @callback Logger
 * @param {string} level
 * @returns {(...msgs: any[]) => void}
 */
/** @type {Logger} */
let logger;
if (window.location.host !== "kaltfam.net") {
  logger = (level) => (...msgs) => console.log(`[${level}]`, ...msgs);
} else {
  logger = () => () => {};
}

/**
 * @function
 * @param {string} text
 * @returns {HTMLTemplateElement}
 */
function stringToTemplate(text) {
  const template = document.createElement("template");
  template.innerHTML = text;
  return template;
}

/**
 * @param {string} id
 * @returns {HTMLElement}
 */
const mustFindById = (id) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`unable to find id '${id}'`);
  return el;
};
/**
 * @param {HTMLElement} el
 * @returns {HTMLAnchorElement}
 */
const mustBeAnchor = (el) => {
  if (!(el instanceof HTMLAnchorElement)) throw new Error(``);
  return el;
};
/**
 * @param {HTMLElement} el
 * @returns {HTMLImageElement}
 */
const mustBeImg = (el) => {
  if (!(el instanceof HTMLImageElement)) throw new Error(``);
  return el;
};
/**
 * @param {HTMLElement} el
 * @returns {HTMLVideoElement}
 */
const mustBeVideo = (el) => {
  if (!(el instanceof HTMLVideoElement)) throw new Error(``);
  return el;
};
const [FirstLink, PrevLink, NextLink, LastLink] = [
  "first",
  "prev",
  "next",
  "last",
]
  .map(mustFindById)
  .map(mustBeAnchor);
const MainImg = mustBeImg(mustFindById("main"));
const MainVideo = mustBeVideo(mustFindById("alt"));

/**
 * @function
 * @template T
 * @param {Array<T>} arr
 * @returns {T|undefined}
 */
const last = (arr) => arr.reverse()[0];

/**
 * @function
 * @param {string} url
 * @returns {string|undefined}
 */
const baseName = (url) => last(url.split("/"));
/**
 * @function
 * @param {string} filename
 * @returns {string}
 */
const getExt = (filename) => last((filename ?? "").split(".")) || "";
const imgExtensions = new Set(["png", "jpg", "jpeg"]);
const videoExtensions = new Set(["mp4"]);
/** @param {string} url */
const isImgUrl = (url) => imgExtensions.has(getExt(url));
/** @param {string} url */
const isVideoUrl = (url) => videoExtensions.has(getExt(url));

/**
 * @returns {Promise<Array<string>>}
 */
async function getImageHrefs() {
  const here = `${location.protocol}//${location.host}/zeke`;
  return fetch(`${here}/img/index.html`)
    .then((response) => response.text())
    .then((text) => text.split("\n").slice(1).join("\n").trim()) // remove the DTD
    .then(stringToTemplate)
    .then((template) => Array.from(template.content.children))
    .then(
      (children) =>
        Array.from(children)
          .map((el) => {
            /** @type {NodeListOf<HTMLAnchorElement>} results */
            const results = el.querySelectorAll("a[href]");
            return results;
          })
          .map((results) => Array.from(results))
          .filter((results) => Boolean(results.length))[0]
    )
    .then((links) => {
      const result = links
        .map((a) => a.href.split("/").slice(4).join("/"))
        .filter((href) => isImgUrl(href) || isVideoUrl(href));
      logger("debug")({ links, hrefs: result });
      return result;
    });
}

/** @param {string} imgName */
const setUrlHash = (imgName) => {
  history.replaceState(null, document.title, `${location.pathname}#${imgName}`);
};

/** @param {string} imgName? */
const setTitle = (imgName) => (document.title = `Zeke gallery: ${imgName}`);

/**
 * react to enter, left, and right arrow keys
 * @param {() => void} incr
 * @param {() => void} decr
 */
const listenForArrowKeys = (incr, decr) => {
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "Enter":
      case "ArrowRight":
        return incr();
      case "ArrowLeft":
        return decr();
    }
  });
};
/**
 *
 * @param {number} min
 * @param {number} max
 * @param {number} initial
 * @param {(n: number) => void} react
 * @returns {[(val: number) => void, () => void, () => void]}
 */
const index = (min = 0, max, initial = min, react) => {
  let value = initial;
  /** @param {number} val */
  const set = (val) => {
    if (val <= max && val >= min) {
      value = val;
      react(value);
    }
  };
  const incr = () => set(value + 1);
  const decr = () => set(value - 1);

  react(value);
  return [set, incr, decr];
};

/** @param {HTMLElement} el */
const hide = (el) => (el.style.display = "none");
/** @param {HTMLElement} el */
const show = (el) => (el.style.display = "block");

/**
 * @param {HTMLAnchorElement} el
 * @param {string} href
 */
const setHref = (el, href) => {
  if (href) el.href = `#${href}`;
  else if (Boolean(el.href)) el.attributes.removeNamedItem("href");
};

/**
 * @param {Array<string>} hrefs
 * @param {number} index
 */
const setButtonLinks = (hrefs, index) => {
  const [prev = "", next = ""] = [
    hrefs[index - 1] || "",
    hrefs[index + 1] || "",
  ].map(baseName);
  setHref(PrevLink, prev);
  setHref(NextLink, next);
};

/** @param {string} href */
const setMainContent = (href) => {
  logger("debug")(`href=${href}`);
  if (isImgUrl(href)) {
    MainImg.src = href;
    hide(MainVideo);
    show(MainImg);
  } else if (isVideoUrl(href)) {
    MainVideo.src = href;
    hide(MainImg);
    show(MainVideo);
  } else {
    throw new Error(`unexpected media: '${href}'`);
  }
};

getImageHrefs().then((hrefs) => {
  /** @param {number} hrefIndex */
  const react = (hrefIndex) => {
    logger("debug")(hrefs, hrefIndex);
    const href = hrefs[hrefIndex];
    setMainContent(href);
    setButtonLinks(hrefs, hrefIndex);
    const imgName = baseName(href) || "";
    setTitle(imgName);
    setUrlHash(imgName);
  };
  const hash = location.hash.replace(/^#/, "");
  let [min, max] = [0, hrefs.length - 1];
  const initial = Math.max(0, hrefs.map(baseName).indexOf(hash));
  const [set, incr, decr] = index(min, max, initial, react);
  FirstLink.href = "#" + baseName(hrefs[min]);
  LastLink.href = "#" + baseName(hrefs[max]);
  /**
   * @param {HTMLElement} el
   * @param {() => void} cb
   */
  const onclick = (el, cb) => el.addEventListener("click", cb);
  onclick(FirstLink, () => set(min));
  onclick(LastLink, () => set(max));
  onclick(MainImg, incr);
  onclick(MainVideo, incr);
  onclick(NextLink, incr);
  onclick(PrevLink, decr);
  listenForArrowKeys(incr, decr);
  return hrefs;
});
