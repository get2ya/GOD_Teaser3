// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// PC/Android: requestAnimationFrame, iOS: timeupdate 이벤트
(function() {
    var naverBtn = document.querySelector('.naver-btn');
    var mainVideo = document.getElementById('main-video');
    var loopVideo = document.getElementById('loop-video');
    var bgGroup = document.querySelector('.background-group');
    var dimOverlay = document.getElementById('video-dim-overlay');

    if (!mainVideo || !loopVideo) return;

    // 플랫폼 감지
    function isMobile() {
        var ua = navigator.userAgent;
        return /Android/i.test(ua) || (/iPhone|iPod/i.test(ua) && !/iPad/i.test(ua));
    }

    function isIOS() {
        var ua = navigator.userAgent;
        return /iPhone|iPod/i.test(ua) && !/iPad/i.test(ua);
    }

    var _isIOS = isIOS();

    // 모바일 영상 소스 변경
    if (isMobile()) {
        mainVideo.innerHTML = '';
        loopVideo.innerHTML = '';

        if (_isIOS) {
            mainVideo.src = './resource/MV/ios_main.mov';
            loopVideo.src = './resource/MV/ios_loop.mov';
        } else {
            mainVideo.src = './resource/MV/mobile_main.webm';
            loopVideo.src = './resource/MV/mobile_loop.webm';
        }

        mainVideo.load();
        loopVideo.load();
    }

    // 플래그 & 타이밍 상수
    var loopStarted = false;
    var buttonStarted = false;
    var animFrameId = null;
    var B_START_BEFORE = _isIOS ? 0.15 : 0.033;
    var BUTTON_START_BEFORE = _isIOS ? 1.5 : 0.5;

    // 배경 이미지 프리로드
    function preloadImages() {
        return new Promise(function(resolve) {
            var images = [
                './resource/Img/bg_main.webp',
                './resource/Img/bg_change.webp',
                './resource/Img/bg_two.webp'
            ];
            var loaded = 0;

            images.forEach(function(src) {
                var img = new Image();
                img.onload = img.onerror = function() {
                    loaded++;
                    if (loaded === images.length) resolve();
                };
                img.src = src;
            });
        });
    }

    // 영상 로드 대기
    function waitForVideo(video, timeoutMs) {
        timeoutMs = timeoutMs || 15000;
        return new Promise(function(resolve) {
            if (video.readyState >= 3) {
                resolve();
                return;
            }

            var timeout = setTimeout(resolve, timeoutMs);

            video.addEventListener('canplaythrough', function() {
                clearTimeout(timeout);
                resolve();
            }, { once: true });

            video.addEventListener('error', function() {
                clearTimeout(timeout);
                resolve();
            }, { once: true });
        });
    }

    // B영상 시작
    function startLoopVideo() {
        loopStarted = true;
        loopVideo.currentTime = loopVideo.duration - B_START_BEFORE;

        if (_isIOS) {
            loopVideo.addEventListener('seeked', function() {
                loopVideo.style.opacity = '1';
                loopVideo.play().catch(function() {});
            }, { once: true });
        } else {
            loopVideo.style.opacity = '1';
            loopVideo.play().catch(function() {});
        }
    }

    // 버튼 표시
    function showButton() {
        buttonStarted = true;
        if (dimOverlay) dimOverlay.classList.add('active');
        if (naverBtn) {
            naverBtn.classList.add('visible');
            setTimeout(function() {
                naverBtn.classList.add('pulsing');
            }, _isIOS ? 3000 : 2000);
        }
    }

    // 정밀 타이밍 체크 (PC/Android)
    function checkTiming() {
        if (!mainVideo.duration || !loopVideo.duration) {
            animFrameId = requestAnimationFrame(checkTiming);
            return;
        }

        var remaining = mainVideo.duration - mainVideo.currentTime;

        if (!buttonStarted && remaining <= BUTTON_START_BEFORE) {
            showButton();
        }

        if (!loopStarted && remaining <= B_START_BEFORE) {
            if (loopVideo.readyState >= 3) {
                startLoopVideo();
            } else {
                loopVideo.addEventListener('canplay', function() {
                    if (!loopStarted) startLoopVideo();
                }, { once: true });
            }
        }

        if (!mainVideo.ended) {
            animFrameId = requestAnimationFrame(checkTiming);
        }
    }

    // iOS용 timeupdate 핸들러
    function handleTimeUpdateIOS() {
        if (!mainVideo.duration || !loopVideo.duration) return;

        var remaining = mainVideo.duration - mainVideo.currentTime;

        if (!buttonStarted && remaining <= BUTTON_START_BEFORE) {
            showButton();
        }

        if (!loopStarted && remaining <= B_START_BEFORE) {
            if (loopVideo.readyState >= 3) {
                loopStarted = true;
                loopVideo.style.opacity = '1';
                loopVideo.play().catch(function() {});
            } else {
                loopVideo.addEventListener('canplay', function() {
                    if (!loopStarted) {
                        loopStarted = true;
                        loopVideo.style.opacity = '1';
                        loopVideo.play().catch(function() {});
                    }
                }, { once: true });
            }
        }
    }

    // iOS B영상 프리플레이 (디코더 워밍업)
    function preplayLoopVideoIOS() {
        if (!_isIOS) return;
        loopVideo.currentTime = 0;
        loopVideo.play().then(function() {
            setTimeout(function() {
                loopVideo.pause();
                loopVideo.currentTime = 0;
            }, 100);
        }).catch(function() {});
    }

    // A영상 재생 시작
    function startPlayback() {
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});

        if (_isIOS) {
            mainVideo.addEventListener('timeupdate', handleTimeUpdateIOS);
            setTimeout(preplayLoopVideoIOS, 1000);
        } else {
            animFrameId = requestAnimationFrame(checkTiming);
        }
    }

    // A영상 종료 처리
    mainVideo.addEventListener('ended', function() {
        if (_isIOS) {
            mainVideo.removeEventListener('timeupdate', handleTimeUpdateIOS);
        } else if (animFrameId) {
            cancelAnimationFrame(animFrameId);
        }
        mainVideo.style.display = 'none';
    });

    // 초기화
    preloadImages().then(function() {
        if (bgGroup) bgGroup.classList.add('visible');
    });

    waitForVideo(mainVideo, 15000).then(function() {
        setTimeout(startPlayback, 700);
    });
})();
