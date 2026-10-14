# 好彼社區 Hubitat — 分工與 Git 流程

兩個人怎麼分工、怎麼用 Git 一起改同一個專案而不互相蓋掉。

開發規範見 [dev-guide.md](dev-guide.md)。

## 目錄

1. [分工](#1-分工)
2. [五條規則](#2-五條規則)
3. [先懂三個詞](#3-先懂三個詞)
4. [只做一次的設定](#4-只做一次的設定)
5. [做自己那一端的流程](#5-做自己那一端的流程)
6. [改共用的東西的流程](#6-改共用的東西的流程)
7. [幫對方看 PR](#7-幫對方看-pr)
8. [commit 訊息怎麼寫](#8-commit-訊息怎麼寫)
9. [遇到狀況怎麼辦](#9-遇到狀況怎麼辦)

---

## 1. 分工

依三端切，一人負責一端：

| 誰 | 負責 | 自己那一端的檔案 |
|---|---|---|
| suzy | 住戶端 | `src/views/resident/`、`src/router/resident.js`，以及只有住戶端在用的元件 |
| 013 | 管委會端 | `src/views/committee/`、`src/router/committee.js`，以及只有管委會端在用的元件 |
| 先不分配 | 管理人員端 | 它和管委會端的分頁相同，等管委會端做出幾頁後，再看哪些畫面可以共用 |

> **為什麼依三端切**：路由和資料夾已經依三端分開，這樣切兩人幾乎不會改到同一個檔案，合併時不容易衝突。

### 共用的東西

兩端都會用到、改了可能讓對方的頁面壞掉的東西：

| 東西 | 誰負責 |
|---|---|
| 設計 Token（`src/style.css`） | suzy |
| 三端設定與外框（`src/config/roles.js`、`src/layouts/`、`src/components/app/` 的外框） | suzy |
| 路由的組合（`src/router/index.js`） | suzy |
| 基礎元件（`src/components/ui/`） | suzy |
| 假資料（`src/mocks/`）、共用小工具（`src/lib/`） | suzy |
| 套件（`package.json`） | suzy |
| 兩端都在用的產品元件（例如 `notice/NoticeDetailDialog`、`common/FilterChips`） | 誰先做誰負責 |
| 規格文件（`docs/`）、`CLAUDE.md` 裡的規則 | 兩人一起 |

- 不管誰負責，**要改的時候都另外開 `shared/` 分支、開 PR，等對方同意才合併**，流程見[第 6 節](#6-改共用的東西的流程)。負責的人改自己負責的東西，一樣要開 PR 給對方看，因為對方的頁面也在用。
- **對方那一端的檔案和元件**（例如住戶端要改 `admin/` 的元件）也一樣，開 PR 等對方同意。
- 文件裡只有「規則」算共用的。`component-map.md` 的完成狀態、`CLAUDE.md` 的「目前進度」跟著頁面的分支一起改就好。
- 產品元件本來只有一端在用，另一端也要用時，就變成共用的東西。動手做新元件前先在群組說一聲「我要做 XXX 元件」，避免兩人各做一個。
- 不確定算不算共用的時候，當作共用的。

> **為什麼共用的東西要先 review**：自己那一端的檔案，改壞了只有自己的頁面壞掉。共用的東西改壞了，對方的頁面也會跟著壞，而且對方不知道從哪裡找起。

---

## 2. 五條規則

2026-10-14 起改成這樣。原則是：**每一頁都在自己的分支上做；只影響自己的求快，會影響對方的才等對方看**。

1. **一頁一個分支。** 例如做住戶端的會議紀錄頁，就開 `resident/meetings`。不要直接在 `main` 上寫程式。
2. **做完後，依情況決定怎麼合進 `main`：**

   | 情況 | 例子 | 怎麼合進 `main` | 要不要等對方 |
   |---|---|---|---|
   | 很小的修改 | 改幾個字、調間距、修一個小 bug，只動到自己那一端的一兩個檔案 | 不開 PR，在自己電腦上合進 `main`、push（[第 5 節步驟 5A](#步驟-5a很小的修改不開-pr直接合進-main)） | 不用 |
   | 一般的頁面、功能比較大或改了很多 | 做一個新頁面、加一個流程 | 開 PR、自己合併（[第 5 節步驟 5B](#步驟-5b開-pr自己合併)） | 不用，對方有空再看 |
   | 動到共用的東西或對方的元件 | 加假 API、加基礎元件、改 `style.css` | 那部分另外開 `shared/` 分支、開 PR（[第 6 節](#6-改共用的東西的流程)） | **要等對方同意才合併** |

   只要碰到共用的東西或對方的元件，就不算「很小的修改」。不確定算哪一種時，開 PR。
3. **頁面和共用的東西不要放在同一個分支。** 共用的部分要等對方看，混在一起整包都得等。
4. **每次開始工作前、合進 `main` 之前，先拿最新的 `main`。**
5. **`main` 要一直是可以正常執行的版本。** 合進 `main` 或合併 PR 之前，先跑 `npm run build` 確認沒有錯誤。

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

## 5. 做自己那一端的流程

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

**分支命名**，全小寫英文：

| 要做的事 | 分支名稱 |
|---|---|
| 住戶端・我的通報 | `resident/reports`（`哪一端/頁面`，和網址一致） |
| 管委會端・首頁 | `committee/home` |
| 修正、小修改 | `fix/` 開頭，例如 `fix/report-card-spacing` |
| 改共用的東西 | `shared/` 開頭，走[第 6 節](#6-改共用的東西的流程) |
| 改文件裡的規則 | `docs/` 開頭，走[第 6 節](#6-改共用的東西的流程) |

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

確認清單裡**只有自己那一端的檔案**。出現共用的東西（例如 `src/mocks/`）的話，那部分要另外走[第 6 節](#6-改共用的東西的流程)，先不要加進來。

把要存的檔案一個一個加進來：

```bash
git add src/views/resident/ReportsView.vue src/router/resident.js
```

存成一個版本：

```bash
git commit -m "feat: add resident reports page"
```

不要用 `git add .`（全部加進來），容易把共用的東西、吉祥物原圖、自己的筆記一起放進去。

### 步驟 4：push 分支到 GitHub

這個分支第一次 push：

```bash
git push -u origin resident/reports
```

之後同一個分支再 push，只要 `git push`。還沒做完也可以 push，當作備份。

### 步驟 5：合進 main

做完並通過 [dev-guide.md 的檢查清單](dev-guide.md#步驟-6交出去之前自己檢查)後，依[第 2 節](#2-五條規則)的表格選 5A 或 5B。

#### 步驟 5A：很小的修改，不開 PR，直接合進 main

```bash
git switch main
```

```bash
git pull
```

```bash
git merge --no-edit resident/reports
```

```bash
npm run build
```

```bash
git push
```

- `git merge --no-edit resident/reports`：把分支合進 `main`。`--no-edit` 是「合併訊息用預設的就好」，不加的話 Git 可能會打開一個要你寫訊息的編輯畫面（見[第 9 節](#跳出一個看不懂的編輯畫面)）。
- `npm run build` 沒有錯誤才 `git push`。有錯誤的話先不要 push，修好再說。

合併完刪掉這個分支：

```bash
git branch -d resident/reports
```

GitHub 上如果也有這個分支（步驟 4 有 push 過），再刪掉 GitHub 上的：

```bash
git push origin --delete resident/reports
```

#### 步驟 5B：開 PR，自己合併

1. 打開 GitHub 的 repo 頁面，上方會出現黃色提示「resident/reports had recent pushes」，按 **Compare & pull request**。
2. 填寫標題和說明（格式見下方）。
3. 按 **Create pull request**。不用選 Reviewers。
4. 確認 **Files changed** 只有這次要的檔案，按 **Merge pull request**，合併後按 **Delete branch**。
5. 在群組跟對方說一聲，貼上 PR 的連結，對方有空再看。

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

「要注意的地方」寫這些：有沒有和設計稿不一樣的地方、有沒有碰到[尚未定案的事](dev-guide.md#8-尚未定案的事)。沒有就寫「無」。

### 步驟 6：回到 main，準備下一頁

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

對方看過後有要修改的地方，從最新的 `main` 開一個 `fix/` 分支修，一樣依大小選 5A 或 5B。

---

## 6. 改共用的東西的流程

以「013 要在假資料加一個函式」為例。

### 步驟 1：拿最新的 main，開一個分支

```bash
git switch main
```

```bash
git pull
```

```bash
git switch -c shared/announcement-api
```

`-c` 是 create，意思是「建立一個新分支並切換過去」。

**分支命名**，全小寫英文：

| 要做的事 | 分支名稱 |
|---|---|
| 改共用的程式（`mocks/`、`lib/`、`ui/`、`style.css` 等） | `shared/` 開頭，例如 `shared/announcement-api` |
| 改文件裡的規則 | `docs/` 開頭，例如 `docs/update-dev-guide` |

想確認自己現在在哪個分支：

```bash
git status
```

第一行會寫 `On branch shared/announcement-api`。VS Code 左下角也會顯示。

### 步驟 2：改、commit、push

**一個 PR 只做一件事。** 例如「新增發布公告的假 API」和「改公告的審核規則」是兩件事，就開兩個 PR。判斷方式：PR 的標題寫得出一句話、不用「和」連起來，就是一件事。

> **為什麼要拆小**：看的人要搞懂你的目的，才判斷得了會不會影響自己。一個 PR 混了好幾件事，就得一件一件拆開來想，看得慢也容易漏看。拆小了，其中一件有問題，也不會卡住其他件。

和第 5 節一樣分段 commit。第一次 push 這個分支：

```bash
git push -u origin shared/announcement-api
```

之後再 push，只要 `git push`。

### 步驟 3：開 PR，請對方 review

1. 打開 GitHub 的 repo 頁面，上方會出現黃色提示「shared/announcement-api had recent pushes」，按 **Compare & pull request**。
2. 填寫標題和說明（格式見下方）。
3. 右邊的 **Reviewers** 選對方。
4. 按 **Create pull request**，在群組跟對方說一聲，貼上 PR 的連結。

**PR 標題**：和 commit 訊息一樣的寫法，例如 `feat: add announcement create and update`。

**PR 說明**照這個格式寫：

```markdown
## 做了什麼
假 API 新增 createAnnouncement、updateAnnouncement（發布、修改公告）。

## 會影響到什麼
- 原本的函式沒有改，現有頁面不受影響
- 撤回公告時會多發通知給住戶

## 怎麼確認
打開 /playground 最下面的「假資料」區

## 要注意的地方
- 規則寫在 data-model 公告那一節
```

說明要讓對方**不用看程式就知道**你想做什麼、為什麼。「會影響到什麼」最重要：對方要靠它判斷自己的頁面會不會壞。

### 步驟 4：等對方 review，再合併

- 對方按 **Approve** → 自己按 **Merge pull request**，合併後按 **Delete branch**。
- 對方按 **Request changes** → 在**同一個分支**上照意見修改、push，PR 會自動更新，再請對方看一次。

等 review 的時候，可以先做別的。如果自己那一端的頁面要用到這個還沒合併的東西，可以先在自己電腦上從這個分支繼續做，等合併後再 push 頁面的部分。

### 步驟 5：回到 main

```bash
git switch main
```

```bash
git pull
```

刪掉自己電腦上已經合併的分支：

```bash
git branch -d shared/announcement-api
```

---

## 7. 幫對方看 PR

對方的 PR 有兩種：

- **共用的東西、你的元件**：要等你同意才能合併，**收到就盡快看**，當天看完最好，不然會卡住對方。
- **對方自己那一端的頁面**：對方已經自己合併了，有空再看就好。看到問題就在 PR 留言或在群組說。

### 怎麼看

1. 打開 PR，點 **Files changed** 分頁，看改了哪些地方（紅色是刪掉的，綠色是新增的）。
2. 把對方的分支抓下來實際跑跑看，**特別是自己的頁面有沒有壞掉**：

```bash
git fetch
```

```bash
git switch shared/announcement-api
```

```bash
npm run dev
```

3. 看完後切回 `main`：

```bash
git switch main
```

### 看什麼

不用逐行檢查，看這幾件事就好：

- [ ] 自己那一端用到這個東西的頁面，打開來還正常嗎
- [ ] PR 說明的「會影響到什麼」寫得對嗎？有沒有漏掉的
- [ ] 有沒有照 [dev-guide.md](dev-guide.md) 的規則（命名、語意色、從假 API 拿資料）
- [ ] 有沒有看不懂的地方？看不懂就問，這也是互相學習的機會

### 怎麼回覆

在 **Files changed** 分頁右上角按 **Review changes**：

- **Approve**：沒問題，對方就可以合併。
- **Request changes**：有一定要改的地方，寫清楚哪裡、為什麼。對方會在同一個分支上修，修完再看一次。
- **Comment**：只是提問或建議，不擋合併。

想針對某一行留言，把滑鼠移到那一行左邊，按出現的 **＋**。

留言時說明原因，不要只寫「這裡改一下」。例如：「這裡的顏色寫了色號，dev-guide 第 5 節說要用語意色，可以改成 `text-muted-foreground` 嗎？」

---

## 8. commit 訊息怎麼寫

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

## 9. 遇到狀況怎麼辦

### 我不小心在 main 上改了東西（還沒 commit）

直接開一個新分支，修改會跟著過去：

```bash
git switch -c resident/reports
```

裡面有共用的東西的話，先只 `git add` 自己那一端的檔案、commit，剩下共用的部分再開一個 `shared/` 分支。

### 我不小心在 main 上 commit 了（還沒 push）

先不要 push，也不要自己嘗試復原，跟對方說，一起處理。

### push 被擋下來

終端機出現 `rejected` 或 `fetch first`，代表對方在你之後 push 了新東西到 `main`（通常是步驟 5A 合進 `main` 時遇到）。先把它拿下來，再 push 一次：

```bash
git pull --no-edit
```

```bash
git push
```

`git pull` 時如果出現衝突，照下面「出現衝突」處理。

### 跳出一個看不懂的編輯畫面

`git merge`、`git pull` 有時會打開一個編輯畫面，要你寫合併訊息，第一行通常是 `Merge branch ...`。預設的訊息就可以了，直接存檔離開：

- 畫面最下面有 `^X Exit` 字樣（nano）：按 `Ctrl` + `X`。
- 其他（vim）：按一下 `Esc`，輸入 `:wq`，再按 `Enter`。

以後在指令後面加 `--no-edit`（例如 `git merge --no-edit main`），就不會跳出來。

### 我在分支上做到一半，對方合併了新的東西到 main

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
git merge --no-edit main
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
