// background.js
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

// IndexedDBのデータベース名とバージョン
const dbName = "SCPDatabase";
const dbVersion = 1;

// IndexedDBデータベースを開く
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = event => {
            reject("Database error: " + event.target.errorCode);
        };

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        // データベースを初期化する
        request.onupgradeneeded = event => {
            const db = event.target.result;
            db.createObjectStore("pages", { keyPath: "id" });
            db.createObjectStore("metadata", { keyPath: "key" });
        };
    });
}

// データをIndexedDBに保存する
async function saveData(branchKey, data) {
    const db = await openDatabase();
    const transaction = db.transaction(["pages"], "readwrite");
    const store = transaction.objectStore("pages");

    store.put({ id: branchKey, data: data });
}

// 最終更新日時をIndexedDBに保存する
async function saveLastUpdated() {
    const db = await openDatabase();
    const transaction = db.transaction(["metadata"], "readwrite");
    const store = transaction.objectStore("metadata");

    store.put({ key: "lastUpdated", value: Date.now() });
}

// 最終更新日時を確認する
async function shouldUpdateData() {
    const db = await openDatabase();
    const transaction = db.transaction(["metadata"], "readonly");
    const store = transaction.objectStore("metadata");
    const request = store.get("lastUpdated");

    return new Promise(resolve => {
        request.onsuccess = event => {
            const lastUpdated = event.target.result?.value;
            const oneDay = 1000 * 60 * 60 * 24;
            resolve(!lastUpdated || (Date.now() - lastUpdated > oneDay));
        };

        request.onerror = () => {
            resolve(true);
        };
    });
}

// ...

// データをIndexedDBに保存し、その後読み取る
async function fetchAndStoreWikidotData() {
    for (const [branchKey, branch] of Object.entries(scpBranches)) {
        console.log(`Fetching data for ${branch.name}...`);
        try {
            const response = await fetch(`https://wikidot.com/quickmodule.php?module=PageLookupQModule&q=_&s=${branch.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const pagePaths = data.pages.map(page => page.unix_name).sort((a, b) => a.localeCompare(b));

            // データを保存
            await saveData(branchKey, pagePaths);

            // 保存したデータを読み取り
            const db = await openDatabase();
            const transaction = db.transaction(["pages"], "readonly");
            const store = transaction.objectStore("pages");
            const request = store.get(branchKey);

            request.onsuccess = function () {
                const storedData = request.result?.data;
                console.log(`Data for ${branchKey} stored. First page:`, storedData ? storedData[0] : "No data");
            };

        } catch (error) {
            console.error(`Error fetching data for ${branchKey}:`, error);
        }
    }

    // 最終更新日時を記録
    await saveLastUpdated();
}


// Chrome拡張機能が起動したときにデータ更新をチェック
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Chrome拡張機能が起動しました。');
    
    // オプションページを開く
    if (details.reason === "install") {
        chrome.runtime.openOptionsPage();
    }

    // 最初の起動時にデフォルト言語を設定
    chrome.storage.sync.get(['selectedLanguages'], function (data) {
        console.log("data", data);
        if (!data.selectedLanguages) {
            chrome.storage.sync.set({ selectedLanguages: ['jp'] }, function () {
                console.log('デフォルト言語設定: jp');
            });
        }
    });

    if (await shouldUpdateData()) {
        fetchAndStoreWikidotData();
    }
});

// URLが翻訳されているかをチェックする
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // URLからドメイン直後の最初のパスセグメントを取得
    const pathSegments = new URL(request.url).pathname.split('/').filter(segment => segment.length > 0);
    const firstPathSegment = pathSegments[0]; // 最初の有効なセグメントを取得

    chrome.storage.sync.get(['selectedLanguages'], async function (data) {
        if (data.selectedLanguages && data.selectedLanguages.length > 0) {
            let isTranslated = false;

            for (const lang of data.selectedLanguages) {
                const db = await openDatabase();
                const transaction = db.transaction(["pages"], "readonly");
                const store = transaction.objectStore("pages");
                const request = store.get(lang);

                await new Promise(resolve => {
                    request.onsuccess = event => {
                        const languageData = event.target.result?.data || [];
                        if (languageData.includes(firstPathSegment)) {
                            isTranslated = true;
                        }
                        resolve();
                    };
                    request.onerror = () => resolve(); // エラー時も解決
                });

                if (isTranslated) break; // 既に翻訳されている場合はループを抜ける
            }

            sendResponse({ isTranslated: isTranslated });
        } else {
            sendResponse({ isTranslated: false });
        }
    });

    return true; // 非同期レスポンスを許可
});

