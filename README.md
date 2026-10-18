# DeskDeck

<img src="assets/logo.svg" width="64" alt="DeskDeck">

자주 하는 일, 한 번의 터치로. 휴대폰·보조 모니터·ESP32 화면을 PC의 앱 실행·단축키·매크로 패널로 사용하세요.

**[English](https://thlee.github.io/deskdeck/index.en.html)** · **[소개 페이지](https://thlee.github.io/deskdeck/)** · **[Windows 설치파일](https://github.com/thlee/deskdeck/releases/latest)** · **[시작하기](https://thlee.github.io/deskdeck/start.html)**

## 업데이트 지원이 끝난 안드로이드도, PC 컨트롤러로

제조사 업데이트 지원이 끝나고 최신 앱을 쓰기 버거워진 휴대폰·태블릿도 PC용 터치 컨트롤러로 다시 활용하세요. **Android 5.0 이상**에서 앱 실행·단축키·매크로·미디어 조작을 지원하고, 전체화면 시계와 위젯도 표시할 수 있습니다. PC의 Studio가 주요 작업을 처리하고 기기가 화면 표시·터치 입력을 담당합니다.

| 실제 사용한 기기 | 테스트한 Android | 확인한 사용 예 |
| --- | --- | --- |
| Samsung Galaxy S8 (SM-G950N) | Android 9 | Wi-Fi 연결, USB AOA 버튼 조작·재연결 |
| LG G Pad 8.0 (LG-V480) | Android 5.0.2 | Wi-Fi·USB AOA 연결, 버튼 표시, Studio 재시작 후 자동 재연결 |

개발 중 실제 사용한 예시이며 모든 모델·OS 조합이나 공개 버전의 모든 기능을 보증하는 목록은 아닙니다. 기종별 USB 호환성을 확인하세요. 휴대폰·태블릿은 같은 APK를 사용합니다.

**공식 업데이트 이력:** [삼성 SM-G950F 이력](https://doc.samsungmobile.com/SM-G950F/000092170702/mlt.html)에는 Android 9 업그레이드가 **2019년**으로 기록되어 있지만 이후 수정 업데이트도 있습니다. 테스트 모델 SM-G950N을 포함한 모든 S8의 지원 종료 연도로 일반화하지 않습니다. LG-V480 개별 OS 지원 종료 연도는 공식 확인이 되지 않았습니다. [LG의 **2025-06-30** 공지](https://solutions.lg.com/us/support/announcements-detail/notice-on-termination-of-services-of-lg-electronics-mobile-phone-software-upgrade-update-center-and-lg-bridge-USNTC20250410200140)는 전체 모바일 업데이트 서비스 종료이며 개별 모델의 마지막 OS 업데이트 날짜가 아닙니다. 출처 확인: 2026-10-18. DeskDeck이 Android 보안 지원을 연장하지는 않습니다.

## Updates ended. Its usefulness hasn’t.

Turn an **Android 5.0+ phone or tablet** into a PC touch controller even after manufacturer updates end — for apps, shortcuts, macros and media. Studio on the PC handles the main work; the Android device displays controls and sends taps. Full-screen clocks and widgets give it another role between tasks.

Physically used during development: **Galaxy S8 (SM-G950N, Android 9)** with Wi-Fi and USB AOA button actions/reconnection, and **LG G Pad 8.0 (LG-V480, Android 5.0.2)** with Wi-Fi/USB AOA, button display and reconnection after restarting Studio. These are examples, not guarantees for every model, OS or public-release feature.

Samsung’s linked SM-G950F history records the Android 9 upgrade in **2019**, with later maintenance updates; this is not a universal S8 support end date. An official LG-V480 OS support end year could not be verified. LG’s **June 30, 2025** notice concerns closure of its mobile update services, not that model’s final OS update. OS upgrades and security support are separate. [Device examples and official sources](https://thlee.github.io/deskdeck/index.en.html#reuse).

## 위젯 다운로드
[위젯 라이브러리](https://thlee.github.io/deskdeck/widgets.html) · [Widgets (English)](https://thlee.github.io/deskdeck/widgets.en.html)

코인 시세·뉴스·오델로 ZIP을 다운로드하고 Studio의 전체화면 → 위젯 관리 목록에 끌어다 놓으세요. 기본 시계·네코·미디어는 별도 다운로드 없이 사용합니다.

## 현재 배포
- DeskDeck Studio **0.8.26**, Windows 10 1809+ / Windows 11, x64.
- Android **0.5.34**, Android 5.0+. Studio에 포함하며 QR/브라우저로 설치합니다.
- JC3248W535 ESP32-S3 펌웨어 **0.8.1**. USB·Wi-Fi 및 초기 설치/백업 안내.
- 가상 DeskDeck: 별도 장치 없이 마우스나 작은 터치·보조 모니터로 사용할 수 있습니다.
- 현재 공개 버전은 무료·기간 제한 없음. 결제·계정 등록 없음. Mac/iPhone 설치파일은 제공하지 않습니다.

## 다운로드 전에
Windows 설치파일은 아직 Authenticode 서명이 없어 게시자 경고가 나타날 수 있습니다. 이 저장소의 Releases에서 받고 함께 제공하는 SHA256SUMS.txt와 대조하세요. WebView2가 없으면 설치 중 Microsoft 서버에서 내려받습니다. Android AOA의 선택적 UsbDk 드라이버는 별도 설치이며 자동 설치되지 않습니다.

## 이용 조건과 소스 범위
[공개 무료 약관](legal/EVALUATION-LICENSE.ko.txt) · [English license](legal/EVALUATION-LICENSE.en.txt) · [개인정보·통신](legal/PRIVACY.ko.txt)

이 저장소는 소개 페이지·사용 안내·바이너리 배포용입니다. Studio와 Android 자체 소스는 비공개이며, 무료 배포가 오픈소스 라이선스를 의미하지 않습니다. 라이선스상 필요한 제3자 소스, GPL 설치 어댑터, LGPL 펌웨어 재링크 자료는 설치파일 및 릴리스의 별도 소스 ZIP에 함께 제공합니다.

이미 받은 이 버전의 무료 사용권을 소급 유료화하지 않으며, 제품 양도·운영자 변경 후에도 기존 사용권은 유지됩니다.

GitHub가 자동으로 표시하는 “Source code (zip/tar.gz)”에는 **이 소개 사이트의 파일만** 들어 있습니다. 오픈소스 대응 자료는 별도 Sources ZIP을 선택하세요.

## 문의
[문제 제보](https://github.com/thlee/deskdeck/issues) · DeskDeck · deskdeck.app@gmail.com

버전, 연결 방법, 재현 순서, 오류 문구를 알려 주세요. 비밀번호·개인 설정·기기 전체 백업을 공개 이슈에 올리지 마세요. 보안 문제는 이메일로 알려 주세요.
