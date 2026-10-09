# 好彼社區 Hubitat — 分工與 Git 流程

兩個人怎麼分工、怎麼用 Git 一起改同一個專案而不互相蓋掉。

開發規範見 [dev-guide.md](dev-guide.md)。

## 目錄

1. [分工](#1-分工)
2. [四條規則](#2-四條規則)
3. [先懂三個詞](#3-先懂三個詞)
4. [只做一次的設定](#4-只做一次的設定)
5. [每做一個頁面的流程](#5-每做一個頁面的流程)
6. [幫對方看 PR](#6-幫對方看-pr)
7. [commit 訊息怎麼寫](#7-commit-訊息怎麼寫)
8. [遇到狀況怎麼辦](#8-遇到狀況怎麼辦)

---

## 1. 分工

依三端切，一人負責一端：

| 誰 | 負責 | 主要會改的地方 |
|---|---|---|
| suzy | 住戶端 | `src/views/resident/`、`src/router/resident.js` |
| 013 | 管委會端 | `src/views/committee/`、`src/router/committee.js` |
| 先不分配 | 管理人員端 | 它和管委會端的分頁相同，等管委會端做出幾頁後，再看哪些畫面可以共用 |

> **為什麼依三端切**：路由和資料夾已經依三端分開，這樣切兩人幾乎不會改到同一個檔案，合併時不容易衝突。

### 共用的東西

| 東西 | 誰負責 | 另一個人要改時 |
|---|---|---|
| 設計 Token（`src/style.css`） | suzy | 先說，單獨開一個 PR |
| 三端設定與外框（`src/config/roles.js`、`src/layouts/`、`src/components/app/` 的外框） | suzy | 先說，單獨開一個 PR |
| 基礎元件（`src/components/ui/`） | suzy | 先說，單獨開一個 PR |
| 假資料（`src/mocks/`） | suzy | 新增可以直接做；修改或刪除既有的要先說 |
| 產品元件（`src/components/report/`、`notice/`、`meeting/` 等） | 誰先用到誰做 | 動手前在群組說一聲「我要做 XXX 元件」，避免兩人各做一個 |
| 規格文件（`docs/`） | 兩人都可以改 | 改規則要對方同意 |

「單獨開一個 PR」的意思是：共用檔案的修改不要和自己頁面的修改混在同一個 PR 裡。

> **為什麼**：共用檔案會影響對方的頁面。單獨一個 PR，對方才看得清楚改了什麼、會不會影響到他。

---

## 2. 四條規則

1. **不直接改 `main`。** `main` 永遠是「可以正常執行」的版本。
2. **一個頁面開一個分支。** 做完就合併、刪掉，下一個頁面再開新的。
3. **對方看過才合併。** 自己不合併自己的 PR。
4. **每次開始工作前，先拿最新的 `main`。**

---

## 3. 先懂三個詞

**分支（branch）**：專案的一份「平行副本」。在分支上怎麼改都不會影響 `main`，做完確定沒問題再合併回去。可以想成：`main` 是正式的報告，分支是你另外複製一份來改的草稿。

**PR（Pull Request）**：在 GitHub 上提出「請把我這個分支合併進 `main`」的請求。對方可以在上面看到你改了哪些地方、留言討論，確認後按下合併。

**衝突（conflict）**：兩個人改了同一個檔案的同一個地方，Git 不知道該留誰的，需要人來決定。照這份流程做，很少會遇到。

還有兩個容易混淆的詞：

- **commit**：把目前的修改存成一個版本，只存在自己的電腦。
- **push**：把自己電腦上的 commit 上傳到 GitHub，對方才看得到。

---

## 4. 只做一次的設定

### suzy 要做的

1. 到 GitHub 的 repo 頁面 → **Settings** → **Collaborators** → **Add people**，輸入 013 的 GitHub 帳號。
2. 013 會收到一封邀請信，接受後才有權限 push 和開 PR。

### 013 要做的

照 [dev-guide.md 第 1 節](dev-guide.md#1-開始之前)把專案抓下來並跑起來。

### 兩個人都要做的

確認 Git 知道你是誰（commit 上會顯示這個名字）：

```bash
git config user.name
```

沒有顯示任何東西的話，設定一下：

```bash
git config --global user.name "你的名字"
```

```bash
git config --global user.email "你註冊 GitHub 的信箱"
```

---

## 5. 每做一個頁面的流程

以「suzy 要做住戶端的我的通報頁」為例。

### 步驟 1：拿最新的 main

```bash
git switch main
```

```bash
git pull
```

- `git switch main`：切換到 `main` 分支。
- `git pull`：把 GitHub 上最新的內容抓下來。

如果終端機提到 `package.json` 有變動，再跑一次 `npm install`。

### 步驟 2：開一個新分支

```bash
git switch -c resident/reports
```

`-c` 是 create，意思是「建立一個新分支並切換過去」。

**分支命名：`哪一端/頁面`**，全小寫英文，和網址一致。

| 要做的事 | 分支名稱 |
|---|---|
| 住戶端・我的通報 | `resident/reports` |
| 管委會端・首頁 | `committee/home` |
| 改共用的東西 | `shared/` 開頭，例如 `shared/badge-colors` |
| 改文件 | `docs/` 開頭，例如 `docs/update-dev-guide` |

想確認自己現在在哪個分支：

```bash
git status
```

第一行會寫 `On branch resident/reports`。VS Code 左下角也會顯示。

### 步驟 3：寫程式，分段 commit

照 [dev-guide.md 第 4 節](dev-guide.md#4-寫一個新頁面的步驟)做頁面。每完成一個小段落就 commit 一次，不用等全部做完。

先看改了哪些檔案：

```bash
git status
```

把要存的檔案加進來（`.` 代表全部）：

```bash
git add .
```

存成一個版本：

```bash
git commit -m "feat: add resident reports page"
```

`git add .` 之前先看一眼 `git status` 的清單，確認沒有不該放進去的檔案（例如吉祥物原圖、自己的筆記）。

### 步驟 4：push 到 GitHub

這個分支第一次 push：

```bash
git push -u origin resident/reports
```

之後同一個分支再 push，只要：

```bash
git push
```

還沒做完也可以 push，當作備份。

### 步驟 5：開 PR

做完並通過 [dev-guide.md 的檢查清單](dev-guide.md#步驟-6交出去之前自己檢查)後：

1. 打開 GitHub 的 repo 頁面，上方會出現黃色提示「resident/reports had recent pushes」，按 **Compare & pull request**。
2. 填寫標題和說明（格式見下方）。
3. 右邊 **Reviewers** 選對方。
4. 按 **Create pull request**。
5. 在群組跟對方說一聲，貼上 PR 的連結。

**PR 標題**：和 commit 訊息一樣的寫法，例如 `feat: add resident reports page`。

**PR 說明**照這個格式寫：

```markdown
## 做了什麼
住戶端「我的通報」頁，列出進行中和已完成的通報。

## 怎麼看
打開 /resident/reports

## 截圖
（貼上手機寬度的截圖）

## 要注意的地方
- 新增了 ReportCard 的 Full 版
- 「已完成」的徽章顏色還沒定案，先用 default
```

「要注意的地方」寫這些：有沒有改到共用的檔案、有沒有和設計稿不一樣的地方、有沒有碰到[尚未定案的事](dev-guide.md#8-尚未定案的事)。沒有就寫「無」。

### 步驟 6：等對方看，照意見修改

對方留言要你修改時，**在同一個分支繼續改**，commit 後再 push，PR 會自動更新，不用重新開。

```bash
git add .
```

```bash
git commit -m "fix: adjust report card spacing"
```

```bash
git push
```

### 步驟 7：合併

對方按下 **Approve** 之後，由**對方**按 **Merge pull request**，合併後按 **Delete branch** 把 GitHub 上的分支刪掉。

### 步驟 8：回到 main，準備下一個頁面

```bash
git switch main
```

```bash
git pull
```

刪掉自己電腦上已經合併的分支：

```bash
git branch -d resident/reports
```

然後回到步驟 2 開下一個分支。

---

## 6. 幫對方看 PR

收到對方的 PR 時，盡量在一天內看完，不要讓對方卡住。

### 怎麼看

1. 打開 PR，點 **Files changed** 分頁，看改了哪些地方（紅色是刪掉的，綠色是新增的）。
2. 把對方的分支抓下來實際跑跑看：

```bash
git fetch
```

```bash
git switch resident/reports
```

```bash
npm run dev
```

3. 看完後切回自己原本的分支：

```bash
git switch committee/home
```

### 看什麼

不用逐行檢查，看這幾件事就好：

- [ ] 畫面在手機寬度看起來正常，可以點的東西都點得到
- [ ] 有沒有改到共用的檔案？有的話，自己的頁面有沒有受影響
- [ ] 有沒有照 [dev-guide.md](dev-guide.md) 的規則（命名、語意色、從假 API 拿資料）
- [ ] 有沒有看不懂的地方？看不懂就問，這也是互相學習的機會

### 怎麼回覆

在 **Files changed** 分頁右上角按 **Review changes**：

- **Approve**：沒問題，可以合併。接著按 **Merge pull request**。
- **Request changes**：有一定要改的地方，寫清楚哪裡、為什麼。
- **Comment**：只是提問或建議，不擋合併。

想針對某一行留言，把滑鼠移到那一行左邊，按出現的 **＋**。

留言時說明原因，不要只寫「這裡改一下」。例如：「這裡的顏色寫了色號，dev-guide 第 5 節說要用語意色，可以改成 `text-muted-foreground` 嗎？」

---

## 7. commit 訊息怎麼寫

用英文、簡短，格式是 `類型: 做了什麼`。

| 類型 | 什麼時候用 | 例子 |
|---|---|---|
| `feat` | 新增功能或畫面 | `feat: add resident reports page` |
| `fix` | 修正錯誤 | `fix: wrong link on report card` |
| `refactor` | 整理程式，畫面和功能不變 | `refactor: split routes into per-role page lists` |
| `docs` | 只改文件 | `docs: add git workflow` |
| `chore` | 設定、套件等雜事 | `chore: add tailwindcss` |

- 冒號後面用動詞開頭（`add`、`fix`、`update`、`remove`），全小寫，結尾不加句點。
- 一個 commit 只做一件事。訊息裡需要寫「and」時，通常代表應該拆成兩個。

---

## 8. 遇到狀況怎麼辦

### 我不小心在 main 上改了東西（還沒 commit）

直接開一個新分支，修改會跟著過去：

```bash
git switch -c resident/reports
```

### 我不小心在 main 上 commit 了（還沒 push）

先不要 push，也不要自己嘗試復原，跟對方說，一起處理。

### 我做到一半，對方合併了新的東西到 main

想把最新的 `main` 拿進自己的分支：

```bash
git switch main
```

```bash
git pull
```

```bash
git switch resident/reports
```

```bash
git merge main
```

沒有衝突的話會自動完成。

### 出現衝突（conflict）

終端機會寫 `CONFLICT`，並列出哪些檔案有衝突。用 VS Code 打開那個檔案，會看到：

```
<<<<<<< HEAD
我的版本
=======
對方的版本
>>>>>>> main
```

VS Code 會在上方顯示按鈕：**Accept Current Change**（留我的）、**Accept Incoming Change**（留對方的）、**Accept Both Changes**（兩個都留）。

1. 每一處衝突都選好之後存檔。
2. 確認畫面還能正常執行。
3. 完成合併：

```bash
git add .
```

```bash
git commit -m "chore: merge main"
```

**不確定該留哪一個時，不要猜**，找對方一起看。衝突的地方代表兩個人都改過，只有兩個人一起才知道該怎麼留。

### 我想放棄某個檔案的修改，回到上次 commit 的樣子

```bash
git restore src/views/resident/ReportsView.vue
```

這個動作無法復原，修改會直接消失，執行前先確定。

### 我不知道現在是什麼狀況

```bash
git status
```

它會告訴你在哪個分支、改了哪些檔案、下一步可以做什麼。看不懂就把內容貼給對方，或貼給 Claude 問。

### 不要自己執行的指令

下面這些會改寫紀錄或強制覆蓋，用錯會讓對方的東西不見。需要用到時先找對方討論：

- `git push --force`（或 `-f`）
- `git reset --hard`
- `git rebase`
