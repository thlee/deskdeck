# Baroham ウィジェットAPI — 公開開発ガイド

改訂：2026-10-30。推奨基準：Windows Studio 0.9.41+、macOS 0.9.40 build148+（ローカルビルド検証済み、配布状況はサイト参照）。両ホストはこのガイドとHello例の同じ形式を使います。ウィジェットはPCのStudioで実行し、Android・ESP32・仮想画面へ描画結果を送ります。JavaScript ZIPはAndroidアプリやESP32ファームウェアではありません。

## パッケージ

manifest.json、main.js、settings.jsonと任意のlocales/assetsを、外側のフォルダーを付けずZIPルートに置きます。安定した固有IDと数値major.minor.patchを使います。表示専用はpackageVersion 1、タップを受けるスクリプトは3です。他の形式は宣言型サービスで、代替JavaScript APIではありません。新規ウィジェットはStudio改変ではなく任意インストールZIPにしてください。

HelloはpackageVersion 3、fps 1、背景#10252B、permissions {"https":[]}です。静的表示・時間表示はfps 1、制限内のアニメーションは最大12 fpsを要求できます。実際の機器性能は要求レートを保証しません。

「全画面 → ウィジェット管理」で読み込み、有効状態と順序を保存します。編集画面はsettings.jsonから生成します。保存で確定、キャンセルで下書きを破棄します。同じIDの上位バージョンZIPで更新してください。同一バイトは変更なし、同一バージョンの異なるバイトや下位版は拒否します。検証失敗時は現行を維持します。互換設定は保持し、新規キーには宣言した初期値を適用します。移行試験なしでキー名・型を変えたり削除しないでください。

ZIP制限：圧縮・展開総量それぞれ8 MiB、128ファイル、1ファイル1 MiB、main.js 256 KiB。絶対パス、親ディレクトリへの移動、シンボリックリンク、大文字小文字を無視した重複名は拒否します。借用資料には出典・ライセンスを付けます。例のMITはStudioや他のウィジェット・画像には適用しません。

## JavaScriptの入口と描画

`const widget = { render(api) { /* 同期描画 */ } };`を定義します。import/require/npm、DOM、直接fetch、ファイルシステム、OSコマンドAPIはありません。Studioは命令を記録・検証し、実行成功後に描画します。

- api.canvas：fillRect, strokeRect, clearRect, beginPath, closePath, moveTo, lineTo, rect, roundRect, arc, fill, stroke, clip, save, restore, translate, scale, rotate, fillText, 近似measureText。
- 属性：fillStyle/strokeStyle（#RRGGBB）、font（`[600 ]SIZEpx sans-serif`またはmonospace）、textAlign、textBaseline、lineWidth、globalAlpha。
- api.width/height：既存パッケージは常に480/320。`viewport: 1`を明示要求するスクリプトは現在の論理画面サイズを受け取れます（後述）。
- api.contentRect：同一座標の{x,y,width,height}。ホストの上部・左右端のナビゲーションを除く領域です。操作要素はこの中に置いてください。
- api.now：Unixミリ秒。全予定フレームが送信されるとは仮定せず、経過時間からアニメーションを計算します。
- api.language、api.t(key, fallback)：locales/ko.json、en.json、ja.json、zh-Hans.json。
- api.settings：検証済み設定。settings.jsonは最大12フィールドの配列です。key、type、label、default、任意labelKeyを持ちます。型：text（200文字以下）、toggle（boolean）、choice（choices [{value,label,labelKey?}]）、multi（宣言済みHTTPS JSONから順序付き選択肢。マッピングはSDK参照）。
- api.state：32 KiB以下のJSON。メモリのみで、Studio再起動・パッケージ交換・キャッシュ破棄でリセットされます。プレビューと有効画面で共有します。
- api.useThemeBackground?.()：選択テーマを最初に描くよう要求します。透明部分に見え、不透明描画で隠れます。

上限：記録描画700操作、saveの入れ子16段、worker期限750 ms。workerは隔離されますが厳格なOSメモリ制限ではありません。過剰な確保はWebエンジンを妨げ得ます。信頼できるパッケージのみ導入してください。

