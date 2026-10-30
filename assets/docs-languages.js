// Preserve the document section; no network request or persistent tracking.
function updateLanguageLinks(){for(const link of document.querySelectorAll('.language-switch a')){const url=new URL(link.getAttribute('href'),location.href);url.hash=location.hash;link.setAttribute('href',url.pathname.split('/').pop()+url.hash);}}
updateLanguageLinks();addEventListener('hashchange',updateLanguageLinks);
