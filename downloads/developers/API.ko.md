# Baroham 위젯 API — 공개 개발 안내서

문서 개정: 2026-10-30. 권장 기준: Windows Studio 0.9.40 이상, macOS 0.9.40 build148 이상(로컬 빌드 검증 완료, 배포 여부는 공홈 확인).
두 호스트는 이 안내서와 Hello 예제의 동일한 형식을 지원합니다. 위젯은 PC의 Studio에서 실행되며 Android·ESP32·가상 화면에는 렌더링 결과가 전달됩니다. JavaScript ZIP은 Android 앱이나 ESP32 펌웨어가 아닙니다.

## 패키지

ZIP 루트에 manifest.json, main.js, settings.json과 선택적인 locales/assets를 넣으세요. 바깥 폴더로 감싸지 마세요. 변경하지 않을 고유 ID와 숫자 major.minor.patch 버전을 사용합니다. 표시 전용 스크립트는 packageVersion 1, 터치 스크립트는 3입니다. 다른 형식은 선언형 서비스이며 대체 JavaScript API가 아닙니다. 새 위젯은 Studio 수정이 아닌 선택 설치 ZIP으로 제공하세요.

Hello는 packageVersion 3, fps 1, 배경 #10252B, permissions {"https":[]}를 사용합니다. 정적 화면·시간 표시는 fps 1을 사용하고 제한된 애니메이션은 최대 12 fps까지 요청할 수 있습니다. 실제 기기의 전송 성능은 요청 프레임률을 보장하지 않습니다.

전체화면 → 위젯 관리에서 가져온 후 사용 여부와 순서를 저장합니다. 위젯 설정 편집기는 settings.json으로 생성됩니다. 저장하면 적용되고 취소하면 초안을 버립니다. 같은 ID의 더 높은 버전 ZIP으로 업데이트합니다. 같은 바이트는 변경 없음으로 처리하고, 같은 버전의 다른 바이트 또는 낮은 버전은 거부합니다. 검증 실패 시 기존 패키지를 유지합니다. 호환되는 저장 옵션은 보존하고 새 스크립트 키에는 선언된 기본값을 적용합니다. 마이그레이션 검사 없이 키 이름·유형을 바꾸거나 삭제하지 마세요.

ZIP 제한: 압축·해제 총량 각각 8 MiB, 128개 파일, 파일당 1 MiB, main.js 256 KiB. 절대경로·상위 경로 이동·심볼릭 링크·대소문자 무시 시 중복 이름은 거부합니다. 차용한 모든 자료의 출처와 라이선스를 포함하세요. 예제의 MIT 라이선스는 Studio·다른 위젯·타사 그림에 적용되지 않습니다.

## JavaScript 진입점과 그리기

`const widget = { render(api) { /* 동기식 그리기 */ } };`를 정의합니다.
import/require/npm, DOM, 직접 fetch, 파일 시스템, OS 명령 API는 없습니다. Studio가 명령을 기록·검증하고 실행 성공 후 그립니다.