Windows 0.9.41 / macOS 0.9.40 build148以降では、状態に通常のJSONオブジェクト・配列、文字列、有限の数値、boolean、nullのみを許可します。32 KiBはシリアライズしたUTF-8のバイト数で、入れ子20段、値ノード4,096個までです。バイナリバッファ・型付き配列・Map/Set・Date・循環参照・非有限数は拒否します。親側はWorkerの直接メッセージも検証し、不正なフレームで最後の正常な状態を置き換えません。メッセージ転送後の検査であり、Worker自体への厳密なメモリ割り当て上限ではありません。

Windows 0.9.41 / macOS 0.9.40 build148以降では、実行エラーや安全規則違反が発生したウィジェットを即座に停止します。理由と日時を保存し、待機中の処理を取り消してプレビューを含む再実行を防ぎます。Studio再起動・ZIP更新・再インストールでも自動解除しません。ウィジェット管理で理由を確認し、利用者が明示的に再度有効にする必要があります。停止中のIDを再インストールするとファイルだけを置き換え、インストール時のプレビュー実行や停止解除は行いません。再違反時は再び停止します。オフライン・DNS解決失敗・通常の通信タイムアウト・サーバーエラー・不正なJSON応答では停止しません。内部IP・未宣言URL・応答サイズ上限違反は停止対象です。停止記録の保存に失敗した場合は通知し、現在の起動中はメモリ内のブロックを維持します。

## タッチ — packageVersion 3

受動プレビューではapi.activeはfalseです。プレビューでゲーム状態を進めないでください。api.inputsは最大32件の{sequence,x,y}タップです。消費したsequenceを追跡し、当たり判定を検証して重複処理を防ぎます。
従来の論理タップ範囲はx=22..457、y=48..319。右上の戻ると左右ナビゲーションはホスト管理です。独自の戻るボタン、ジェスチャー置き換え、重要操作の端配置は避けます。Helloのカードはx32,y72,w416,h192。Studioがナビゲーション、入力確認、機器転送を担当します。

## HTTPSとプライバシー

permissions.httpsに["api.example.com"]など正確なホストを宣言します。api.httpJson(url, intervalSeconds=10)はキャッシュ{data,updatedAt,failed}を即時返し、ホストGETを予約します。awaitするPromiseではありません。初期dataはnull。読み込み・エラーを表示し、応答形式を検証してください。

宣言した公開HTTPSの443番ポートのみを許可し、認証情報・Cookie・リダイレクトは禁止です。フレームあたり要求記述8件、処理中4件、パッケージあたり新規要求1件/秒。応答1 MiB以下、更新間隔10秒〜6時間。失敗時はキャッシュを保ちバックオフします。429/418では60秒以上停止します。

Windows 0.9.41 / macOS 0.9.40 build148以降はDNS応答の全アドレスを検証し、検証済み公開IPにのみ接続します。TLS証明書は元のホスト名で確認します。ループバック・プライベート・リンクローカル・予約アドレス、公開/内部アドレスが混在するDNS応答、リダイレクトを拒否します。Content-Lengthがなくても受信中に1 MiB上限を適用します。対象はウィジェットHTTPSで、機器のローカル接続は別です。

Studioのインターネット設定はパッケージHTTPSとフィードを遮断し、設定で有効化する案内をホストが表示します。USB・ローカルWi-Fiは無効にしません。オフラインパッケージに通信権限は不要です。ZIPに秘密鍵を入れないでください。カメラ・マイク収集、任意ファイル、シェル実行、無制限のブラウザー起動は提供しません。必要なデータのみ要求します。

## レスポンシブ座標 — 新しい開発ビルド

`viewport:1`を公開する更新済みWindows/macOS Studioが必要です。**Windows 0.9.41 / macOS 0.9.40 build148以降で対応します。** 古いホストは未対応機能として安全にインポートを拒否します。既存パッケージに自動適用せず、Helloは480×320のままです。

```json
"hostApiVersion": 1,
"requires": {"canvas": 1, "settings": 1, "touch": 1, "viewport": 1}
```

