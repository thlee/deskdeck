# Baroham 小组件 API — 公开开发指南

修订日期：2026-10-30。推荐基线：Windows Studio 0.9.40+；macOS 0.9.40 build148+（本地构建已验证，可下载版本请查看官网）。两端使用本指南及 Hello 示例的同一格式。小组件在 PC 的 Studio 中运行，Android、ESP32 和虚拟屏幕接收渲染结果。JavaScript ZIP 不是 Android 应用或 ESP32 固件。

## 软件包

将 manifest.json、main.js、settings.json 及可选 locales/assets 放在 ZIP 根目录，不要包含外层文件夹。使用稳定唯一的 ID 和数字 major.minor.patch 版本。只显示内容的脚本使用 packageVersion 1，接收点击的脚本使用 3。其他格式属于声明式服务，并非另一套 JavaScript API。新小组件应保持可选 ZIP，不要修改 Studio 本体。

Hello 使用 packageVersion 3、fps 1、背景 #10252B 和 permissions {"https":[]}。静态或时间显示使用 fps 1；受限动画最多可请求 12 fps。设备实际吞吐量不保证达到请求帧率。

通过“全屏 → 管理小组件”导入，并保存启用状态及顺序。设置编辑器由 settings.json 生成。保存提交选项，取消丢弃草稿。更新请拖入同 ID 更高版本的 ZIP。字节完全相同则不变；同版本但字节不同、或更低版本会被拒绝。验证失败保留现有包。兼容选项会保留，新脚本键使用声明的默认值。未经迁移测试，不要重命名、删除键或改变其类型。

ZIP 限制：压缩及解压总量各 8 MiB，128 个文件，每文件 1 MiB，main.js 256 KiB。拒绝绝对路径、目录穿越、符号链接及忽略大小写的重复名称。所有借用材料须包含来源与许可证。示例 MIT 许可不涵盖 Studio、其他小组件或第三方美术。

## JavaScript 入口与绘图

定义 `const widget = { render(api) { /* 同步绘图 */ } };`。不提供 import/require/npm、DOM、直接 fetch、文件系统或 OS 命令 API。Studio 记录并验证指令，执行成功后绘制。

- api.canvas：fillRect、strokeRect、clearRect、beginPath、closePath、moveTo、lineTo、rect、roundRect、arc、fill、stroke、clip、save、restore、translate、scale、rotate、fillText，以及近似 measureText。
- 属性：fillStyle/strokeStyle（#RRGGBB）、font（`[600 ]SIZEpx sans-serif` 或 monospace）、textAlign、textBaseline、lineWidth、globalAlpha。
- api.width/height：旧包始终接收 480/320。明确要求 `viewport: 1` 的脚本可接收当前逻辑屏幕尺寸，详见下文。
- api.contentRect：相同坐标系的 {x,y,width,height}，排除宿主顶部及左右边缘导航区域。请将控件放在此区域内。
- api.now：Unix 毫秒。按经过时间计算动画，不要假设每个计划帧都会传送。
- api.language；api.t(key, fallback)：locales/ko.json、en.json、ja.json、zh-Hans.json。
- api.settings：验证后的设置。settings.json 是最多 12 个字段的数组，每项包含 key、type、label、default，可选 labelKey。类型：text（不超过 200 字符）、toggle（boolean）、choice（choices [{value,label,labelKey?}]）、multi（来自已声明 HTTPS JSON 端点的有序选项，映射参见 SDK）。
- api.state：不超过 32 KiB 的 JSON 状态，仅保存在内存。Studio 重启、包替换或缓存淘汰时重置。预览和活动帧共享此状态。
- api.useThemeBackground?.()：请求宿主先绘制所选主题。透明部分可看到背景，不透明绘图会遮盖它。

预算：最多 700 条记录绘图操作、16 层嵌套 save、worker 时限 750 ms。worker 有隔离，但不是严格的 OS 内存配额。过量分配仍可能影响网页引擎，请只安装可信包。

