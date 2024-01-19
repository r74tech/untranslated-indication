
var scpBranches = {
    cn: {
        name: "中文",
        url: "https://scp-wiki-cn.wikidot.com/",
        customDomains: [],
    },
    cs: {
        name: "Česky",
        url: "https://scp-cs.wikidot.com/",
        customDomains: [],
    },
    en: {
        name: "English",
        url: "https://scp-wiki.wikidot.com/",
        customDomains: [
            "scpwiki.com",
            "www.scp-wiki.net",
        ],
    },
    fr: {
        name: "Français",
        url: "https://fondationscp.wikidot.com/",
        customDomains: [],
    },
    de: {
        name: "Deutsch",
        url: "https://scp-wiki-de.wikidot.com/",
        customDomains: [],
    },
    int: {
        name: "International",
        url: "https://scp-int.wikidot.com/",
        customDomains: [],
    },
    it: {
        name: "Italiano",
        url: "https://fondazionescp.wikidot.com/",
        customDomains: [],
    },
    jp: {
        name: "日本語",
        url: "https://scp-jp.wikidot.com/",
        customDomains: [
            "ja.scp-wiki.net",
        ],
    },
    ko: {
        name: "한국어",
        url: "http://scpko.wikidot.com/",
        customDomains: [],
    },
    pl: {
        name: "Polski",
        url: "http://scp-pl.wikidot.com/",
        customDomains: [],
    },
    ptbr: {
        name: "Português",
        url: "https://scp-pt-br.wikidot.com/",
        customDomains: [],
    },
    ru: {
        name: "Русский",
        url: "http://scp-ru.wikidot.com/",
        customDomains: [],
    },
    es: {
        name: "Español",
        url: "http://lafundacionscp.wikidot.com/",
        customDomains: [],
    },
    th: {
        name: "ภาษาไทย",
        url: "https://scp-th.wikidot.com/",
        customDomains: [],
    },
    ua: {
        name: "Українська",
        url: "https://scp-ukrainian.wikidot.com/",
        customDomains: [],
    },
    "zh-tr": {
        name: "繁體中文",
        url: "https://scp-zh-tr.wikidot.com/",
        customDomains: [],
    },
    vn: {
        name: "Tiếng Việt",
        url: "https://scp-vn.wikidot.com/",
        customDomains: [],
    },
};

// 言語選択のオプションを生成
function populateLanguageOptions() {
    const selectElement = document.getElementById('languageSelect');
    Object.keys(scpBranches).forEach(langCode => {
        const option = document.createElement('option');
        option.value = langCode;
        option.textContent = scpBranches[langCode].name;
        selectElement.appendChild(option);
    });
}

// フォームの送信をハンドル
function handleFormSubmit(event) {
    event.preventDefault();
    const selectedLanguages = Array.from(document.getElementById('languageSelect').selectedOptions).map(option => option.value);
    chrome.storage.sync.set({ selectedLanguages }, function () {
        console.log('設定が保存されました。');
        const messageElement = document.getElementById('message');
        messageElement.classList.remove('is-hidden');
        messageElement.textContent = '設定が保存されました。';
        setTimeout(() => {
            messageElement.classList.add('is-hidden');
        }, 2000);
    });
}

// ページがロードされたときの処理
document.addEventListener('DOMContentLoaded', function () {
    populateLanguageOptions();
    document.getElementById('optionsForm').addEventListener('submit', handleFormSubmit);

    // 既存の選択をロード
    chrome.storage.sync.get(['selectedLanguages'], function (data) {
        if (data.selectedLanguages) {
            const selectElement = document.getElementById('languageSelect');
            data.selectedLanguages.forEach(langCode => {
                const optionElement = selectElement.querySelector(`option[value="${langCode}"]`);
                if (optionElement) optionElement.selected = true;
            });
        }
    });
});