宣言型サービスではなくJavaScript（packageVersion 1または3）で使用します。別のresponsive-exampleは横長2列、縦長2行を示します。**毎回のrender**でapi.width、api.height、api.contentRectを読み、サイズ変更時に状態を捨てず配置を再計算します。タッチx/yも同じ座標で小数の場合があります。sequence重複防止とapi.activeがfalse時の無視を続け、入力を再拡縮しないでください。

現在の論理領域はMac/Windows仮想画面に追従します。600×960ならwidth=600、height=960です。大画面でも極小固定文字にせず、例えばMath.min(api.width/480, api.height/320)で読みやすい倍率を選び、幅・高さで配置を決めます。戻る・ページ端はホスト管理で、contentRectは保守的な使用可能領域です。

**互換範囲：** ESP32と既存Androidのプロトコルは480×320のフレーム・入力領域です。この接続では新パッケージも480×320を受け、使える代替配置を描く必要があります。Android、ESP32ファームウェア、物理プロトコル、転送解像度は変更しません。転送・ラスター出力は480×320（既存低解像度クライアント240×160）に制限し、仮想表示で画面に合わせます。適応配置であり、ネイティブ解像度の文字や画素精度の保証ではありません。受動プレビューは接続画面の互換モードに従います。

絶対ピクセル位置を永久保存せず、相対位置にするかサイズ変更後に範囲を補正します。状態はプレビューと有効フレームで共有するため、配置だけの変更で進行をリセットしないでください。APIサイズは各軸4096以下。命令・状態・時間制限は維持します。

## 同梱画像

api.useImageBackground("asset:assets/scene.jpg")
api.drawSprite("asset:assets/actor.webp",sx,sy,sw,sh,dx,dy,dw,dh)

ファイル名はASCII英数字・下線・ハイフンを使います。JPEG背景と静的拡張WebPアトラスのみ対応。最大16ファイル、各149,000バイト、合計1 MiB、1024×1024以下。切り出しはアトラス内、1フレームにスプライト8回までです。遠隔URL、ファイルパス、任意フォント、SVGをラスター素材として渡さないでください。

## 任意の共通ホスト機能

hostApiVersion:1とrequires:{"canvas":1,"system":1,...}を宣言できます。host-api.jsonは版の登録簿で、任意APIの許可ではありません。完全な宣言・権限の組はSDKのHOST-API.mdと例を参照します。非対応機能はインポート時に拒否します。

スクリプトはsystem、media、weatherの読み取り専用api.hostスナップショットを要求できます。未取得センサーは0ではなくnullです。パス、メディア操作ハンドル、OSコマンド、位置座標は公開しません。HTTPSとの併用はPCメタデータを外部へ送信し得るため、必要な場合にのみ要求し説明します。

宣言型packageVersion2はdefinition.json、必要時defaults、settings.json:[]、runtime:"declarative"を使い、main.jsはありません。
- dashboard-v1：検証済み時計・システム・天気・メディアのレイヤー。
- news-v1：ネイティブのフィード選択・解析・記事移動。
- local-images-v1：ネイティブのフォルダー選択と読み取り専用画像サービス。初期フォルダーは空にし、ローカルパスを事前指定しません。ZIPへ一般ファイル権限は渡しません。
これらは明示的なサービス契約であり、JavaScriptで勝手に作れる呼び出しではありません。旧native-video v4は一般動画APIではなく、動画はStudio内蔵です。

## 検証と共有

1. 新しいZIPを読み込み、設定の保存・キャンセルを確認します。
2. 初期値・長文・対象全言語・テーマ有無・データ欠落を試します。
3. プレビュー、実際の全画面、反復タップ、切り替えと復帰を試します。
4. 通信機能は初回読み込み・失敗・オフライン・Studio通信無効を試します。
5. Windows/macOS別に仮想画面と対象機器を検証します。
6. 同一IDの版を上げ、旧設定の維持を確認します。
7. パッケージ、ライセンス、最低Studio版のみ共有します。利用者のパス・設定、秘密、アプリバイナリ、非公開ソースを含めません。パッカーは自動マーケット公開・掲載審査を行いません。

旧SDKのpreview.htmlは宣言型JSON用で、JavaScript ZIPや実際のPCサービス用ではありません。事前確認と実行試験にはStudioを使います。このガイドは独立したJavaScript ZIPブラウザープレビューを保証しません。