公开版 0.9.40 之后的开发版仅允许状态包含普通 JSON 对象／数组、字符串、有限数字、boolean 和 null。32 KiB 按序列化后的 UTF-8 字节计算，最多嵌套 20 层、4,096 个值节点。二进制缓冲区、类型化数组、Map/Set、Date、循环引用及非有限数值均被拒绝。宿主也验证 Worker 直接发送的消息；错误帧不会替换最后一次有效状态。验证发生在消息传输之后，不等同于对 Worker 分配内存的硬性限额。

最新开发版会在发生执行错误或安全规则违规时立即停用微件。宿主保存原因和时间、取消待处理任务，并阻止包括预览在内的再次执行。Studio 重启、ZIP 更新或重新安装均不会自动解除停用。只有用户在微件管理中查看原因并明确重新启用后才能执行。重新安装已停用 ID 的 ZIP 只替换文件，不执行安装预览，也不会解除停用。再次违规时会重新停用。离线、DNS 查询失败、普通网络超时、服务器错误及无效 JSON 响应不会导致停用；内网 IP、未声明 URL 及响应超限会导致停用。如果无法保存停用记录，会提示错误，并在本次运行中维持内存中的阻止状态。

## 触控 — packageVersion 3

被动预览中 api.active 为 false，不要在预览帧推进游戏状态。api.inputs 是最多 32 项的 {sequence,x,y} 点击列表。记录已处理的 sequence，验证命中区域，避免重复计数。
旧逻辑点击范围为 x=22..457、y=48..319。右上角返回及侧边导航由宿主管理。不要绘制第二个返回按钮、替换手势，或把重要控件放在边缘。Hello 卡片位于 x32,y72,w416,h192。Studio 负责导航、输入确认及设备传输。

## HTTPS 与隐私

在 permissions.https 声明准确主机，如 ["api.example.com"]。api.httpJson(url, intervalSeconds=10) 立即返回缓存的 {data,updatedAt,failed}，并安排宿主 GET 请求，不是可 await 的 Promise。初始 data 为 null，请显示加载／错误状态并验证响应结构。

仅允许已声明的公开 HTTPS 端点、443 端口，不允许凭据、Cookie 或重定向。每帧最多 8 条请求描述、同时进行 4 个请求、每包每秒新增 1 个请求。响应最多 1 MiB，刷新间隔 10 秒至 6 小时。网络失败时保留缓存并退避；429/418 会暂停请求至少 60 秒。

最新开发版验证 DNS 返回的所有地址，并且只连接到已验证的公网 IP，同时按原始主机名验证 TLS 证书。拒绝环回、私网、链路本地、保留地址、混合公网／内网的 DNS 响应及重定向。即使没有 Content-Length，也在接收过程中执行 1 MiB 响应上限。这一策略适用于微件 HTTPS，设备本地连接独立处理。

Studio 的互联网开关会阻止包的 HTTPS 和订阅源请求，并由宿主显示去设置启用的提示。它不关闭 USB 或本地 Wi-Fi 连接。离线包不需要互联网权限。不要将 API 密钥放进 ZIP。不提供摄像头／麦克风采集、任意文件访问、Shell 执行或无限制浏览器打开功能。只请求必要数据。

## 响应式坐标 — 新开发版

需要声明支持 `viewport:1` 的更新版 Windows/macOS Studio。**公开 0.9.40 版不支持。** 旧宿主会以不支持能力为由安全拒绝导入。现有包不会自动启用，Hello 仍是传统 480×320 示例。

```json
"hostApiVersion": 1,
"requires": {"canvas": 1, "settings": 1, "touch": 1, "viewport": 1}
```

用于 JavaScript 包（packageVersion 1 或 3），不用于声明式服务。独立的 responsive-example 在横屏显示两列、竖屏显示两行。**每次 render** 都读取 api.width、api.height 和 api.contentRect；尺寸改变后重新计算位置，但不要丢弃游戏或计数状态。触控 x/y 使用同一坐标系，可能为小数。继续按 sequence 去重，api.active 为 false 时忽略输入。不要再次缩放输入。

