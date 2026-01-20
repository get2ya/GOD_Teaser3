// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// 배경 이미지 + 영상 모두 로드 후 시작
// A영상 종료 시점에 B영상이 처음부터 시작되도록 타이밍 맞춤
// requestAnimationFrame으로 정밀 타이밍 (약 16ms 간격)
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');
    const dimOverlay = document.getElementById('video-dim-overlay');

    if (!mainVideo || !loopVideo) return;

    // 모바일 감지 (Android + iPhone/iPod, iPad 제외)
    function isMobile() {
        const ua = navigator.userAgent;
        // iPad는 PC 영상 사용 (화면이 충분히 큼)
        return /Android/i.test(ua) || (/iPhone|iPod/i.test(ua) && !/iPad/i.test(ua));
    }

    // iOS 감지 (iPhone/iPod만, iPad 제외)
    function isIOS() {
        const ua = navigator.userAgent;
        return /iPhone|iPod/i.test(ua) && !/iPad/i.test(ua);
    }

    // 모바일이면 영상 소스 변경
    if (isMobile()) {
        // 기존 source 태그 제거
        mainVideo.innerHTML = '';
        loopVideo.innerHTML = '';

        if (isIOS()) {
            // iOS: HEVC MOV 사용 (Safari 호환)
            mainVideo.src = '../resource/MV/GOH_title_verti_B_1.mov';
            loopVideo.src = '../resource/MV/GOH_title_verti_B_loop_1.mov';
            console.log('=== iOS 감지: HEVC MOV 영상으로 변경 ===');
        } else {
            // Android: WebM VP9 사용
            mainVideo.src = '../resource/MV/GOH_title_verti_A.webm';
            loopVideo.src = '../resource/MV/GOH_title_verti_A_loop.webm';
            console.log('=== Android 감지: WebM 영상으로 변경 ===');
        }

        // iOS에서는 load() 호출 필수
        mainVideo.load();
        loopVideo.load();
    }

    // 플래그
    let loopStarted = false;
    let animFrameId = null;

    // 배경 이미지 프리로드
    function preloadImages() {
        return new Promise(function(resolve) {
            const images = [
                '../resource/background.webp',
                '../resource/big_change.webp',
                '../resource/big_2.png'
            ];
            let loaded = 0;

            images.forEach(function(src) {
                const img = new Image();
                img.onload = img.onerror = function() {
                    loaded++;
                    if (loaded === images.length) resolve();
                };
                img.src = src;
            });
        });
    }

    // 영상 로드 대기 (타임아웃 및 에러 핸들링 포함)
    function waitForVideo(video, timeoutMs) {
        timeoutMs = timeoutMs || 15000; // 기본 15초
        return new Promise(function(resolve) {
            if (video.readyState >= 3) {
                resolve();
                return;
            }

            var timeout = setTimeout(function() {
                console.warn('영상 로드 타임아웃:', video.id);
                resolve(); // 타임아웃이어도 계속 진행
            }, timeoutMs);

            video.addEventListener('canplaythrough', function() {
                clearTimeout(timeout);
                resolve();
            }, { once: true });

            video.addEventListener('error', function(e) {
                clearTimeout(timeout);
                console.error('영상 로드 에러:', video.id, e);
                resolve(); // 에러여도 계속 진행 (배경은 보여야 함)
            }, { once: true });
        });
    }

    // B영상 시작 타이밍 (A영상 종료 몇 초 전) - 1프레임 = 약 0.033초
    const B_START_BEFORE = 0.033;
    // 네이버 버튼 + dim 오버레이 시작 타이밍 (A영상 종료 몇 초 전)
    const BUTTON_START_BEFORE = 0.5;

    // 플래그
    let buttonStarted = false;

    // 정밀 타이밍 체크 (requestAnimationFrame)
    function checkTiming() {
        if (!mainVideo.duration || !loopVideo.duration) {
            animFrameId = requestAnimationFrame(checkTiming);
            return;
        }

        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 네이버 버튼 + dim 오버레이: A영상 종료 0.5초 전에 시작
        if (!buttonStarted && remaining <= BUTTON_START_BEFORE) {
            buttonStarted = true;
            console.log('=== 네이버 버튼 + dim 오버레이 시작 ===');
            console.log('A영상 remaining:', remaining.toFixed(3));
            if (dimOverlay) {
                dimOverlay.classList.add('active');
            }
            if (naverBtn) {
                naverBtn.classList.add('visible');
                // 등장 transition 완료 후(2초) 맥동 효과 시작
                setTimeout(function() {
                    naverBtn.classList.add('pulsing');
                    console.log('=== 네이버 버튼 맥동 시작 ===');
                }, 2000);
            }
        }

        // B영상: A영상 종료 0.033초(1프레임) 전에 시작
        if (!loopStarted && remaining <= B_START_BEFORE) {
            // B영상 로드 체크 (readyState >= 3: canplay 이상)
            if (loopVideo.readyState < 3) {
                console.log('B영상 아직 로딩 중... readyState:', loopVideo.readyState);
                // 로드 완료까지 대기 후 재시도
                loopVideo.addEventListener('canplay', function() {
                    if (!loopStarted) {
                        startLoopVideo();
                    }
                }, { once: true });
                return;
            }
            startLoopVideo();
        }

        function startLoopVideo() {
            loopStarted = true;
            console.log('=== B영상 시작 ===');
            console.log('A영상 currentTime:', mainVideo.currentTime.toFixed(3));
            console.log('A영상 remaining:', (mainVideo.duration - mainVideo.currentTime).toFixed(3));
            // B영상 opacity 1로 변경 (이제서야 보이게)
            loopVideo.style.opacity = '1';
            // B영상을 끝에서 0.033초 전 위치부터 시작
            loopVideo.currentTime = loopVideo.duration - B_START_BEFORE;
            loopVideo.play().catch(function() {});
            console.log('B영상 시작 위치:', loopVideo.currentTime.toFixed(3));
        }

        // A영상이 아직 재생 중이면 계속 체크
        if (!mainVideo.ended) {
            animFrameId = requestAnimationFrame(checkTiming);
        }
    }

    // A영상 재생 시작
    function startPlayback() {
        // A영상 보이게 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
        // B영상은 초기에 숨겨둠 (A종료 0.033초 전에 opacity 1로 변경)
        // loopVideo.style.opacity는 checkTiming에서 처리
        // 정밀 타이밍 체크 시작
        animFrameId = requestAnimationFrame(checkTiming);
    }

    // A영상 종료 시 즉시 숨김 → B영상이 보임
    mainVideo.addEventListener('ended', function() {
        // 타이밍 체크 중지
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }
        // 타임라인 로그
        console.log('=== A영상 ended 이벤트 ===');
        console.log('A영상 duration:', mainVideo.duration.toFixed(3));
        console.log('A영상 currentTime:', mainVideo.currentTime.toFixed(3));
        console.log('B영상 currentTime:', loopVideo.currentTime.toFixed(3));
        // A영상 즉시 숨김 (B영상은 이미 뒤에서 재생 중)
        mainVideo.style.display = 'none';
        console.log('>>> A영상 숨김 처리 완료 <<<');
        // 네이버 버튼: 비활성화
        // if (naverBtn) {
        //     naverBtn.classList.add('visible');
        // }
    });

    // 초기화: 배경 먼저 표시, 영상은 별도로 대기 (iOS 안전장치)
    // 배경 이미지 로드 완료 시 즉시 표시 (영상 로드 실패해도 배경은 보임)
    preloadImages().then(function() {
        if (bgGroup) {
            bgGroup.classList.add('visible');
            console.log('=== 배경 이미지 로드 완료 ===');
        }
    });

    // A영상 로드 대기 후 재생 시작 (B영상은 preload="auto"로 백그라운드 다운로드)
    waitForVideo(mainVideo, 15000).then(function() {
        console.log('=== A영상 로드 완료 (또는 타임아웃) ===');
        // 배경 페이드인 완료 후(0.7초) 영상 시작
        setTimeout(startPlayback, 700);
    });
})();
