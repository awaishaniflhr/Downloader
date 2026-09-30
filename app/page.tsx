"use client";

import { useState, type FormEvent } from "react";

type Format = "mp4" | "mp3";
type Notice = { tone: "error" | "info"; message: string } | null;

const SUPPORTED_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "facebook.com",
  "fb.watch",
  "instagram.com",
];

function isSupportedLink(value: string) {
  try {
    const normalized = value.includes("://") ? value : `https://${value}`;
    const hostname = new URL(normalized).hostname.toLowerCase().replace(/^www\./, "");
    return SUPPORTED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<Format>("mp4");
  const [notice, setNotice] = useState<Notice>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = url.trim();

    if (!isSupportedLink(trimmed)) {
      setNotice({ tone: "error", message: "Enter a valid YouTube, TikTok, Facebook, or Instagram link." });
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setNotice({ tone: "error", message: "Download server isn't configured yet." });
      return;
    }

    setIsDownloading(true);
    setNotice({
      tone: "info",
      message: "Preparing your file — this can take up to a minute if the server was idle.",
    });

    const encodedUrl = encodeURIComponent(trimmed);
    const downloadUrl = `${apiUrl}/download?url=${encodedUrl}&format=${format}`;

    // Trigger the browser's download via a hidden link instead of full navigation,
    // so the page (and this loading state) stays visible while it downloads.
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // We can't know exactly when the download finishes, so clear the loading
    // state after a reasonable window.
    window.setTimeout(() => {
      setIsDownloading(false);
      setNotice({ tone: "info", message: "If nothing downloaded, check the link and try again." });
    }, 15000);
  }

  function updateUrl(value: string) {
    setUrl(value);
    setNotice(null);
  }

  function updateFormat(value: Format) {
    setFormat(value);
    setNotice(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Frame home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>frame</span>
        </a>
        <span className="topbar-note"><span className="status-dot" /> VIDEO TOOL</span>
      </header>

      <main className="main-content" id="home">
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow"><span className="eyebrow-line" /> FOR THE CLIPS YOU LOVE</div>
          <h1 id="page-title">Video, in the<br />format you want.</h1>
          <p className="intro-copy">Bring a link. Choose your format. Keep what matters.</p>
          <div className="source-list" aria-label="Supported platforms">
            <span className="source-item"><span className="youtube-mark" aria-hidden="true">▶</span> YouTube</span>
            <span className="source-divider" />
            <span className="source-item"><span className="tiktok-mark" aria-hidden="true">♪</span> TikTok</span>
          </div>
          <div className="decorative-rule" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
        </section>

        <section className="download-panel" aria-label="Download settings">
          <div className="panel-heading">
            <span className="panel-index">01</span>
            <h2>Start with a link</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label className="field-label" htmlFor="video-url">Video URL</label>
            <div className={`url-field${notice?.tone === "error" ? " has-error" : ""}`}>
              <svg className="link-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M8.1 11.9 11.9 8.1m-5.4 5.4-1.1 1.1a3.18 3.18 0 0 1-4.5-4.5l3-3a3.18 3.18 0 0 1 4.5 0m1.6-1.6 1.1-1.1a3.18 3.18 0 0 1 4.5 4.5l-3 3a3.18 3.18 0 0 1-4.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="video-url"
                name="video-url"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="Paste a YouTube or TikTok link"
                value={url}
                onChange={(event) => updateUrl(event.target.value)}
                aria-invalid={notice?.tone === "error"}
                aria-describedby={notice ? "form-notice" : "url-hint"}
              />
              {url && (
                <button className="clear-button" type="button" onClick={() => updateUrl("")} aria-label="Clear URL">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              )}
            </div>
            {notice ? (
              <p className={`form-notice ${notice.tone}`} id="form-notice" role="status">{notice.message}</p>
            ) : (
              <p className="field-hint" id="url-hint">youtube.com · youtu.be · tiktok.com</p>
            )}

            <fieldset className="format-fieldset">
              <legend className="field-label">Choose a format</legend>
              <div className="format-options">
                <button
                  className={`format-option${format === "mp4" ? " selected" : ""}`}
                  type="button"
                  onClick={() => updateFormat("mp4")}
                  aria-pressed={format === "mp4"}
                >
                  <span className="format-icon video-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none"><rect x="2.75" y="4" width="10.5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="m13.25 8 4-2v8l-4-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="format-text"><strong>MP4</strong><small>Video</small></span>
                  <span className="selection-indicator" aria-hidden="true" />
                </button>
                <button
                  className={`format-option${format === "mp3" ? " selected" : ""}`}
                  type="button"
                  onClick={() => updateFormat("mp3")}
                  aria-pressed={format === "mp3"}
                >
                  <span className="format-icon audio-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none"><path d="M11.5 4v10.25a2.25 2.25 0 1 1-1.5-2.12V6l7-1.75v8a2.25 2.25 0 1 1-1.5-2.12V3l-4 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="format-text"><strong>MP3</strong><small>Audio</small></span>
                  <span className="selection-indicator" aria-hidden="true" />
                </button>
              </div>
            </fieldset>

            <button className="download-button" type="submit" disabled={isDownloading}>
              <span>{isDownloading ? "Preparing…" : `Download ${format.toUpperCase()}`}</span>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2.75v9m0 0 3.5-3.5M10 11.75l-3.5-3.5M3.5 13.25v2.5c0 .55.45 1 1 1h11c.55 0 1-.45 1-1v-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>

          <div className="panel-footnote"><span className="footnote-mark" aria-hidden="true">↳</span> Please respect the creator’s rights.</div>
        </section>
      </main>

      <footer className="footer">
        <span>FRAME <span className="footer-dot">/</span> VIDEO TOOLS</span>
        <span>Made for the moments worth keeping.</span>
      </footer>
    </div>
  );
}



// "use client";

// import { useState, type FormEvent } from "react";

// type Format = "mp4" | "mp3";
// type Notice = { tone: "error" | "info"; message: string } | null;

// function isSupportedLink(value: string) {
//   try {
//     const normalized = value.includes("://") ? value : `https://${value}`;
//     const hostname = new URL(normalized).hostname.toLowerCase().replace(/^www\./, "");
//     return ["youtube.com", "youtu.be", "tiktok.com"].some(
//       (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
//     );
//   } catch {
//     return false;
//   }
// }

// export default function Home() {
//   const [url, setUrl] = useState("");
//   const [format, setFormat] = useState<Format>("mp4");
//   const [notice, setNotice] = useState<Notice>(null);

//   function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (!isSupportedLink(url.trim())) {
//       setNotice({ tone: "error", message: "Enter a valid YouTube or TikTok link." });
//       return;
//     }

//     setNotice({
//       tone: "info",
//       message: "Your link is ready. Connect a download service to prepare the file.",
//     });
//   }

//   function updateUrl(value: string) {
//     setUrl(value);
//     setNotice(null);
//   }

//   function updateFormat(value: Format) {
//     setFormat(value);
//     setNotice(null);
//   }

//   return (
//     <div className="app-shell">
//       <header className="topbar">
//         <a className="brand" href="#home" aria-label="Frame home">
//           <span className="brand-mark" aria-hidden="true">
//             <span />
//           </span>
//           <span>frame</span>
//         </a>
//         <span className="topbar-note"><span className="status-dot" /> VIDEO TOOL</span>
//       </header>

//       <main className="main-content" id="home">
//         <section className="intro" aria-labelledby="page-title">
//           <div className="eyebrow"><span className="eyebrow-line" /> FOR THE CLIPS YOU LOVE</div>
//           <h1 id="page-title">Video, in the<br />format you want.</h1>
//           <p className="intro-copy">Bring a link. Choose your format. Keep what matters.</p>
//           <div className="source-list" aria-label="Supported platforms">
//             <span className="source-item"><span className="youtube-mark" aria-hidden="true">▶</span> YouTube</span>
//             <span className="source-divider" />
//             <span className="source-item"><span className="tiktok-mark" aria-hidden="true">♪</span> TikTok</span>
//           </div>
//           <div className="decorative-rule" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
//         </section>

//         <section className="download-panel" aria-label="Download settings">
//           <div className="panel-heading">
//             <span className="panel-index">01</span>
//             <h2>Start with a link</h2>
//           </div>

//           <form onSubmit={handleSubmit} noValidate>
//             <label className="field-label" htmlFor="video-url">Video URL</label>
//             <div className={`url-field${notice?.tone === "error" ? " has-error" : ""}`}>
//               <svg className="link-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
//                 <path d="M8.1 11.9 11.9 8.1m-5.4 5.4-1.1 1.1a3.18 3.18 0 0 1-4.5-4.5l3-3a3.18 3.18 0 0 1 4.5 0m1.6-1.6 1.1-1.1a3.18 3.18 0 0 1 4.5 4.5l-3 3a3.18 3.18 0 0 1-4.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//               </svg>
//               <input
//                 id="video-url"
//                 name="video-url"
//                 type="url"
//                 inputMode="url"
//                 autoComplete="url"
//                 placeholder="Paste a YouTube or TikTok link"
//                 value={url}
//                 onChange={(event) => updateUrl(event.target.value)}
//                 aria-invalid={notice?.tone === "error"}
//                 aria-describedby={notice ? "form-notice" : "url-hint"}
//               />
//               {url && (
//                 <button className="clear-button" type="button" onClick={() => updateUrl("")} aria-label="Clear URL">
//                   <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
//                 </button>
//               )}
//             </div>
//             {notice ? (
//               <p className={`form-notice ${notice.tone}`} id="form-notice" role="status">{notice.message}</p>
//             ) : (
//               <p className="field-hint" id="url-hint">youtube.com · youtu.be · tiktok.com</p>
//             )}

//             <fieldset className="format-fieldset">
//               <legend className="field-label">Choose a format</legend>
//               <div className="format-options">
//                 <button
//                   className={`format-option${format === "mp4" ? " selected" : ""}`}
//                   type="button"
//                   onClick={() => updateFormat("mp4")}
//                   aria-pressed={format === "mp4"}
//                 >
//                   <span className="format-icon video-icon" aria-hidden="true">
//                     <svg viewBox="0 0 20 20" fill="none"><rect x="2.75" y="4" width="10.5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="m13.25 8 4-2v8l-4-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
//                   </span>
//                   <span className="format-text"><strong>MP4</strong><small>Video</small></span>
//                   <span className="selection-indicator" aria-hidden="true" />
//                 </button>
//                 <button
//                   className={`format-option${format === "mp3" ? " selected" : ""}`}
//                   type="button"
//                   onClick={() => updateFormat("mp3")}
//                   aria-pressed={format === "mp3"}
//                 >
//                   <span className="format-icon audio-icon" aria-hidden="true">
//                     <svg viewBox="0 0 20 20" fill="none"><path d="M11.5 4v10.25a2.25 2.25 0 1 1-1.5-2.12V6l7-1.75v8a2.25 2.25 0 1 1-1.5-2.12V3l-4 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
//                   </span>
//                   <span className="format-text"><strong>MP3</strong><small>Audio</small></span>
//                   <span className="selection-indicator" aria-hidden="true" />
//                 </button>
//               </div>
//             </fieldset>

//             <button className="download-button" type="submit">
//               <span>Download {format.toUpperCase()}</span>
//               <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2.75v9m0 0 3.5-3.5M10 11.75l-3.5-3.5M3.5 13.25v2.5c0 .55.45 1 1 1h11c.55 0 1-.45 1-1v-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
//             </button>
//           </form>

//           <div className="panel-footnote"><span className="footnote-mark" aria-hidden="true">↳</span> Please respect the creator’s rights.</div>
//         </section>
//       </main>

//       <footer className="footer">
//         <span>FRAME <span className="footer-dot">/</span> VIDEO TOOLS</span>
//         <span>Made for the moments worth keeping.</span>
//       </footer>
//     </div>
//   );
// }