当前逻辑区域跟随 Mac/Windows 虚拟屏幕尺寸。例如 600×960 屏幕提供 width=600、height=960。大屏幕也不应使用过小的固定字体：可使用 Math.min(api.width/480, api.height/320) 等可读缩放，并按宽高选择布局。返回和页面边缘由宿主管理，contentRect 是保守的可用区域。

**兼容范围：** ESP32 及现有 Android 协议保持 480×320 帧与输入区域。此类连接中新包接收 480×320，必须提供可用的回退布局。此更改不更新 Android、ESP32 固件、物理设备协议或传输分辨率。传输／光栅输出仍限制为 480×320（旧低分辨率客户端为 240×160），虚拟显示再映射到可用区域。这是自适应布局，不保证原生分辨率文字或更高像素细节。Studio 被动预览遵循所连接屏幕的兼容模式。

不要永久保存绝对像素位置，应保存相对位置或在宽高改变后重新限制到区域内。预览与活动帧共享状态，仅布局变化不得重置用户进度。API 尺寸每轴最多 4096；原有指令、状态和时间预算继续生效。

## 包内图片

api.useImageBackground("asset:assets/scene.jpg")
api.drawSprite("asset:assets/actor.webp",sx,sy,sw,sh,dx,dy,dw,dh)

文件名使用 ASCII 字母、数字、下划线和连字符。仅支持 JPEG 背景及静态扩展 WebP 精灵图集。最多 16 个文件、每文件 149,000 字节、总计 1 MiB、尺寸最多 1024×1024。精灵裁剪区域必须在图集内，每帧最多绘制 8 次。不要将远程 URL、文件系统路径、任意字体或 SVG 作为光栅资源传入。

## 可选共享宿主能力

可声明 hostApiVersion:1 和 requires:{"canvas":1,"system":1,...}。附带的 host-api.json 是版本注册表，不是任意 API 的授权。完整声明与权限搭配请参阅 SDK 的 HOST-API.md 和示例。不支持的能力会在导入时拒绝。

脚本可请求 system、media、weather 的只读 api.host 快照。不可用传感器值为 null，不是零。不会暴露路径、媒体控制句柄、OS 命令或位置坐标。快照结合 HTTPS 可能向外泄露 PC 元数据，只有必要时才同时请求并作出说明。

声明式 packageVersion2 使用 definition.json、按需 defaults、settings.json:[]、runtime:"declarative"，不包含 main.js：
- dashboard-v1：组合验证过的时钟、系统、天气和媒体图层。
- news-v1：原生订阅源选择、解析及新闻导航。
- local-images-v1：原生文件夹选择器和只读图片服务。默认文件夹为空，不预选本地路径。ZIP 不获得一般文件访问权限。
这些是明确的服务协议，不是能在 JavaScript 中随意编造的调用。旧 native-video v4 不是通用视频 API；视频已内置在 Studio。

## 验证与分享

1. 导入新打包 ZIP，打开设置并验证保存／取消。
2. 测试默认值、长文字、所有目标语言、主题开关及数据缺失。
3. 测试被动预览、活动全屏、重复点击、切出再返回。
4. 在线数据须测试首次加载、错误、离线及 Studio 禁用互联网。
5. 在 Windows/macOS 分别测试虚拟屏幕和目标设备。
6. 同 ID 增加版本后更新，确认旧设置保留。
7. 只分享包、许可证及最低 Studio 版本。不要包含用户路径／设置、秘密信息、应用二进制或私有源码。打包器不自动上传市场或审核上架。

旧 SDK preview.html 仅预览声明式 JSON，不用于 JavaScript ZIP 或实时 PC 服务。预检查和实际运行测试请使用 Studio。本指南不保证提供独立的 JavaScript ZIP 浏览器预览。
