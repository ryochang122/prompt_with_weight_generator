const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // メインウィンドウを作成
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        titleBarStyle: 'default',
        backgroundColor: '#f8f9fa'
    });

    // index.htmlを読み込む
    mainWindow.loadFile('index.html');

    // 開発者ツールを開く（開発時のみ）
    // mainWindow.webContents.openDevTools();

    // ウィンドウが閉じられた時
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // アプリケーションメニューの設定
    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'Prompt Generator',
            submenu: [
                {
                    label: 'Prompt Generatorについて',
                    role: 'about'
                },
                { type: 'separator' },
                {
                    label: '終了',
                    accelerator: 'Command+Q',
                    click: function () {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '編集',
            submenu: [
                { label: '元に戻す', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'やり直す', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: '切り取り', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'コピー', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '貼り付け', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'すべて選択', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        {
            label: '表示',
            submenu: [
                { label: 'リロード', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: '強制リロード', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { type: 'separator' },
                { label: '拡大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: '縮小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { label: '実際のサイズ', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { type: 'separator' },
                { label: 'フルスクリーン', accelerator: 'Ctrl+Command+F', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'ウィンドウ',
            submenu: [
                { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: '閉じる', accelerator: 'CmdOrCtrl+W', role: 'close' }
            ]
        },
        {
            label: 'ヘルプ',
            submenu: [
                {
                    label: '開発者ツール',
                    accelerator: 'Alt+Command+I',
                    click: function () {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// このメソッドはElectronの初期化が完了し、
// ブラウザウィンドウを作成できる状態になった時に呼ばれます
app.whenReady().then(createWindow);

// すべてのウィンドウが閉じられた時
app.on('window-all-closed', function () {
    // macOS以外では、Cmd+Qで明示的に終了するまでアクティブにする
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // macOSでは、ドックアイコンがクリックされた時に
    // ウィンドウがなければ新しく作成する
    if (mainWindow === null) {
        createWindow();
    }
});
