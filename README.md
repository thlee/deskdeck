# 바로함

<img src="assets/logo.svg" width="64" alt="바로함">

자주 하는 일, 한 번의 터치로. 휴대폰·보조 모니터·ESP32 화면을 PC의 앱 실행·단축키·매크로 패널로 사용하세요.

**[English](https://thlee.github.io/deskdeck/index.en.html)** · **[소개 페이지](https://thlee.github.io/deskdeck/)** · **[Windows 설치파일](https://github.com/thlee/deskdeck/releases/latest)** · **[시작하기](https://thlee.github.io/deskdeck/start.html)**

## 나만의 PC 컨트롤 패널

- **자주 쓰는 동작을 한 번에:** 앱 실행, 단축키, 파일·폴더·URL 열기와 미디어 조작을 원하는 버튼에 배치합니다.
- **반복 작업은 매크로로:** 버튼 동작·단축키·문자열·대기를 순서대로 조합합니다.
- **내 화면과 취향에 맞게:** 휴대폰·태블릿·보조 모니터·ESP32 화면을 활용하고, 테마와 전체화면 위젯으로 꾸밉니다.
- **오래된 기기에도 새 역할을:** Android 5.0 이상을 지원해 제조사 업데이트 지원이 끝난 기기도 PC 컨트롤러로 다시 활용할 수 있습니다.

### 오래된 안드로이드 활용 사례

Galaxy S8(Android 9)은 앱 실행·단축키 패널로, LG G Pad 8.0(Android 5.0.2)은 넓은 버튼·위젯 화면으로 활용할 수 있습니다. 주요 작업은 PC의 Studio가 처리하며 휴대폰·태블릿은 같은 앱을 사용합니다. USB 호환성은 기기에 따라 다를 수 있습니다. [안 쓰는 스마트폰·구형 태블릿 활용 안내](https://thlee.github.io/deskdeck/reuse-android.html).

## Everyday tasks, one touch away

Turn a phone, tablet, second monitor or ESP32 display into your own PC control panel. Launch apps, use shortcuts, combine actions into macros, control media, and customize your screen with themes and full-screen widgets.

**Reuse hardware you already own:** Android 5.0+ support gives older phones and tablets a useful role, including devices past manufacturer update support. Use a Galaxy S8 (Android 9) for apps and shortcuts, or an LG G Pad 8.0 (Android 5.0.2) for a larger button and widget screen. USB compatibility varies by device. [Repurpose an old Android phone as a PC macro pad](https://thlee.github.io/deskdeck/reuse-android.en.html).

## 위젯 다운로드
[위젯 라이브러리](https://thlee.github.io/deskdeck/widgets.html) · [Widgets (English)](https://thlee.github.io/deskdeck/widgets.en.html)

기본 시계·네코·미디어·시스템 정보·동영상은 Studio에서 바로 선택합니다. 추가 위젯은 정보(코인 시세·뉴스), 게임(오델로), 휴식(모닥불·어항·사진 슬라이드쇼·바루와 하미)으로 나누어 제공합니다. ZIP을 다운로드하고 **전체화면 → 위젯 관리** 목록에 끌어다 놓으세요. 업데이트할 때는 기존 위젯을 삭제하지 않고 새 ZIP을 추가하면 설정을 유지합니다. 사진 슬라이드쇼와 바루와 하미는 Studio 0.9.40 이상이 필요합니다. 모닥불·어항·바루와 하미는 MIT 라이선스와 출처 고지를 ZIP에 포함합니다.

## 테마 다운로드
[테마 라이브러리](https://thlee.github.io/deskdeck/themes.html) · [Themes (English)](https://thlee.github.io/deskdeck/themes.en.html)

안개 숲·고요한 바다·농촌·모모 — 작은 도우미·데키 — 민트 도우미 테마를 내려받아 **보기 → 테마** 창에 ZIP을 끌어다 놓고 적용하세요. 배경 이미지와 버튼 색상을 함께 바꾸며 기존 버튼·매크로 설정은 유지됩니다.

## 현재 배포
- 바로함 Studio **0.9.40**, Windows 10 1809+ / Windows 11, x64.
- Android **0.5.55**, Android 5.0+. Studio에 포함하며 QR/브라우저로 설치합니다.
- JC3248W535 ESP32-S3 펌웨어 **0.8.2**. USB·Wi-Fi 및 초기 설치/백업 안내.
- 가상 바로함: 별도 장치 없이 마우스나 작은 터치·보조 모니터로 사용할 수 있습니다.
- 현재 공개 버전은 무료·기간 제한 없음. 결제·계정 등록 없음. Mac/iPhone 설치파일은 제공하지 않습니다.

## 다운로드 전에
Windows 설치파일은 아직 Authenticode 서명이 없어 게시자 경고가 나타날 수 있습니다. 이 저장소의 Releases에서 받고 함께 제공하는 SHA256SUMS.txt와 대조하세요. WebView2가 없으면 설치 중 Microsoft 서버에서 내려받습니다. Android AOA의 선택적 UsbDk 드라이버는 별도 설치이며 자동 설치되지 않습니다.

## 이용 조건과 소스 범위
[공개 무료 약관](legal/EVALUATION-LICENSE.ko.txt) · [English license](legal/EVALUATION-LICENSE.en.txt) · [개인정보·통신](legal/PRIVACY.ko.txt)

이 저장소는 소개 페이지·사용 안내·바이너리 배포용입니다. Studio와 Android 자체 소스는 비공개이며, 무료 배포가 오픈소스 라이선스를 의미하지 않습니다. 라이선스상 필요한 제3자 소스, GPL 설치 어댑터, LGPL 펌웨어 재링크 자료는 설치파일 및 릴리스의 별도 소스 ZIP에 함께 제공합니다.

이미 받은 이 버전의 무료 사용권을 소급 유료화하지 않으며, 제품 양도·운영자 변경 후에도 기존 사용권은 유지됩니다.

GitHub가 자동으로 표시하는 “Source code (zip/tar.gz)”에는 **이 소개 사이트의 파일만** 들어 있습니다. 오픈소스 대응 자료는 별도 Sources ZIP을 선택하세요.

## 문의
[문제 제보](https://github.com/thlee/deskdeck/issues) · 바로함 · deskdeck.app@gmail.com

버전, 연결 방법, 재현 순서, 오류 문구를 알려 주세요. 비밀번호·개인 설정·기기 전체 백업을 공개 이슈에 올리지 마세요. 보안 문제는 이메일로 알려 주세요.

- Android 터치패드: Wi-Fi·USB로 포인터 이동, 클릭, 드래그와 스크롤을 지원합니다.
- Android touchpad: pointer movement, clicks, dragging and scrolling over Wi-Fi or USB.

New in the widget library: **Photo Slideshow 1.2.0** and **Baru & Hami 1.3.0**, both requiring Studio 0.9.40+. Download their ZIPs separately; existing settings are preserved.
