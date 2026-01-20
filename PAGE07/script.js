// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// 배경 이미지 + 영상 모두 로드 후 시작
// A영상 종료 시점에 B영상이 처음부터 시작되도록 타이밍 맞춤
// PC/Android: requestAnimationFrame (정밀 타이밍)
// iOS: timeupdate 이벤트 (성능 최적화)
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

    // iOS 여부 캐싱 (매번 UA 체크 방지)
    const _isIOS = isIOS();

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

    // B영상 시작 타이밍 (A영상 종료 몇 초 전)
    // iOS는 seek/play 동기화가 느려서 더 여유있는 타이밍 필요
    const B_START_BEFORE = _isIOS ? 0.15 : 0.033;
    // 네이버 버튼 + dim 오버레이 시작 타이밍 (A영상 종료 몇 초 전)
    // iOS는 애니메이션 오버헤드가 커서 B영상 시작과 시간적 분리 필요
    const BUTTON_START_BEFORE = _isIOS ? 1.5 : 0.5;

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

            // B영상을 끝에서 B_START_BEFORE초 전 위치로 이동
            loopVideo.currentTime = loopVideo.duration - B_START_BEFORE;

            if (_isIOS) {
                // iOS: seek 완료 후 opacity 변경 + play (동기화 문제 방지)
                loopVideo.addEventListener('seeked', function() {
                    loopVideo.style.opacity = '1';
                    loopVideo.play().catch(function() {});
                    console.log('[iOS] B영상 seeked 완료:', loopVideo.currentTime.toFixed(3));
                }, { once: true });
            } else {
                // Windows/Android: 기존 방식 (즉시 실행)
                loopVideo.style.opacity = '1';
                loopVideo.play().catch(function() {});
                console.log('B영상 시작 위치:', loopVideo.currentTime.toFixed(3));
            }
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

        if (_isIOS) {
            // iOS: timeupdate 이벤트 방식 (rAF보다 성능 부하 낮음)
            console.log('[iOS] timeupdate 이벤트 방식 사용');
            mainVideo.addEventListener('timeupdate', handleTimeUpdateIOS);

            // iOS: B영상 디코더 워밍업 (A영상 시작 1초 후)
            setTimeout(preplayLoopVideoIOS, 1000);
        } else {
            // Windows/Android: requestAnimationFrame (정밀 타이밍)
            animFrameId = requestAnimationFrame(checkTiming);
        }
    }

    // iOS용 timeupdate 핸들러 (rAF 대체)
    function handleTimeUpdateIOS() {
        if (!mainVideo.duration || !loopVideo.duration) return;

        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 네이버 버튼 시작
        if (!buttonStarted && remaining <= BUTTON_START_BEFORE) {
            buttonStarted = true;
            console.log('[iOS] 버튼 시작, remaining:', remaining.toFixed(3));
            if (dimOverlay) dimOverlay.classList.add('active');
            if (naverBtn) {
                naverBtn.classList.add('visible');
                // iOS: 맥동 효과 지연 (애니메이션 오버헤드 분산)
                setTimeout(function() {
                    naverBtn.classList.add('pulsing');
                }, 3000);
            }
        }

        // B영상 시작
        if (!loopStarted && remaining <= B_START_BEFORE) {
            if (loopVideo.readyState >= 3) {
                startLoopVideoIOS();
            } else {
                loopVideo.addEventListener('canplay', function() {
                    if (!loopStarted) startLoopVideoIOS();
                }, { once: true });
            }
        }
    }

    // iOS용 B영상 시작 (별도 함수로 분리)
    function startLoopVideoIOS() {
        loopStarted = true;
        console.log('[iOS] B영상 시작 준비');

        // iOS: 이미 preplay로 준비되어 있으면 즉시 보이게
        loopVideo.style.opacity = '1';
        loopVideo.play().catch(function() {});
        console.log('[iOS] B영상 재생 시작');
    }

    // iOS: B영상 미리 재생 후 일시정지 (디코더 워밍업)
    function preplayLoopVideoIOS() {
        if (!_isIOS) return;

        // B영상 처음부터 재생 준비
        loopVideo.currentTime = 0;
        loopVideo.play().then(function() {
            // 0.1초 재생 후 일시정지 (디코더 활성화)
            setTimeout(function() {
                loopVideo.pause();
                loopVideo.currentTime = 0;
                console.log('[iOS] B영상 preplay 완료 (디코더 워밍업)');
            }, 100);
        }).catch(function() {
            console.log('[iOS] B영상 preplay 실패 (autoplay 제한)');
        });
    }

    // A영상 종료 시 즉시 숨김 → B영상이 보임
    mainVideo.addEventListener('ended', function() {
        // 타이밍 체크 중지
        if (_isIOS) {
            mainVideo.removeEventListener('timeupdate', handleTimeUpdateIOS);
            console.log('[iOS] timeupdate 리스너 제거');
        } else if (animFrameId) {
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