- api.canvas: fillRect, strokeRect, clearRect, beginPath, closePath, moveTo, lineTo, rect, roundRect, arc, fill, stroke, clip, save, restore, translate, scale, rotate, fillText, 근삿값을 반환하는 measureText.
- 속성: fillStyle/strokeStyle (#RRGGBB), font (`[600 ]SIZEpx sans-serif` 또는 monospace), textAlign, textBaseline, lineWidth, globalAlpha.
- api.width/height: 기존 패키지는 항상 480/320입니다. `viewport: 1`을 명시적으로 요구하는 스크립트는 현재 논리 화면 크기를 받을 수 있습니다. 아래 설명을 참고하세요.
- api.contentRect: 같은 좌표계의 {x,y,width,height}. 호스트의 상단 탐색과 좌우 가장자리 탐색 영역을 제외합니다. 컨트롤은 이 안에 배치하세요.
- api.now: Unix 밀리초. 예정된 모든 프레임이 전송된다고 가정하지 말고 경과 시간으로 애니메이션을 계산하세요.
- api.language; api.t(key, fallback): locales/ko.json, en.json, ja.json, zh-Hans.json.
- api.settings: 검증된 설정. settings.json은 최대 12개 필드의 배열입니다. 각 필드는 key, type, label, default와 선택적 labelKey를 가집니다. 유형: text(최대 200자), toggle(boolean), choice(choices [{value,label,labelKey?}]), multi(선언된 HTTPS JSON 엔드포인트의 순서 있는 선택 목록; 매핑은 SDK 참조).
- api.state: 최대 32 KiB JSON 상태. 메모리 전용이며 Studio 재시작·패키지 교체·캐시 제거 시 초기화됩니다. 미리보기와 활성 화면이 공유합니다.
- api.useThemeBackground?.(): 선택된 테마를 먼저 그리도록 요청합니다. 투명한 곳에 보이며 불투명하게 그리면 가려집니다.

제한: 기록된 그리기 작업 최대 700개, save 중첩 최대 16개, worker 제한 시간 750 ms. worker는 격리되지만 OS 수준의 엄격한 메모리 한도는 아닙니다. 과도한 할당은 웹 엔진에 영향을 줄 수 있습니다. 신뢰하는 패키지만 설치하세요.

## 터치 — packageVersion 3

수동적인 미리보기에서는 api.active가 false입니다. 미리보기 프레임으로 게임 상태를 진행하지 마세요. api.inputs는 최대 32개의 {sequence,x,y} 탭 목록입니다. 처리한 sequence를 추적하고 클릭 영역을 검사하여 같은 입력을 중복 처리하지 마세요.
기존 논리 탭 범위는 x=22..457, y=48..319입니다. 우측 상단 뒤로와 좌우 탐색은 호스트 영역입니다. 별도 뒤로 버튼을 그리거나 제스처를 대체하거나 가장자리에 중요한 컨트롤을 놓지 마세요. Hello의 카드는 x32,y72,w416,h192입니다. Studio가 탐색·입력 확인·기기 전송을 담당합니다.

## HTTPS와 개인정보

permissions.https에 ["api.example.com"]처럼 정확한 호스트를 선언하세요. api.httpJson(url, intervalSeconds=10)은 캐시된 {data,updatedAt,failed}를 즉시 반환하고 호스트 GET을 예약합니다. await할 Promise가 아닙니다. 처음 data는 null이므로 로딩·오류를 표시하고 응답 형태를 검사하세요.

선언한 공개 HTTPS 엔드포인트의 443 포트만 허용하며 인증정보·쿠키·리디렉션은 허용하지 않습니다. 프레임당 요청 설명 최대 8개, 동시 진행 4개, 패키지당 초당 새 요청 1개입니다. 응답 최대 1 MiB, 갱신 간격 10초~6시간. 실패하면 캐시를 유지하고 재시도 간격을 늘립니다. 429/418 응답은 최소 60초 요청을 중지합니다.

Studio 인터넷 스위치는 패키지 HTTPS와 피드 요청을 차단하고 설정에서 켜라는 호스트 안내를 표시합니다. USB나 로컬 Wi-Fi를 끄지 않습니다. 오프라인 패키지는 인터넷 권한이 필요 없습니다. ZIP에 API 비밀키를 넣지 마세요. 카메라·마이크 수집, 임의 파일 접근, 셸 실행, 제한 없는 브라우저 열기는 제공하지 않습니다. 필요한 데이터만 요청하세요.

## 반응형 좌표 — 새로운 개발 빌드

`viewport:1`을 알리는 업데이트된 Windows/macOS Studio가 필요합니다. **공개 0.9.40 릴리스는 지원하지 않습니다.** 이전 호스트에서는 미지원 기능으로 안전하게 가져오기가 거부됩니다. 기존 패키지는 자동 적용되지 않으며 Hello는 기존 480×320 예제입니다.

```json
"hostApiVersion": 1,
"requires": {"canvas": 1, "settings": 1, "touch": 1, "viewport": 1}
```

선언형 서비스가 아닌 JavaScript 패키지(packageVersion 1 또는 3)에 사용하세요. 별도 responsive-example은 가로에서 2열, 세로에서 2행입니다. **매 render마다** api.width, api.height, api.contentRect를 읽고 크기 변경 후 위치를 다시 계산하되 게임·카운터 상태를 버리지 마세요. 터치 x/y는 같은 좌표계이며 소수일 수 있습니다. sequence 중복 처리 방지와 api.active가 false일 때 입력 무시를 유지합니다. 입력을 다시 확대·축소하지 마세요.

현재 논리 영역은 Mac/Windows 가상 화면 크기를 따릅니다. 예를 들어 600×960이면 width=600, height=960입니다. 큰 화면이라고 작은 고정 글꼴을 쓰지 마세요. Math.min(api.width/480, api.height/320) 같은 읽기 좋은 비율과 width/height로 배치를 선택하세요. 뒤로·페이지 가장자리는 호스트가 관리하며 contentRect는 보수적으로 잡은 사용 가능 영역입니다.

**호환 범위:** ESP32와 기존 Android 프로토콜은 480×320 프레임·입력 영역을 유지합니다. 이 연결에서 새 패키지는 480×320을 받고 정상적인 대체 배치를 표시해야 합니다. Android·ESP32 펌웨어·물리 프로토콜·전송 해상도를 변경하는 기능이 아닙니다. 전송/래스터 출력은 480×320(기존 저해상도 클라이언트 240×160)으로 제한되고 가상 화면에서 표시 영역에 맞춥니다. 적응형 배치 지원이지 원래 화면 해상도의 글자나 더 세밀한 픽셀을 보장하지 않습니다. Studio의 수동적 미리보기는 연결 화면의 호환 모드를 따릅니다.

절대 픽셀 위치를 무기한 저장하지 마세요. 상대 위치를 저장하거나 크기 변경 시 범위 안으로 다시 조정하세요. 상태는 미리보기와 활성 프레임이 공유하므로 배치 변경만으로 진행 상황을 초기화하면 안 됩니다. API 크기는 축당 최대 4096이며 기존 명령·상태·시간 한도도 그대로 적용됩니다.

## 패키지 이미지

api.useImageBackground("asset:assets/scene.jpg")
api.drawSprite("asset:assets/actor.webp",sx,sy,sw,sh,dx,dy,dw,dh)

단일 파일명은 ASCII 영문·숫자·밑줄·하이픈을 사용합니다. JPEG 배경과 정적 확장 WebP 스프라이트 아틀라스만 허용합니다. 최대 16개, 파일당 149,000바이트, 총 1 MiB, 최대 1024×1024. 스프라이트 원본 자르기 범위는 아틀라스 안이어야 하며 프레임당 최대 8개를 그립니다. 원격 URL, 파일 시스템 경로, 임의 글꼴, SVG를 래스터 이미지로 넘기지 마세요.

## 선택적 공통 호스트 기능

hostApiVersion:1과 requires:{"canvas":1,"system":1,...}을 선언할 수 있습니다. 동봉한 host-api.json은 버전 등록부이지 임의 API 접근 허가가 아닙니다. 전체 선언과 권한 조합은 SDK의 HOST-API.md와 예제를 참고하세요. 미지원 기능은 가져올 때 거부됩니다.

스크립트는 시스템·미디어·날씨의 읽기 전용 api.host 스냅샷을 요청할 수 있습니다. 없는 센서는 0이 아닌 null입니다. 경로, 미디어 제어 핸들, OS 명령, 위치 좌표는 노출하지 않습니다. 스냅샷과 HTTPS를 함께 쓰면 PC 메타데이터가 외부로 전송될 수 있으므로 필요한 경우에만 요청하고 설명하세요.

선언형 packageVersion2는 definition.json, 필요한 경우 defaults, settings.json:[], runtime:"declarative"를 사용하며 main.js는 없습니다.
- dashboard-v1: 검증된 시계·시스템·날씨·미디어 레이어 조합.
- news-v1: 네이티브 피드 선택·파싱과 기사 탐색.
- local-images-v1: 네이티브 폴더 선택과 읽기 전용 이미지 서비스. 기본 폴더는 비어 있어야 하며 로컬 경로를 미리 선택하지 않습니다. ZIP에는 일반 파일 접근권이 주어지지 않습니다.
이들은 명시적인 서비스 계약이며 JavaScript에서 임의로 만들 수 있는 호출이 아닙니다. 기존 native-video v4는 범용 동영상 API가 아니며, 동영상은 이미 Studio에 내장되어 있습니다.

## 검증과 공유

1. 새 ZIP을 가져와 설정의 저장·취소를 확인합니다.
2. 기본값·긴 문구·지원 언어·테마 켜기/끄기·데이터 없음 상태를 검사합니다.
3. 미리보기·활성 전체화면·반복 탭·다른 위젯으로 갔다 돌아오기를 검사합니다.
4. 온라인 데이터는 최초 로딩·오류·오프라인·Studio 인터넷 사용 끄기를 검사합니다.
5. Windows/macOS별로 가상 화면과 대상 기기를 따로 검사합니다.
6. 같은 ID의 버전을 올려 업데이트하고 이전 설정 유지 여부를 확인합니다.
7. 패키지·라이선스·최소 Studio 버전만 공유합니다. 사용자 경로/설정·비밀정보·앱 바이너리·비공개 소스를 넣지 마세요. 패키징 도구는 마켓 자동 업로드나 등록 심사를 하지 않습니다.

기존 SDK preview.html은 선언형 JSON용이며 JavaScript ZIP이나 실시간 PC 서비스용이 아닙니다. 사전 점검과 실제 실행은 Studio에서 확인하세요. 이 안내서는 독립적인 JavaScript ZIP 브라우저 미리보기를 보장하지 않습니다.
