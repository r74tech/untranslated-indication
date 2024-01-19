// content.js
var scpLinks = [
    "scp-wiki-cn.wikidot.com",
    "scp-cs.wikidot.com",
    "scp-wiki.wikidot.com",
    "scpwiki.com",
    "www.scp-wiki.net",
    "fondationscp.wikidot.com",
    "scp-wiki-de.wikidot.com",
    "scp-int.wikidot.com",
    "fondazionescp.wikidot.com",
    "scp-jp.wikidot.com",
    "ja.scp-wiki.net",
    "scpko.wikidot.com",
    "scp-pl.wikidot.com",
    "scp-pt-br.wikidot.com",
    "scp-ru.wikidot.com",
    "lafundacionscp.wikidot.com",
    "scp-th.wikidot.com",
    "scp-ukrainian.wikidot.com",
    "scp-zh-tr.wikidot.com",
    "scp-vn.wikidot.com",
];


var scpBranches = {
    cn: {
        name: "中文",
        url: "https://scp-wiki-cn.wikidot.com/",
        id: "530812",
        customDomains: [],
    },
    cs: {
        name: "Česky",
        url: "https://scp-cs.wikidot.com/",
        id: "2060442",
        customDomains: [],
    },
    en: {
        name: "English",
        url: "https://scp-wiki.wikidot.com/",
        id: "66711",
        customDomains: [
            "scpwiki.com",
            "www.scp-wiki.net",
        ],
    },
    fr: {
        name: "Français",
        url: "https://fondationscp.wikidot.com/",
        id: "464696",
        customDomains: [],
    },
    de: {
        name: "Deutsch",
        url: "https://scp-wiki-de.wikidot.com/",
        id: "1269857",
        customDomains: [],
    },
    int: {
        name: "International",
        url: "https://scp-int.wikidot.com/",
        id: "1427610",
        customDomains: [],
    },
    it: {
        name: "Italiano",
        url: "https://fondazionescp.wikidot.com/",
        id: "530167",
        customDomains: [],
    },
    jp: {
        name: "日本語",
        url: "https://scp-jp.wikidot.com/",
        id: "578002",
        customDomains: [
            "ja.scp-wiki.net",
        ],
    },
    ko: {
        name: "한국어",
        url: "http://scpko.wikidot.com/",
        id: "486864",
        customDomains: [],
    },
    pl: {
        name: "Polski",
        url: "http://scp-pl.wikidot.com/",
        id: "647733",
        customDomains: [],
    },
    ptbr: {
        name: "Português",
        url: "https://scp-pt-br.wikidot.com/",
        id: "783633",
        customDomains: [],
    },
    ru: {
        name: "Русский",
        url: "http://scp-ru.wikidot.com/",
        id: "169125",
        customDomains: [],
    },
    es: {
        name: "Español",
        url: "http://lafundacionscp.wikidot.com/",
        id: "560484",
        customDomains: [],
    },
    th: {
        name: "ภาษาไทย",
        url: "https://scp-th.wikidot.com/",
        id: "547203",
        customDomains: [],
    },
    ua: {
        name: "Українська",
        url: "https://scp-ukrainian.wikidot.com/",
        id: "1398197",
        customDomains: [],
    },
    "zh-tr": {
        name: "繁體中文",
        url: "https://scp-zh-tr.wikidot.com/",
        id: "3947998",
        customDomains: [],
    },
    vn: {
        name: "Tiếng Việt",
        url: "https://scp-vn.wikidot.com/",
        id: "836589",
        customDomains: [],
    },
};


// ページ内のリンクを探す
var links = Array.from(document.querySelectorAll('#page-content a:not(.tag)'));
var chunkSize = 50; // 各チャンクのサイズ

// SCP関連のドメインかどうかを判断する関数
function isScpRelatedLink(url) {
    const domain = new URL(url).hostname;
    return Object.values(scpBranches).some(branch => {
        return domain === new URL(branch.url).hostname || branch.customDomains.includes(domain);
    });
}

// URLから言語コードを取得する関数
function getLanguageCodeFromUrl(url) {
    const domain = new URL(url).hostname;
    for (const [code, branch] of Object.entries(scpBranches)) {
        if (domain === new URL(branch.url).hostname || branch.customDomains.includes(domain)) {
            return code;
        }
    }
    return null;
}

// チャンクごとに処理する関数
function processChunk(chunk) {
    chrome.storage.sync.get(['selectedLanguages'], function (data) {
        const selectedLanguages = data.selectedLanguages || ["jp"]; // デフォルトは "jp"

        chunk.forEach(function (link) {
            if (isScpRelatedLink(link.href)) {
                const linkLanguageCode = getLanguageCodeFromUrl(link.href);
                if (!selectedLanguages.includes(linkLanguageCode)) {
                    var icon = document.createElement('i');
                    icon.classList.add('fa', 'fa-language');

                    chrome.runtime.sendMessage({ url: link.href }, function (response) {
                        if (response.isTranslated) {
                            icon.style.color = '#b01';
                        } else {
                            icon.style.color = 'grey';
                        }
                    });

                    link.parentNode.insertBefore(icon, link.nextSibling);
                }
            }
        });
    });
}

// チャンクごとに処理を実行
for (let i = 0; i < links.length; i += chunkSize) {
    let chunk = links.slice(i, i + chunkSize);

    // チャンクを処理
    processChunk(chunk);

    // 最後のチャンクに到達したら終了
    if (i + chunkSize >= links.length) {
        break;
    }
}
