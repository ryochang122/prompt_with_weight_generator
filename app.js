// アプリケーションの状態管理
class PromptGenerator {
    constructor() {
        this.tags = [];
        this.promptParts = []; // プロンプトの各パーツを保存
        this.currentTag = null;

        // DOM要素の取得
        this.promptArea = document.getElementById('promptArea');
        this.tagsList = document.getElementById('tagsList');
        this.tagNameInput = document.getElementById('tagName');
        this.tagCategoryInput = document.getElementById('tagCategory');
        this.addTagButton = document.getElementById('addTagButton');
        this.copyButton = document.getElementById('copyButton');

        // モーダル関連
        this.modal = document.getElementById('weightModal');
        this.modalTagName = document.getElementById('modalTagName');
        this.weightInput = document.getElementById('weightInput');
        this.insertButton = document.getElementById('insertButton');
        this.cancelButton = document.getElementById('cancelButton');
        this.closeButton = document.querySelector('.close');

        // イベントリスナーの設定
        this.setupEventListeners();

        // ローカルストレージからタグを読み込み
        this.loadTags();

        // 初期表示
        this.renderTags();
    }

    setupEventListeners() {
        // タグ追加
        this.addTagButton.addEventListener('click', () => this.addTag());
        this.tagNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });
        this.tagCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTag();
        });

        // コピー機能
        this.copyButton.addEventListener('click', () => this.copyToClipboard());

        // モーダル関連
        this.closeButton.addEventListener('click', () => this.closeModal());
        this.cancelButton.addEventListener('click', () => this.closeModal());
        this.insertButton.addEventListener('click', () => this.insertTag());

        // モーダル外をクリックで閉じる
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Enterキーで挿入
        this.weightInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.insertTag();
        });
    }

    // ローカルストレージからタグを読み込み
    loadTags() {
        const savedTags = localStorage.getItem('promptTags');
        if (savedTags) {
            this.tags = JSON.parse(savedTags);
        }
    }

    // ローカルストレージにタグを保存
    saveTags() {
        localStorage.setItem('promptTags', JSON.stringify(this.tags));
    }

    // タグを追加
    addTag() {
        const name = this.tagNameInput.value.trim();
        const category = this.tagCategoryInput.value.trim();

        if (!name) {
            alert('タグ名を入力してください');
            return;
        }

        if (!category) {
            alert('カテゴリを入力してください');
            return;
        }

        // 重複チェック
        const exists = this.tags.some(tag => tag.name === name && tag.category === category);
        if (exists) {
            alert('同じタグが既に登録されています');
            return;
        }

        // タグを追加
        this.tags.push({ name, category });
        this.saveTags();
        this.renderTags();

        // フォームをクリア
        this.tagNameInput.value = '';
        this.tagCategoryInput.value = '';
        this.tagNameInput.focus();
    }

    // タグを削除
    deleteTag(index) {
        if (confirm('このタグを削除しますか？')) {
            this.tags.splice(index, 1);
            this.saveTags();
            this.renderTags();
        }
    }

    // タグ一覧を表示
    renderTags() {
        this.tagsList.innerHTML = '';

        if (this.tags.length === 0) {
            this.tagsList.innerHTML = '<p style="color: #6c757d; padding: 10px;">タグが登録されていません</p>';
            return;
        }

        this.tags.forEach((tag, index) => {
            const button = document.createElement('button');
            button.className = 'tag-button';
            button.innerHTML = `
                ${tag.name}
                <span class="tag-category">${tag.category}</span>
                <span class="delete-tag">×</span>
            `;

            // タグクリックでモーダル表示
            button.addEventListener('click', (e) => {
                // 削除ボタンのクリック判定
                if (e.target.classList.contains('delete-tag')) {
                    e.stopPropagation();
                    this.deleteTag(index);
                } else {
                    this.openModal(tag);
                }
            });

            this.tagsList.appendChild(button);
        });
    }

    // モーダルを開く
    openModal(tag) {
        this.currentTag = tag;
        this.modalTagName.textContent = `タグ: ${tag.name}`;
        this.weightInput.value = '';
        this.modal.style.display = 'block';
        this.weightInput.focus();
    }

    // モーダルを閉じる
    closeModal() {
        this.modal.style.display = 'none';
        this.currentTag = null;
        this.weightInput.value = '';
    }

    // タグをプロンプトに挿入
    insertTag() {
        if (!this.currentTag) return;

        const weight = this.weightInput.value.trim();
        let tagText = '';

        // 重みのバリデーション
        if (weight !== '') {
            const weightNum = parseFloat(weight);
            if (isNaN(weightNum) || weightNum < 0 || weightNum > 2.0) {
                alert('重みは0.0から2.0の範囲で入力してください');
                return;
            }
            tagText = `(${this.currentTag.name}:${weightNum.toFixed(1)})`;
        } else {
            tagText = this.currentTag.name;
        }

        // 既存のタグを探す
        const existingIndex = this.promptParts.findIndex(part => part.tag === this.currentTag.name);

        if (existingIndex !== -1) {
            // 既存のタグを置き換える
            this.promptParts[existingIndex] = {
                text: tagText,
                category: this.currentTag.category,
                tag: this.currentTag.name
            };
        } else {
            // 新規追加
            this.promptParts.push({
                text: tagText,
                category: this.currentTag.category,
                tag: this.currentTag.name
            });
        }

        // プロンプトを再生成
        this.generatePrompt();

        // モーダルを閉じる
        this.closeModal();
    }

    // プロンプトを生成（カテゴリ別にソート）
    generatePrompt() {
        // カテゴリ別にグループ化
        const groupedByCategory = {};

        this.promptParts.forEach(part => {
            if (!groupedByCategory[part.category]) {
                groupedByCategory[part.category] = [];
            }
            groupedByCategory[part.category].push(part.text);
        });

        // カテゴリをソートして、各カテゴリ内のタグを結合
        const sortedCategories = Object.keys(groupedByCategory).sort();
        const promptText = sortedCategories
            .map(category => groupedByCategory[category].join(', '))
            .join('\n');

        this.promptArea.value = promptText;
    }

    // クリップボードにコピー
    async copyToClipboard() {
        const text = this.promptArea.value;

        if (!text) {
            alert('コピーするプロンプトがありません');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);

            // コピー成功のフィードバック
            const originalText = this.copyButton.textContent;
            this.copyButton.textContent = '✓ コピーしました！';
            this.copyButton.style.background = '#28a745';

            setTimeout(() => {
                this.copyButton.textContent = originalText;
                this.copyButton.style.background = '#667eea';
            }, 2000);
        } catch (err) {
            console.error('コピーに失敗しました:', err);
            alert('クリップボードへのコピーに失敗しました');
        }
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new PromptGenerator();
});
