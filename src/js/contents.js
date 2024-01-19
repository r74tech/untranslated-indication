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

// SCP関連のドメインかどうかを判断する関数
function isScpRelatedLink(url) {
    return scpLinks.some(domain => url.includes(domain));
}

// ページ内のリンクを探す
var links = Array.from(document.querySelectorAll('#page-content a:not(.tag)'));
var chunkSize = 50; // 各チャンクのサイズ

// チャンクごとに処理する関数
function processChunk(chunk) {
    chunk.forEach(function (link) {
        // SCP関連のドメインでない、もしくはchrome.storage.sync.get(['selectedLanguages'])と同じドメインの場合は処理しない
        if (isScpRelatedLink(link.href)) {
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
